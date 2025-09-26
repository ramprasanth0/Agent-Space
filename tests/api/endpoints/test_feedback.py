import pytest
import boto3
from moto import mock_ses
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

@pytest.fixture
def mock_aws_ses():
    """Mock AWS SES service using moto."""
    with mock_ses():
        # Create a mock SES client
        ses_client = boto3.client('ses', region_name='ap-south-2')
        
        # Verify an email address (required for moto SES)
        ses_client.verify_email_identity(EmailAddress='[email protected]')
        
        yield ses_client

@mock_ses
def test_feedback_returns_202():
    """Test feedback endpoint returns 202 with mocked SES."""
    response = client.post(
        "/api/feedback",
        json={"message": "pytest feedback"}
    )
    
    assert response.status_code == 202
    assert response.json() == {"ok": True}
