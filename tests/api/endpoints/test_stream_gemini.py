import pytest, httpx
from backend.main import app


# ── 1. Gemini streaming endpoint returns SSE 200 ─────────────────────────────
@pytest.mark.asyncio
async def test_stream_gemini(monkeypatch):
    # Mock GeminiAgent so no real call happens
    async def fake_stream(*_, **__):
        yield {"answer": "hi-gemini"}

    from backend.services.agents.gemini import GeminiAgent
    monkeypatch.setattr(GeminiAgent, "stream_response", fake_stream)

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(
        transport=transport, base_url="http://testserver"
    ) as client:
        resp = await client.post("/stream/gemini",
                                 json={"message": "Hello", "history": []})

    assert resp.status_code == 200
    assert "text/event-stream" in resp.headers["content-type"]
