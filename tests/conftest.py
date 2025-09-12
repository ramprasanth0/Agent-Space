import pytest
import sys
import os
from pathlib import Path
from typing import Generator
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Mock watchtower before importing backend
sys.modules['watchtower'] = Mock()

# Mock Google AI client to prevent API key errors
with patch('google.genai.Client'):
        # Now safe to import your app
        from backend.main import app

# Now import your app (should work from root)
from backend.main import app

@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"

@pytest.fixture(scope="function")
def client() -> Generator[TestClient, None, None]:
    """Create test client."""
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture(scope="function")
def mock_aws_credentials():
    """Mock AWS credentials for testing."""
    env_vars = {
        "AWS_ACCESS_KEY_ID": "testing",
        "AWS_SECRET_ACCESS_KEY": "testing", 
        "AWS_SECURITY_TOKEN": "testing",
        "AWS_SESSION_TOKEN": "testing",
        "AWS_DEFAULT_REGION": "ap-south-2"
    }
    
    with patch.dict(os.environ, env_vars):
        yield

@pytest.fixture
def sample_chat_request():
    """Sample chat request for testing."""
    return {
        "message": "Test message",
        "history": [
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "Hi!"}
        ],
        "mode": "conversation", 
        "structured_followup": True
    }

@pytest.fixture
def sample_feedback_request():
    """Sample feedback request."""
    return {"message": "Test feedback message"}
