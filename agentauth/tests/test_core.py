import copy
import pytest
from agentauth import register_agent, verify_cert, create_demo_ca, issue_ca_signed_cert


def test_roundtrip():
    card, _ = register_agent("agent-1", ["read"], ["search"], "https://example.com/agent")
    result = verify_cert(card)
    assert result["valid"] is True
    assert result["agent_id"] == "agent-1"
    assert result["error"] is None
    assert result["verified_at"] is not None


def test_tampered_payload_fails():
    card, _ = register_agent("agent-2", ["write"], ["edit"], "https://example.com/agent2")
    tampered = copy.deepcopy(card)
    tampered["agent_id"] = "evil-agent"
    result = verify_cert(tampered)
    assert result["valid"] is False


def test_ca_signing_works():
    ca_private_key, ca_public_key = create_demo_ca()
    card = issue_ca_signed_cert("agent-3", ["read"], ["search"], "https://example.com/agent3", ca_private_key)
    result = verify_cert(card, ca_public_key=ca_public_key)
    assert result["valid"] is True
    assert result["agent_id"] == "agent-3"


def test_missing_field_returns_error_dict_not_exception():
    result = verify_cert({})
    assert result["valid"] is False
    assert "malformed" in result["error"]
    assert result["verified_at"] is None


def test_wrong_field_type_returns_error_dict_not_exception():
    card, _ = register_agent("agent-4", ["read"], ["search"], "https://example.com/agent4")
    bad = copy.deepcopy(card)
    bad["agent_id"] = 12345  # should be str
    result = verify_cert(bad)
    assert result["valid"] is False
    assert "malformed" in result["error"]
    assert result["verified_at"] is None


def test_tampered_ca_cert_fails():
    ca_private_key, ca_public_key = create_demo_ca()
    card = issue_ca_signed_cert("agent-5", ["read"], ["search"], "https://example.com/agent5", ca_private_key)
    tampered = copy.deepcopy(card)
    tampered["agent_id"] = "evil-agent"
    result = verify_cert(tampered, ca_public_key=ca_public_key)
    assert result["valid"] is False


def test_verify_never_raises_on_garbage():
    for bad_input in [None, 42, "string", [], b"bytes", {"agent_id": None, "public_key": 1, "signature": [], "issued_at": {}}]:
        result = verify_cert(bad_input)
        assert result["valid"] is False
        assert result["verified_at"] is None
