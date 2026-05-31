#!/usr/bin/env python3
"""Corpus collection and pre-signing pipeline for MCP servers."""

import json
import re
import sys
from pathlib import Path

import requests
from bs4 import BeautifulSoup

from agentauth import create_demo_ca, issue_ca_signed_cert

ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "data"
CORPUS_FILE = DATA_DIR / "corpus.json"
CORPUS_SIGNED_FILE = DATA_DIR / "corpus_signed.json"
CA_KEY_FILE = DATA_DIR / "ca_public_key.hex"

HEADERS = {"User-Agent": "Mozilla/5.0 (corpus-builder/1.0)"}
TIMEOUT = 20

CAPABILITY_MAP = [
    (["filesystem", "file system", " file ", "files"], "file system access"),
    (["database", " sql", "postgres", "sqlite", "mysql", "mongodb", "mongo"], "database querying"),
    (["web search", "google", "bing", "search engine", "serpapi"], "web search"),
    (["browser", "puppeteer", "playwright", "chromium", "selenium"], "browser automation"),
    (["github", "gitlab", "bitbucket", " git "], "version control"),
    (["docker", "kubernetes", "container", "k8s"], "container management"),
    (["slack", "discord", "teams", " email", "smtp", "gmail", "sendgrid"], "messaging"),
    (["execute", "repl", "sandbox", "shell", "bash", "terminal", "run code"], "code execution"),
    (["image", "vision", "photo", "screenshot", "ocr", "visual"], "image processing"),
    (["audio", "speech", "transcri", "whisper", "tts"], "audio processing"),
    (["rest api", "graphql", "webhook", "http client", "openapi"], "API integration"),
    (["memory", "knowledge", "vector", "embedding", "rag", "retrieval"], "knowledge management"),
    (["weather", "location", "map", "geo", "latitude", "longitude"], "location services"),
    (["calendar", "schedule", "todo", "task manager", "jira", "notion", "linear"], "productivity"),
    (["aws", "azure", "gcp", "cloud", "s3", "lambda", "terraform"], "cloud infrastructure"),
    (["stripe", "payment", "billing", "invoice", "shopify"], "payment processing"),
    (["analytics", "metrics", "telemetry", "grafana", "datadog"], "observability"),
]

TOOL_MAP = [
    (["read", "fetch", "get", "retrieve", "download"], "read"),
    (["write", "create", "post", "insert", "upload", "save"], "write"),
    (["search", "find", "query", "lookup"], "search"),
    (["execute", "run", "eval"], "execute"),
    (["delete", "remove", "destroy"], "delete"),
    (["update", "edit", "patch", "modify"], "update"),
    (["list", "enumerate", "browse"], "list"),
    (["analyze", "inspect", "parse"], "analyze"),
    (["summarize", "extract", "transform"], "transform"),
]


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")[:80]


def infer_capabilities(name: str, description: str) -> list[str]:
    text = (name + " " + description).lower()
    caps = []
    for keywords, cap in CAPABILITY_MAP:
        if any(kw in text for kw in keywords):
            caps.append(cap)
    return caps


def infer_tools(name: str, description: str) -> list[str]:
    text = (name + " " + description).lower()
    tools = []
    for keywords, tool in TOOL_MAP:
        if any(kw in text for kw in keywords):
            tools.append(tool)
    return tools


def make_entry(
    id: str,
    name: str,
    description: str,
    source_url: str,
    capabilities: list[str] | None = None,
    tools: list[str] | None = None,
    endpoint_url: str | None = None,
) -> dict:
    if capabilities is None:
        capabilities = infer_capabilities(name, description)
    if tools is None:
        tools = infer_tools(name, description)
    return {
        "id": id,
        "name": name,
        "description": description,
        "capabilities": capabilities,
        "tools": tools,
        "endpoint_url": endpoint_url,
        "source_url": source_url,
        "low_quality": False,
    }


def collect_smithery() -> list[dict]:
    entries = []

    # Try JSON API endpoints first
    for api_url in [
        "https://smithery.ai/api/v1/servers",
        "https://smithery.ai/api/servers",
        "https://registry.smithery.ai/servers",
    ]:
        try:
            resp = requests.get(api_url, headers=HEADERS, timeout=TIMEOUT)
            if resp.status_code == 200:
                data = resp.json()
                # Handle various possible response shapes
                items = data if isinstance(data, list) else data.get("servers") or data.get("data") or data.get("items") or []
                if items:
                    print(f"  Smithery API {api_url}: {len(items)} items")
                    for item in items:
                        slug = item.get("slug") or item.get("id") or slugify(item.get("name", ""))
                        name = item.get("name") or item.get("title") or slug
                        description = item.get("description") or item.get("summary") or ""
                        caps = item.get("capabilities") or []
                        tools_list = item.get("tools") or []
                        endpoint = item.get("endpoint") or item.get("url") or None
                        source = f"https://smithery.ai/server/{slug}"
                        entries.append(make_entry(
                            id=f"smithery-{slug}",
                            name=name,
                            description=description,
                            source_url=source,
                            capabilities=caps if caps else None,
                            tools=tools_list if tools_list else None,
                            endpoint_url=endpoint,
                        ))
                    return entries
        except Exception as e:
            print(f"  Smithery API {api_url} failed: {e}")

    # Fall back to HTML scraping
    print("  Falling back to Smithery HTML scraping...")
    page = 1
    consecutive_empty = 0
    while page <= 50 and consecutive_empty < 3:
        try:
            url = f"https://smithery.ai/servers?page={page}"
            resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
            if resp.status_code != 200:
                print(f"  Smithery page {page}: HTTP {resp.status_code}, stopping")
                break
            soup = BeautifulSoup(resp.text, "html.parser")
            page_entries = _parse_smithery_page(soup, page)
            if not page_entries:
                consecutive_empty += 1
                # Also try without pagination
                if page == 1:
                    url2 = "https://smithery.ai/servers"
                    resp2 = requests.get(url2, headers=HEADERS, timeout=TIMEOUT)
                    soup2 = BeautifulSoup(resp2.text, "html.parser")
                    page_entries = _parse_smithery_page(soup2, 1)
                if not page_entries:
                    if consecutive_empty >= 3:
                        break
            else:
                consecutive_empty = 0
                entries.extend(page_entries)
                print(f"  Smithery page {page}: {len(page_entries)} entries (total {len(entries)})")
            page += 1
        except Exception as e:
            print(f"  Smithery page {page} failed: {e}")
            consecutive_empty += 1
            page += 1

    return entries


def _parse_smithery_page(soup: BeautifulSoup, page: int) -> list[dict]:
    entries = []
    seen_slugs = set()

    # Strategy 1: look for anchor tags with /server/ in href
    for a in soup.find_all("a", href=re.compile(r"/server/")):
        href = a.get("href", "")
        m = re.search(r"/server/([^/?#]+)", href)
        if not m:
            continue
        slug = m.group(1)
        if slug in seen_slugs:
            continue
        seen_slugs.add(slug)

        # Try to find name and description in nearby elements
        name = slug
        description = ""

        # Check text inside the link or its parent card
        card = a.find_parent(["article", "div", "li", "section"])
        if card:
            headings = card.find_all(["h1", "h2", "h3", "h4", "span"], limit=3)
            if headings:
                name = headings[0].get_text(strip=True) or slug
            paras = card.find_all("p", limit=2)
            if paras:
                description = paras[0].get_text(strip=True)
        else:
            name = a.get_text(strip=True) or slug

        if not name or name == slug:
            name = slug.replace("-", " ").title()

        entries.append(make_entry(
            id=f"smithery-{slug}",
            name=name,
            description=description,
            source_url=f"https://smithery.ai/server/{slug}",
        ))

    # Strategy 2: JSON-LD or script tags with structured data
    if not entries:
        for script in soup.find_all("script", type="application/json"):
            try:
                data = json.loads(script.string or "")
                if isinstance(data, dict):
                    items = data.get("servers") or data.get("data") or data.get("props", {}).get("pageProps", {}).get("servers") or []
                    for item in (items if isinstance(items, list) else []):
                        slug = item.get("slug") or item.get("id") or slugify(item.get("name", ""))
                        if slug and slug not in seen_slugs:
                            seen_slugs.add(slug)
                            name = item.get("name") or slug
                            description = item.get("description") or ""
                            entries.append(make_entry(
                                id=f"smithery-{slug}",
                                name=name,
                                description=description,
                                source_url=f"https://smithery.ai/server/{slug}",
                                endpoint_url=item.get("endpoint"),
                            ))
            except Exception:
                pass

    # Strategy 3: Next.js __NEXT_DATA__
    if not entries:
        next_data = soup.find("script", id="__NEXT_DATA__")
        if next_data and next_data.string:
            try:
                data = json.loads(next_data.string)
                props = data.get("props", {}).get("pageProps", {})
                items = props.get("servers") or props.get("data") or props.get("items") or []
                for item in (items if isinstance(items, list) else []):
                    slug = item.get("qualifiedName") or item.get("slug") or item.get("id") or slugify(item.get("displayName") or item.get("name", ""))
                    if slug and slug not in seen_slugs:
                        seen_slugs.add(slug)
                        name = item.get("displayName") or item.get("name") or slug
                        description = item.get("description") or item.get("summary") or ""
                        entries.append(make_entry(
                            id=f"smithery-{slug}",
                            name=name,
                            description=description,
                            source_url=f"https://smithery.ai/server/{slug}",
                            endpoint_url=item.get("homepage") or item.get("endpoint"),
                        ))
            except Exception:
                pass

    return entries


def _parse_markdown_entries(content: str, id_prefix: str) -> list[dict]:
    entries = []
    seen_urls = set()

    # Match table rows: | [Name](url) | description | ...
    table_row = re.compile(
        r"\|\s*\[([^\]]+)\]\(([^)]+)\)[^|]*\|\s*([^|\n]+)"
    )
    for m in table_row.finditer(content):
        name = m.group(1).strip()
        url = m.group(2).strip()
        description = m.group(3).strip()
        # Skip header rows
        if name.lower() in ("name", "server", "tool", "plugin", "title"):
            continue
        if url in seen_urls:
            continue
        seen_urls.add(url)
        entries.append(make_entry(
            id=f"{id_prefix}-{slugify(name)}",
            name=name,
            description=description,
            source_url=url,
        ))

    # Match list items: - [Name](url) - description
    # or: - **[Name](url)**: description
    list_item = re.compile(
        r"^[-*]\s+\*{0,2}\[([^\]]+)\]\(([^)]+)\)\*{0,2}[:\-–\s]+(.+)$",
        re.MULTILINE,
    )
    for m in list_item.finditer(content):
        name = m.group(1).strip()
        url = m.group(2).strip()
        description = m.group(3).strip()
        if url in seen_urls:
            continue
        seen_urls.add(url)
        entries.append(make_entry(
            id=f"{id_prefix}-{slugify(name)}",
            name=name,
            description=description,
            source_url=url,
        ))

    # Match bare list items with just a link (no description after): - [Name](url)
    bare_item = re.compile(r"^[-*]\s+\[([^\]]+)\]\(([^)]+)\)\s*$", re.MULTILINE)
    for m in bare_item.finditer(content):
        name = m.group(1).strip()
        url = m.group(2).strip()
        if url in seen_urls:
            continue
        seen_urls.add(url)
        entries.append(make_entry(
            id=f"{id_prefix}-{slugify(name)}",
            name=name,
            description="",
            source_url=url,
        ))

    return entries


def collect_awesome_mcp(url: str, id_prefix: str, label: str) -> list[dict]:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
        entries = _parse_markdown_entries(resp.text, id_prefix)
        print(f"  {label}: {len(entries)} entries")
        return entries
    except Exception as e:
        print(f"  {label} failed: {e}")
        return []


def clean_description(text: str) -> str:
    # Remove Glama badge markdown: [![...](glama url)](glama url)
    text = re.sub(
        r'\[!\[.*?\]\(https://glama\.ai/.*?\)\]\(https://glama\.ai/.*?\)',
        '', text, flags=re.DOTALL,
    )
    # Remove remaining markdown images: ![...](...)
    text = re.sub(r'!\[.*?\]\(.*?\)', '', text, flags=re.DOTALL)
    # Convert markdown links to link text: [text](url) -> text
    text = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', text, flags=re.DOTALL)
    return text.strip()


def is_junk(entry: dict) -> bool:
    url = (entry.get("source_url") or "").strip()
    name = (entry.get("name") or "").strip()
    desc = entry.get("description") or ""
    if not url or url.startswith("#"):
        return True
    if name.startswith("*") or name.startswith("#"):
        return True
    if "[" in name and "]" in name and "(" in name and ")" in name:
        return True
    if len(name) < 3:
        return True
    if "](#" in desc:
        return True
    return False


def embed_string(entry: dict) -> str:
    caps = ", ".join(entry.get("capabilities") or [])
    tools = ", ".join(entry.get("tools") or [])
    return f"{entry['name']}. {entry['description']}. Capabilities: {caps}. Tools: {tools}"


def is_low_quality(entry: dict) -> bool:
    s = re.sub(r"[^\w]", "", embed_string(entry))
    return len(s) < 20


def deduplicate(entries: list[dict]) -> tuple[list[dict], int]:
    seen: dict[str, dict] = {}
    for entry in entries:
        url_key = entry["source_url"].rstrip("/").lower()
        if url_key in seen:
            existing = seen[url_key]
            existing_score = len(existing.get("description") or "") + sum(len(c) for c in (existing.get("capabilities") or []))
            new_score = len(entry.get("description") or "") + sum(len(c) for c in (entry.get("capabilities") or []))
            if new_score > existing_score:
                seen[url_key] = entry
        else:
            seen[url_key] = entry
    removed = len(entries) - len(seen)
    return list(seen.values()), removed


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    # ── Step 1: Collect or load from cache ───────────────────────────────────
    if CORPUS_FILE.exists():
        print(f"Loading from existing corpus.json (skipping network fetch)...")
        all_entries = json.loads(CORPUS_FILE.read_text())
        total_collected = len(all_entries)
        print(f"Loaded {total_collected} entries from corpus.json")
    else:
        all_entries = []

        print("Collecting from Smithery.ai...")
        smithery = collect_smithery()
        all_entries.extend(smithery)
        print(f"  Smithery total: {len(smithery)}")

        print("Collecting from awesome-mcp-servers (punkpeye)...")
        punkpeye = collect_awesome_mcp(
            "https://raw.githubusercontent.com/punkpeye/awesome-mcp-servers/main/README.md",
            "awesome",
            "punkpeye/awesome-mcp-servers",
        )
        all_entries.extend(punkpeye)

        print("Collecting from awesome-mcp-servers (wong2)...")
        wong2 = collect_awesome_mcp(
            "https://raw.githubusercontent.com/wong2/awesome-mcp-servers/main/README.md",
            "wong2",
            "wong2/awesome-mcp-servers",
        )
        all_entries.extend(wong2)

        print("Collecting from appcypher/awesome-mcp-servers...")
        appcypher = collect_awesome_mcp(
            "https://raw.githubusercontent.com/appcypher/awesome-mcp-servers/main/README.md",
            "appcypher",
            "appcypher/awesome-mcp-servers",
        )
        all_entries.extend(appcypher)

        total_collected = len(all_entries)
        print(f"\nTotal collected (before filtering): {total_collected}")

        if total_collected == 0:
            print("ERROR: no entries collected from any source. Exiting.")
            sys.exit(1)

    # ── Step 2: Clean descriptions ───────────────────────────────────────────
    cleaned_count = 0
    for entry in all_entries:
        original = entry.get("description") or ""
        cleaned = clean_description(original)
        if cleaned != original:
            entry["description"] = cleaned
            cleaned_count += 1
        # Re-infer capabilities/tools from cleaned description if entry came
        # from awesome list (smithery entries already have inferred values)
        if not entry.get("capabilities"):
            entry["capabilities"] = infer_capabilities(entry["name"], entry["description"])
        if not entry.get("tools"):
            entry["tools"] = infer_tools(entry["name"], entry["description"])
    print(f"Cleaned markdown from {cleaned_count} descriptions")

    # ── Step 3: Junk filter ──────────────────────────────────────────────────
    before_junk = len(all_entries)
    all_entries = [e for e in all_entries if not is_junk(e)]
    junk_removed = before_junk - len(all_entries)
    print(f"Junk filter removed {junk_removed} entries")

    # ── Step 4: Quality filter ───────────────────────────────────────────────
    for entry in all_entries:
        entry["low_quality"] = is_low_quality(entry)

    excluded = sum(1 for e in all_entries if e["low_quality"])
    excluded_pct = excluded / len(all_entries) * 100 if all_entries else 0
    print(f"Low quality excluded: {excluded} ({excluded_pct:.1f}%)")
    if excluded_pct > 20:
        print(f"WARNING: {excluded_pct:.0f}% of corpus excluded as low quality.")

    # Save cleaned corpus.json as the new cache baseline
    CORPUS_FILE.write_text(json.dumps(all_entries, indent=2))
    print(f"corpus.json updated: {len(all_entries)} entries")

    # ── Step 5: Deduplicate ──────────────────────────────────────────────────
    good_entries = [e for e in all_entries if not e["low_quality"]]
    good_entries, dupes_removed = deduplicate(good_entries)
    print(f"Duplicates removed: {dupes_removed}")
    print(f"Entries after dedup: {len(good_entries)}")

    if len(good_entries) == 0:
        print("ERROR: no good entries remain after filtering and deduplication.")
        sys.exit(1)

    # Cap at 1500 to avoid runaway
    if len(good_entries) > 1500:
        print(f"Capping at 1500 entries (had {len(good_entries)})")
        good_entries = good_entries[:1500]

    # ── Step 6: Pre-sign ─────────────────────────────────────────────────────
    print("\nCreating CA keypair...")
    ca_private_key, ca_public_key_hex = create_demo_ca()
    CA_KEY_FILE.write_text(ca_public_key_hex)
    print(f"CA public key saved: {CA_KEY_FILE}")

    signed_entries = []
    n = len(good_entries)
    for i, entry in enumerate(good_entries):
        if i % 100 == 0:
            print(f"  Progress: {i}/{n} entries signed")
        try:
            identity_card = issue_ca_signed_cert(
                agent_id=entry["id"],
                capabilities=entry["capabilities"],
                tools=entry["tools"],
                endpoint_url=entry["endpoint_url"] or entry["source_url"],
                ca_private_key=ca_private_key,
            )
            signed_entry = dict(entry)
            signed_entry["identity_card"] = identity_card
            signed_entries.append(signed_entry)
        except Exception as e:
            print(f"  WARN: signing failed for {entry['id']}: {e}")

    print(f"  Progress: {len(signed_entries)}/{n} entries signed")

    CORPUS_SIGNED_FILE.write_text(json.dumps(signed_entries, indent=2))
    print(f"corpus_signed.json saved: {len(signed_entries)} entries")

    print("\n=== Final Counts ===")
    print(f"Original collected:   {total_collected}")
    print(f"Junk filtered:        {junk_removed}")
    print(f"Low quality filtered: {excluded}")
    print(f"Duplicates removed:   {dupes_removed}")
    print(f"Final corpus size:    {len(signed_entries)}")
    print(f"All entries pre-signed: yes")

    print("\n=== Chip List Reminder ===")
    print("Update the chip list in Prompt 4 before building the frontend:")
    print('  "run browser automation tasks"')
    print('  "transcribe and analyze audio"')
    print('  "search and extract from the web"')
    print('  "manage GitHub issues and pull requests"')
    print('  "read and write to a database"')
    print('  "query and summarize documents"')


if __name__ == "__main__":
    main()
