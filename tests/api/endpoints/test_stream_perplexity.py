import pytest, httpx
from backend.main import app                    # your FastAPI instance

@pytest.mark.asyncio
async def test_stream_perplexity_starts_stream(monkeypatch):
    # ── mock PerplexityAgent -------------------------------------------------
    async def fake_stream_response(*_, **__):
        yield {"answer": "hi"}                  # single fake chunk

    from backend.services.agents.perplexity import PerplexityAgent
    monkeypatch.setattr(PerplexityAgent, "stream_response", fake_stream_response)

    # ── create AsyncClient that talks to the app in-process ------------------
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(
            transport=transport,
            base_url="http://testserver") as client:

        resp = await client.post("/stream/perplexity",
                                 json={"message": "Hello", "history": []})

    assert resp.status_code == 200
    assert "text/event-stream" in resp.headers["content-type"]
