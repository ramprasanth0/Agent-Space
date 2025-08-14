import pytest
pytest.skip("Skipping this test file", allow_module_level=True)
import asyncio
import httpx
from unittest.mock import patch, AsyncMock
from backend.agents.perplexity import PerplexityAgent


####################################
# --- Mock test for get_response ---
####################################

@pytest.mark.asyncio
async def test_get_response_builds_payload_and_handles_response(monkeypatch):
    agent = PerplexityAgent()

    # Prepare a fake API result (the minimal returned structure)
    fake_data = {
        "choices": [
            {"message": {"content": "Perplexity test answer!"}}
        ]
    }

    # MagicMock the client's post method to return a fake response object
    class FakeResponse:
        def raise_for_status(self): pass
        def json(self): return fake_data

    async def fake_post(*args, **kwargs):
        return FakeResponse()

    # Patch the AsyncClient post method
    with patch("httpx.AsyncClient.post", new=AsyncMock(side_effect=fake_post)):
        # Set up a fake API key in your env:
        import os
        os.environ["PERPLEXITY_API_KEY"] = "FAKE"
        history = [{"role": "user", "content": "Hello!"}]
        answer = await agent.get_response(message="Hello!", history=history)
        assert answer == "Perplexity test answer!"

# If you want a basic integration API error case:
@pytest.mark.asyncio
async def test_get_response_handles_api_error(monkeypatch):
    agent = PerplexityAgent()

    class FakeErrorResponse:
        status_code = 400
        def raise_for_status(self): raise httpx.HTTPStatusError("Error", request=None, response=self)
        async def json(self): return {"error": "Test fail"}
        async def text(self): return "Text fail"

    async def fake_post(*args, **kwargs):
        return FakeErrorResponse()

    with patch("httpx.AsyncClient.post", new=AsyncMock(side_effect=fake_post)):
        import os
        os.environ["PERPLEXITY_API_KEY"] = "FAKE"
        history = [{"role": "user", "content": "what"}]
        with pytest.raises(Exception) as excinfo:
            await agent.get_response(message="what", history=history)
        assert "Perplexity API call failed" in str(excinfo.value)
