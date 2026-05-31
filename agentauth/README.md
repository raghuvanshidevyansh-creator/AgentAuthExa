# AgentAuth

AgentAuth signs and verifies ed25519-based identity cards for AI agents.

## Install

```bash
pip install agentauth
```

Or from source:

```bash
pip install -e .
```

## Issuer side

```python
from agentauth import register_agent

card, private_key = register_agent(
    agent_id="my-agent",
    capabilities=["read", "summarize"],
    tools=["search", "fetch"],
    endpoint_url="https://myagent.example.com",
)
# card is a dict — serialize and share it with verifiers
```

## Verifier side

```python
from agentauth import verify_cert

result = verify_cert(card)
if result["valid"]:
    print("Trusted agent:", result["agent_id"])
else:
    print("Rejected:", result["error"])
```

## What this is not

- Not production hardened. The crypto is real but the trust model is not audited.
- No revocation. A valid card stays valid forever once issued.
- The demo CA (`create_demo_ca`, `issue_ca_signed_cert`) is for testing only. There is no CA infrastructure, no certificate chain, and no root of trust.
- Do not use in production without a proper PKI and threat model review.
