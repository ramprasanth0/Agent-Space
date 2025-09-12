import pytest, httpx
from backend.main import app


# ── 1. Qwen streaming endpoint returns SSE 200 ───────────────────────────────
@pytest.mark.asyncio
async def test_stream_qwen(monkeypatch):
    async def fake_stream(*_, **__):
        yield {"answer": "hi-qwen"}

    from backend.services.agents.open_router import OpenRouterAgent
    monkeypatch.setattr(OpenRouterAgent, "stream_response", fake_stream)

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(
        transport=transport, base_url="http://testserver"
    ) as client:
        resp = await client.post("/stream/qwen",
                                 json={"message": "Hello", "history": []})

    assert resp.status_code == 200
    assert "text/event-stream" in resp.headers["content-type"]
