import json
from datetime import datetime, timezone

from cryptography.hazmat.primitives.asymmetric.ed25519 import (
    Ed25519PrivateKey,
    Ed25519PublicKey,
)
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat, PrivateFormat, NoEncryption


def _canonical(d: dict) -> bytes:
    return json.dumps(d, sort_keys=True, separators=(",", ":")).encode("utf-8")


def _pub_hex(private_key: Ed25519PrivateKey) -> str:
    return private_key.public_key().public_bytes(Encoding.Raw, PublicFormat.Raw).hex()


def _priv_bytes(private_key: Ed25519PrivateKey) -> bytes:
    return private_key.private_bytes(Encoding.Raw, PrivateFormat.Raw, NoEncryption())


def register_agent(
    agent_id: str,
    capabilities: list[str],
    tools: list[str],
    endpoint_url: str,
    private_key: Ed25519PrivateKey | None = None,
) -> tuple[dict, Ed25519PrivateKey]:
    generated = private_key is None
    if generated:
        private_key = Ed25519PrivateKey.generate()

    payload = {
        "agent_id": agent_id,
        "capabilities": capabilities,
        "endpoint_url": endpoint_url,
        "issued_at": datetime.now(timezone.utc).isoformat(),
        "public_key": _pub_hex(private_key),
        "tools": tools,
    }
    sig = private_key.sign(_canonical(payload)).hex()
    payload["signature"] = sig
    return payload, private_key


def verify_cert(identity_card: object, ca_public_key: str | None = None) -> dict:
    try:
        required = {
            "agent_id": str,
            "issued_at": str,
            "public_key": str,
            "signature": str,
        }
        if not isinstance(identity_card, dict):
            return {
                "valid": False,
                "agent_id": None,
                "verified_at": None,
                "error": "malformed identity card: not a dict",
            }
        for field, expected_type in required.items():
            if field not in identity_card:
                return {
                    "valid": False,
                    "agent_id": None,
                    "verified_at": None,
                    "error": f"malformed identity card: missing or invalid field {field}",
                }
            if not isinstance(identity_card[field], expected_type):
                return {
                    "valid": False,
                    "agent_id": None,
                    "verified_at": None,
                    "error": f"malformed identity card: missing or invalid field {field}",
                }

        card = dict(identity_card)
        signature = card.pop("signature")
        # also remove ca_signature from payload before verifying self-sig
        ca_signature = card.pop("ca_signature", None)
        ca_public_key_field = card.pop("ca_public_key", None)

        pub = Ed25519PublicKey.from_public_bytes(bytes.fromhex(card["public_key"]))
        pub.verify(bytes.fromhex(signature), _canonical(card))

        if ca_public_key is not None:
            if ca_signature is None:
                return {
                    "valid": False,
                    "agent_id": identity_card.get("agent_id"),
                    "verified_at": None,
                    "error": "ca_public_key provided but ca_signature missing from identity card",
                }
            # rebuild card as it was when CA signed it (sans ca_signature)
            ca_payload = dict(card)
            ca_payload["signature"] = signature
            if ca_public_key_field is not None:
                ca_payload["ca_public_key"] = ca_public_key_field
            ca_pub = Ed25519PublicKey.from_public_bytes(bytes.fromhex(ca_public_key))
            ca_pub.verify(bytes.fromhex(ca_signature), _canonical(ca_payload))

        return {
            "valid": True,
            "agent_id": identity_card["agent_id"],
            "verified_at": datetime.now(timezone.utc).isoformat(),
            "error": None,
        }
    except Exception as exc:
        return {
            "valid": False,
            "agent_id": None,
            "verified_at": None,
            "error": str(exc),
        }


def create_demo_ca() -> tuple[Ed25519PrivateKey, str]:
    ca_private_key = Ed25519PrivateKey.generate()
    ca_public_key_hex = _pub_hex(ca_private_key)
    return ca_private_key, ca_public_key_hex


def issue_ca_signed_cert(
    agent_id: str,
    capabilities: list[str],
    tools: list[str],
    endpoint_url: str,
    ca_private_key: Ed25519PrivateKey,
) -> dict:
    card, _ = register_agent(agent_id, capabilities, tools, endpoint_url)
    card["ca_public_key"] = _pub_hex(ca_private_key)
    # sign everything in the card except ca_signature itself
    ca_sig = ca_private_key.sign(_canonical(card)).hex()
    card["ca_signature"] = ca_sig
    return card
