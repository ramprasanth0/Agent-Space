import pytest
pytest.skip("Skipping this test file", allow_module_level=True)

from fastapi.testclient import TestClient
from backend.main import app  # adjust import as needed


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_home(client):
    resp = client.get("/")
    assert resp.status_code == 200
    assert resp.json() == {"message": "Hello, World!"}


def test_chat_perplexity(monkeypatch, client):
    from backend.agents.perplexity import PerplexityAgent

    # Mock get_response to return static string
    async def mock_get_response(message, history=None):
        return "FAKE-PERPLEXITY"

    monkeypatch.setattr(PerplexityAgent, "get_response", mock_get_response)

    payload = {
        "message": "test message",
        "history": [{"role": "user", "content": "previous message"}],
        "mode": "conversation"
    }
    resp = client.post("/chat/perplexity", json=payload)
    assert resp.status_code == 200
    assert resp.json() == {"provider": "perplexity", "response": "FAKE-PERPLEXITY"}


def test_chat_gemini(monkeypatch, client):
    from backend.agents.gemini import GeminiAgent

    def mock_get_response(message, history=None):
        return "FAKE-GEMINI"

    monkeypatch.setattr(GeminiAgent, "get_response", mock_get_response)

    payload = {
        "message": "test message",
        "history": [{"role": "user", "content": "previous message"}],
        "mode": "conversation"
    }
    resp = client.post("/chat/gemini", json=payload)
    assert resp.status_code == 200
    assert resp.json() == {"provider": "gemini", "response": "FAKE-GEMINI"}


def test_chat_deepseek(monkeypatch, client):
    from backend.agents.open_router import OpenRouterAgent

    async def mock_get_response(message, model="R1", history=None):
        return "FAKE-DEEPSEEK"

    monkeypatch.setattr(OpenRouterAgent, "get_response", mock_get_response)

    payload = {
        "message": "test message",
        "history": [{"role": "user", "content": "previous message"}],
        "mode": "conversation"
    }
    resp = client.post("/chat/deepseek", json=payload)
    assert resp.status_code == 200
    assert resp.json() == {"provider": "deepseek", "response": "FAKE-DEEPSEEK"}


def test_chat_qwen(monkeypatch, client):
    from backend.agents.open_router import OpenRouterAgent

    async def mock_get_response(message, model="Qwen", history=None):
        return "FAKE-QWEN"

    monkeypatch.setattr(OpenRouterAgent, "get_response", mock_get_response)

    payload = {
        "message": "test message",
        "history": [{"role": "user", "content": "previous message"}],
        "mode": "conversation"
    }
    resp = client.post("/chat/qwen", json=payload)
    assert resp.status_code == 200
    assert resp.json() == {"provider": "qwen", "response": "FAKE-QWEN"}


def test_chat_multi_agent(monkeypatch, client):
    from backend.agents.multi_agent_orchestrator import MultiAgentOrchestrator

    async def mock_get_responses(message, agents):
        return [{"provider": agent, "response": f"{agent.upper()} RESPONSE"} for agent in agents]

    monkeypatch.setattr(MultiAgentOrchestrator, "get_responses", mock_get_responses)

    payload = {
        "message": "multi-agent test",
        "agents": ["perplexity", "gemini"]
    }
    resp = client.post("/chat/multi_agent", json=payload)
    assert resp.status_code == 200
    expected = [
        {"provider": "perplexity", "response": "PERPLEXITY RESPONSE"},
        {"provider": "gemini", "response": "GEMINI RESPONSE"}
    ]
    assert resp.json() == expected
