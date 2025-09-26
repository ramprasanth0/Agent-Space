import pytest
import boto3
from moto import mock_aws
from fastapi.testclient import TestClient
from backend.main import app


client = TestClient(app)


@mock_aws
def test_feedback_returns_202():
    """Test feedback endpoint returns 202 - core functionality test."""
    # Setup SES verification for the ACTUAL production email addresses
    ses_client = boto3.client('ses', region_name='ap-south-2')
    
    # Verify your real production email addresses
    ses_client.verify_email_identity(EmailAddress='no-reply@agentspace.wtf')  # ✅ Production sender
    ses_client.verify_email_identity(EmailAddress='essrramprasanth@gmail.com')  # ✅ Your real recipient
    
    response = client.post(
        "/api/feedback",
        json={"message": "pytest feedback test"}
    )
    
    assert response.status_code == 202
    assert response.json() == {"ok": True}


@mock_aws
def test_feedback_error_handling():
    """Test feedback endpoint validates input correctly."""
    response = client.post(
        "/api/feedback",
        json={}  # Missing message field
    )
    
    # Should return validation error
    assert response.status_code in [400, 422]


@mock_aws  
def test_feedback_with_message():
    """Test feedback endpoint processes different message types."""
    # Setup SES verification for production email addresses
    ses_client = boto3.client('ses', region_name='ap-south-2')
    ses_client.verify_email_identity(EmailAddress='no-reply@agentspace.wtf')  # ✅ Production sender
    ses_client.verify_email_identity(EmailAddress='essrramprasanth@gmail.com')  # ✅ Your email
    
    # Test with different message content
    test_cases = [
        "Short message",
        "A much longer message with multiple words and sentences to test the handling of larger content.",
        "Special chars: åñü & symbols! 🚀"
    ]
    
    for message in test_cases:
        response = client.post(
            "/api/feedback",
            json={"message": message}
        )
        
        assert response.status_code == 202
        assert response.json() == {"ok": True}


@mock_aws
def test_feedback_integration():
    """Test that feedback service integrates properly with mocked SES."""
    # Setup SES verification for production configuration
    ses_client = boto3.client('ses', region_name='ap-south-2')
    ses_client.verify_email_identity(EmailAddress='no-reply@agentspace.wtf')  # ✅ Production sender
    ses_client.verify_email_identity(EmailAddress='essrramprasanth@gmail.com')  # ✅ Your email
    
    response = client.post(
        "/api/feedback",
        json={"message": "Integration test - this should work in both local and CI"}
    )
    
    # Core assertion - if this passes, the SES integration is working
    assert response.status_code == 202
    assert response.json() == {"ok": True}
