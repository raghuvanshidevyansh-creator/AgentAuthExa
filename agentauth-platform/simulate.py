import requests
import json

BACKEND_URL = "http://localhost:8000/"

queries = [
    # Chips
    "run browser automation tasks",
    "transcribe and analyze audio",
    "search and extract from the web",
    "manage GitHub issues and pull requests",
    "read and write to a database",
    "automate my browser",
    # Ishan queries
    "find agents that can browse the internet",
    "semantic search over my codebase",
    "read and write to postgres",
    "turn a YouTube video into a summary",
    "send emails",
    "query my calendar",
    "search the web for recent news",
    "analyze a CSV file",
    "talk to other AI models",
    # Adversarial
    "what can you actually do",
    "agent",
    "help",
    "MCP",
    "Exa",
    "find me the best agent",
    "I need something that does everything",
]

def color(score):
    if score >= 0.75: return "GREEN"
    if score >= 0.60: return "GREEN"
    if score >= 0.55: return "YELLOW"
    if score >= 0.45: return "RED"
    return "RED"

for query in queries:
    print("=" * 70)
    print(f"Query: {query}")
    
    try:
        r = requests.post(
            f"{BACKEND_URL}/search",
            json={"query": query},
            timeout=15
        )
        data = r.json()
        
        if r.status_code != 200:
            print(f"ERROR: {r.status_code} — {data}")
            print("-" * 70)
            continue

        print(f"Query time: {data.get('query_time_ms', '?')}ms")
        results = data.get("results", [])
        top_score = results[0]["similarity_score"] if results else 0
        low_conf = top_score < 0.55
        print(f"Low confidence: {'YES (' + str(top_score) + ')' if low_conf else 'no'}")
        print()

        for i, r in enumerate(results, 1):
            score = r["similarity_score"]
            verified = r.get("verification", {})
            if verified.get("valid"):
                badge = "✓ verified"
            elif verified.get("error"):
                badge = f"— unavailable ({verified['error']})"
            else:
                badge = "⚠ unverified"

            print(f"  Result {i}")
            print(f"  Name:         {r['name']}")
            print(f"  Description:  {r['description']}")
            print(f"  Capabilities: {', '.join(r.get('capabilities', []))}")
            print(f"  Tools:        {', '.join(r.get('tools', []))}")
            print(f"  Score:        {score} [{color(score)}]")
            print(f"  Verified:     {badge}")
            print(f"  Source:       {r.get('source_url', '')}")
            print()

    except requests.exceptions.Timeout:
        print("TIMEOUT — backend did not respond in 15 seconds")
    except Exception as e:
        print(f"ERROR — {e}")
    
    print("-" * 70)
    print()