import pytest
import httpx
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


@pytest.mark.asyncio
async def test_stream_perplexity():
    async with httpx.AsyncClient(timeout=None) as client:
        async with client.stream(
            "POST",
            "http://127.0.0.1:8000/stream/perplexity",
            json={"message": "write a essay about french revolution", "history": [], "mode": "one-liner"}
        ) as r:
            chunks = []
            async for line in r.aiter_lines():
                if line:
                    chunks.append(line)
                    print(line)

            # Assert that stream ends with [DONE]
            assert any("[DONE]" in chunk for chunk in chunks)
        
