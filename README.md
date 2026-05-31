# AgentAuth × Exa

The agent web has retrieval (Exa) and communication protocols (MCP, A2A). It does not yet have a discovery and identity layer. Agents cannot autonomously find other agents by capability at runtime, and they cannot verify each other's authorization to commit. This repo is a working prototype of both primitives composed together.

---

## What this repo contains

**AgentAuth library** (`/agentauth`)

ed25519-signed identity cards for AI agents. Two core functions: `register_agent()` issues a signed identity card. `verify_cert()` verifies one. Includes a demo CA for pre-signing a corpus of agents. Written in Python. No dependencies beyond the `cryptography` package.

**Corpus pipeline** (`/agentauth-platform/data`)

Collection and pre-signing pipeline that pulls ~1,500 MCP server entries from Smithery and awesome-mcp-servers, normalizes descriptions, deduplicates by source URL, and pre-signs every entry with the demo CA. Output: `corpus_signed.json`.

**Discovery backend** (`/agentauth-platform/backend`)

FastAPI service. Embeds the corpus using OpenAI text-embedding-3-small, stores vectors in memory, and serves a `/search` endpoint. At query time: embed the query, cosine similarity against corpus, return top 5 results with live cryptographic verification on each. Sub-300ms after warmup.

**Platform** (`/agentauth-platform/frontend`)

Three-page Next.js site. Landing page (the pitch), thesis page (the argument), demo page (live search + verification). The demo page calls the real backend. Execution after the handshake is scripted and clearly labeled as illustrative.

---

## The primitive

Discovery without identity is an open marketplace of unverified actors. Identity without discovery is a credential system with no network to secure. This prototype demonstrates both together: semantic discovery over agent manifests returns results that carry cryptographically verified identity cards. Every search result shows a Verified badge backed by a real ed25519 signature check.

The retrieval layer uses OpenAI embeddings in this prototype because Exa's current API does not support custom corpus indexing. The architecture demonstrates the primitive at small scale. Production would use Exa's neural search infrastructure to index agent manifests directly.

---

## What this is not

- Not production hardened. No certificate revocation, no key rotation, no certificate transparency.
- Not a routing platform. The prototype does not proxy agent calls.
- Not a finished product. This is a four-day build to demonstrate two primitives.
- The demo CA is for demonstration only. Do not use in production.

---

## Quick start

**Library**

```bash
cd agentauth
pip install -e .
python -m pytest tests/ -v
```

**Corpus pipeline**

```bash
cd agentauth-platform
pip install -r requirements.txt
python build_corpus.py
```

**Backend**

```bash
cd agentauth-platform/backend
OPENAI_API_KEY=your_key uvicorn main:app --port 8000
```

**Frontend**

```bash
cd agentauth-platform/frontend
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000 npm run dev
```

---

## Library usage

Issuer side:

```python
from agentauth import register_agent

identity_card, private_key = register_agent(
    agent_id="summarizer-v1",
    capabilities=["summarize", "read"],
    tools=["read", "transform"],
    endpoint_url="https://myagent.example.com"
)
```

Verifier side:

```python
from agentauth import verify_cert

result = verify_cert(identity_card)
# {"valid": True, "agent_id": "summarizer-v1", "verified_at": "...", "error": None}
```

---

## Competitive landscape

| Layer | Existing players | Gap |
|---|---|---|
| Discovery | Smithery, MCP registry, A2A agent cards | Curated lists, not semantic runtime search |
| Identity | Stytch, Proof, AgentID, IBM/Auth0/Yubico | Human-to-agent flows, not agent-to-agent peer verification |
| Composed | — | This prototype |

---

## Built with

- Python, FastAPI, OpenAI text-embedding-3-small, NumPy
- Next.js 14, Tailwind
- cryptography (ed25519)
- Built at Duke, 2026
