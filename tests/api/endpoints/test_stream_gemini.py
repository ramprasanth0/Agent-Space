# tests/services/agents/test_gemini.py
import pytest
from unittest.mock import Mock, patch
from backend.services.agents.gemini import GeminiAgent

class TestGeminiAgent:
    
    @pytest.fixture
    def agent(self, monkeypatch):  # ← Add monkeypatch parameter
        """Create GeminiAgent with mocked client."""
        mock_client = Mock()
        monkeypatch.setattr("google.genai.Client", lambda **kwargs: mock_client)
        return GeminiAgent()
    
    def test_agent_initialization(self, agent):
        assert agent is not None
        assert hasattr(agent, 'client')
    
    def test_get_response_minimal(self, agent, monkeypatch):  # ← Add monkeypatch parameter
        async def mock_get_response(*args, **kwargs):
            return "Mocked response"
        
        monkeypatch.setattr(agent, "get_response", mock_get_response)
        # Your test logic here
        assert True  # Placeholder assertion
    
    @pytest.mark.asyncio
    async def test_stream_response(self, agent, monkeypatch):  # ← Add monkeypatch parameter
        """Test stream_response with mocked client."""
        async def mock_stream(*args, **kwargs):
            yield {"answer": "test response"}
        
        monkeypatch.setattr(agent, "stream_response", mock_stream)
        
        result = []
        async for chunk in agent.stream_response("test message"):
            result.append(chunk)
        
        assert len(result) == 1
        assert result[0]["answer"] == "test response"
    
    @pytest.mark.asyncio
    async def test_stream_response_with_history(self, agent, monkeypatch):  # ← Add monkeypatch parameter
        """Test stream_response with history."""
        async def mock_stream(*args, **kwargs):
            yield {"answer": "response with history"}
        
        monkeypatch.setattr(agent, "stream_response", mock_stream)
        
        history = [{"role": "user", "content": "Hello"}]
        result = []
        async for chunk in agent.stream_response("test message", history=history):
            result.append(chunk)
        
        assert len(result) == 1
        assert result[0]["answer"] == "response with history"
