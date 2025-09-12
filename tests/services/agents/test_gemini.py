import pytest
import os
from unittest.mock import patch, AsyncMock
from backend.services.agents.gemini import GeminiAgent

class TestGeminiAgent:
    """Test GeminiAgent functionality."""
    
    @pytest.fixture
    def agent(self):
        return GeminiAgent()
    
    @pytest.fixture
    def mock_api_key(self):
        """Mock API key for testing."""
        original = os.environ.get("GOOGLE_API_KEY")
        os.environ["GOOGLE_API_KEY"] = "fake_key"
        yield
        if original:
            os.environ["GOOGLE_API_KEY"] = original
        else:
            os.environ.pop("GOOGLE_API_KEY", None)
    
    def test_agent_initialization(self, agent):
        """Test agent initializes correctly."""
        assert agent is not None
        assert hasattr(agent, 'stream_response')
    
    @pytest.mark.asyncio
    async def test_get_response_minimal(self, agent, mock_api_key):
        """Minimal get_response test."""
        with patch.object(agent, 'get_response', return_value="fake response"):
            response = agent.get_response("test message", [])
            assert response == "fake response"
    
    @pytest.mark.asyncio
    async def test_stream_response(self, agent, mock_api_key):
        """Test streaming response."""
        with patch.object(agent, 'stream_response') as mock_stream:
            async def mock_generator():
                yield {"answer": "stream part 1"}
                yield {"answer": "stream part 2"}
                yield {"usage": {"tokens": 10}}
            
            mock_stream.return_value = mock_generator()
            
            result = []
            async for chunk in agent.stream_response("test message", []):
                result.append(chunk)
            
            assert len(result) == 3
            assert any("answer" in chunk for chunk in result)
            assert any("usage" in chunk for chunk in result)
    
    @pytest.mark.asyncio
    async def test_stream_response_with_history(self, agent, mock_api_key):
        """Test streaming with chat history."""
        history = [{"role": "user", "content": "Hi"}]
        
        with patch.object(agent, 'stream_response') as mock_stream:
            async def mock_generator():
                yield {"answer": "response with context"}
            
            mock_stream.return_value = mock_generator()
            
            result = []
            async for chunk in agent.stream_response("follow up", history):
                result.append(chunk)
            
            assert len(result) > 0
            mock_stream.assert_called_once_with("follow up", history)
