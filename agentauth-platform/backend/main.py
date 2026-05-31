import asyncio
import json
import logging
import os
import sys
import time
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import numpy as np
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from openai import AsyncOpenAI
from pydantic import BaseModel

from agentauth import verify_cert

CORPUS_PATH = Path(os.getenv("CORPUS_PATH", "/data/corpus_signed.json"))
DATA_DIR = CORPUS_PATH.parent
NPY_PATH = DATA_DIR / "embeddings_cache.npy"
INDEX_PATH = DATA_DIR / "embeddings_index.json"
EMBED_MODEL = "text-embedding-3-small"
BATCH_SIZE = 100
TOP_K = 5

log = logging.getLogger("uvicorn.error")


class SearchRequest(BaseModel):
    query: str


class VerificationResult(BaseModel):
    valid: bool
    verified_at: str | None
    error: str | None


class SearchResult(BaseModel):
    id: str
    name: str
    description: str
    capabilities: list[str]
    tools: list[str]
    source_url: str
    similarity_score: float
    identity_card: dict[str, Any]
    verification: VerificationResult


class SearchResponse(BaseModel):
    results: list[SearchResult]
    query_time_ms: int


class HealthResponse(BaseModel):
    status: str
    corpus_size: int


def make_embed_string(entry: dict) -> str:
    caps = ", ".join(entry.get("capabilities") or [])
    tools = ", ".join(entry.get("tools") or [])
    return f"{entry['name']}. {entry['description']}. Capabilities: {caps}. Tools: {tools}"


async def build_embeddings(client: AsyncOpenAI, corpus: list[dict]) -> np.ndarray:
    texts = [make_embed_string(e) for e in corpus]
    vecs: list[list[float]] = []
    for i in range(0, len(texts), BATCH_SIZE):
        batch = texts[i : i + BATCH_SIZE]
        resp = await client.embeddings.create(model=EMBED_MODEL, input=batch)
        ordered = sorted(resp.data, key=lambda x: x.index)
        vecs.extend(item.embedding for item in ordered)
        log.info("Embedded %d/%d entries", min(i + BATCH_SIZE, len(texts)), len(texts))
    matrix = np.array(vecs, dtype=np.float64)
    norms = np.linalg.norm(matrix, axis=1, keepdims=True)
    return (matrix / norms).astype(np.float32)


def cosine_search(
    matrix: np.ndarray,
    query_vec: np.ndarray,
    k: int = TOP_K,
) -> list[tuple[int, float]]:
    scores = matrix @ query_vec
    top_idx = np.argpartition(scores, -k)[-k:]
    top_idx = top_idx[np.argsort(scores[top_idx])[::-1]]
    return [(int(i), float(scores[i])) for i in top_idx]


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Loading corpus from %s", CORPUS_PATH)
    corpus: list[dict] = json.loads(CORPUS_PATH.read_text())
    log.info("Corpus loaded: %d entries", len(corpus))

    ca_public_key = (CORPUS_PATH.parent / "ca_public_key.hex").read_text().strip()

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        log.error("OPENAI_API_KEY is not set")
        sys.exit(1)
    client = AsyncOpenAI(api_key=api_key)

    corpus_ids = [e["id"] for e in corpus]
    cache_valid = (
        NPY_PATH.exists()
        and INDEX_PATH.exists()
        and json.loads(INDEX_PATH.read_text()) == corpus_ids
    )

    if cache_valid:
        log.info("Loading embeddings from cache: %s", NPY_PATH)
        embeddings: np.ndarray = np.load(str(NPY_PATH))
    else:
        log.info("Building embeddings for %d entries (no valid cache)...", len(corpus))
        try:
            embeddings = await build_embeddings(client, corpus)
        except Exception as exc:
            log.error("Failed to build embeddings at startup: %s", exc)
            await client.close()
            sys.exit(1)
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        np.save(str(NPY_PATH), embeddings)
        INDEX_PATH.write_text(json.dumps(corpus_ids))
        log.info("Embeddings cached to %s", NPY_PATH)

    log.info("Startup complete. corpus=%d embeddings=%s", len(corpus), embeddings.shape)

    app.state.corpus = corpus
    app.state.embeddings = embeddings
    app.state.ca_public_key = ca_public_key
    app.state.openai_client = client

    yield

    await client.close()
    log.info("Shutdown complete")


STATIC_DIR = Path(__file__).parent / "static"

app = FastAPI(title="AgentAuth Discovery", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/", include_in_schema=False)
async def index():
    return FileResponse(str(STATIC_DIR / "index.html"))


@app.get("/health", response_model=HealthResponse)
async def health(request: Request) -> HealthResponse:
    return HealthResponse(status="ok", corpus_size=len(request.app.state.corpus))


@app.post("/search", response_model=SearchResponse)
async def search(body: SearchRequest, request: Request):
    query = body.query.strip()
    if not query:
        return JSONResponse(
            status_code=400,
            content={"error": "query is required", "detail": None},
        )
    if len(query) > 500:
        return JSONResponse(
            status_code=400,
            content={"error": "query exceeds 500 character limit", "detail": None},
        )

    t0 = time.perf_counter()
    state = request.app.state
    client: AsyncOpenAI = state.openai_client

    try:
        resp = await asyncio.wait_for(
            client.embeddings.create(model=EMBED_MODEL, input=[query]),
            timeout=8.0,
        )
    except asyncio.TimeoutError:
        return JSONResponse(
            status_code=503,
            content={
                "error": "embedding service timeout",
                "detail": "OpenAI did not respond within 8 seconds. Try again.",
            },
        )
    except Exception as exc:
        log.warning("OpenAI error during search: %s", exc)
        return JSONResponse(
            status_code=503,
            content={"error": "embedding service unavailable", "detail": str(exc)},
        )

    raw_vec = np.array(resp.data[0].embedding, dtype=np.float64)
    query_vec = (raw_vec / np.linalg.norm(raw_vec)).astype(np.float32)

    hits = cosine_search(state.embeddings, query_vec)

    results = []
    for idx, score in hits:
        entry = state.corpus[idx]
        v = verify_cert(entry["identity_card"], state.ca_public_key)
        results.append(
            SearchResult(
                id=entry["id"],
                name=entry["name"],
                description=entry["description"],
                capabilities=entry.get("capabilities") or [],
                tools=entry.get("tools") or [],
                source_url=entry.get("source_url") or "",
                similarity_score=round(score, 6),
                identity_card=entry["identity_card"],
                verification=VerificationResult(
                    valid=v["valid"],
                    verified_at=v.get("verified_at"),
                    error=v.get("error"),
                ),
            )
        )

    query_time_ms = int((time.perf_counter() - t0) * 1000)
    return SearchResponse(results=results, query_time_ms=query_time_ms)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=False,
    )
