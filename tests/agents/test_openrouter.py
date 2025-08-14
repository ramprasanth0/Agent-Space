import os
import pytest
pytest.skip("Skipping this test file", allow_module_level=True)
import httpx
from unittest.mock import patch, AsyncMock
from backend.agents.open_router import OpenRouterAgent

####################################
# --- Mock test for get_response ---
####################################

@pytest.mark.asyncio
async def test_get_response_success(monkeypatch):
    agent = OpenRouterAgent()
    # Prepare a fake successful API result
    fake_data = {
        "choices": [
            {"message": {"content": "OpenRouter mock answer"}}
        ]
    }

    # Fake response object that mimics httpx's async interface
    class FakeResponse:
        def raise_for_status(self): pass
        def json(self): return fake_data

    async def fake_post(*args, **kwargs):
        return FakeResponse()

    with patch("httpx.AsyncClient.post", new=AsyncMock(side_effect=fake_post)):
        os.environ["OPENROUTER_API_KEY"] = "FAKE"
        history = [{"role": "user", "content": "Hello OpenRouter!"}]
        answer = await agent.get_response("R1", message="Hello OpenRouter!", history=history)
        assert answer == "OpenRouter mock answer"

@pytest.mark.asyncio
async def test_get_response_http_error(monkeypatch):
    agent = OpenRouterAgent()

    class FakeErrorResponse:
        status_code = 400
        def raise_for_status(self): raise httpx.HTTPStatusError("Error", request=None, response=self)
        async def json(self): return {"error": "Test fail"}
        async def text(self): return "Test fail"

    async def fake_post(*args, **kwargs):
        return FakeErrorResponse()

    with patch("httpx.AsyncClient.post", new=AsyncMock(side_effect=fake_post)):
        os.environ["OPENROUTER_API_KEY"] = "FAKE"
        history = [{"role": "user", "content": "fail"}]
        with pytest.raises(Exception) as excinfo:
            await agent.get_response("R1", message="fail", history=history)
        assert "Open Router API call failed" in str(excinfo.value)

@pytest.mark.asyncio
async def test_get_response_missing_api_key(monkeypatch):
    agent = OpenRouterAgent()
    # Remove key from env
    if "OPENROUTER_API_KEY" in os.environ:
        del os.environ["OPENROUTER_API_KEY"]
    with pytest.raises(Exception) as excinfo:
        await agent.get_response("R1", message="msg")
    assert "PERPLEXITY_API_KEY not set in environment." in str(excinfo.value)

@pytest.mark.asyncio
async def test_get_response_timeout(monkeypatch):
    agent = OpenRouterAgent()
    os.environ["OPENROUTER_API_KEY"] = "FAKE"

    async def fake_post(*args, **kwargs):
        raise httpx.ReadTimeout("timed out")

    with patch("httpx.AsyncClient.post", new=AsyncMock(side_effect=fake_post)):
        with pytest.raises(Exception) as excinfo:
            await agent.get_response("R1", message="timeout case")
        assert "timed out" in str(excinfo.value).lower()
