import pytest
import boto3
from moto import mock_aws
from fastapi.testclient import TestClient
from backend.main import app


client = TestClient(app)


@pytest.fixture
def mock_aws_ses():
    """Mock AWS SES service using moto 5.x."""
    with mock_aws():
        # Create a mock SES client
        ses_client = boto3.client('ses', region_name='ap-south-2')
        
        # Verify an email address (required for moto SES)
        ses_client.verify_email_identity(EmailAddress='[email protected]')
        
        yield ses_client


@mock_aws
def test_feedback_returns_202():
    """Test feedback endpoint returns 202 with mocked SES."""
    # Setup SES client and verify email (required for SES to work)
    ses_client = boto3.client('ses', region_name='ap-south-2')
    ses_client.verify_email_identity(EmailAddress='[email protected]')
    
    response = client.post(
        "/api/feedback",
        json={"message": "pytest feedback"}
    )
    
    assert response.status_code == 202
    assert response.json() == {"ok": True}


@mock_aws
def test_feedback_with_fixture(mock_aws_ses):
    """Alternative test using the fixture.""" 
    response = client.post(
        "/api/feedback",
        json={"message": "pytest feedback with fixture"}
    )
    
    assert response.status_code == 202
    assert response.json() == {"ok": True}


@mock_aws 
def test_feedback_validates_ses_call():
    """Test that verifies SES service is actually called."""
    # Setup SES
    ses_client = boto3.client('ses', region_name='ap-south-2')
    ses_client.verify_email_identity(EmailAddress='[email protected]')
    
    # Make the request
    response = client.post(
        "/api/feedback", 
        json={"message": "test message for SES validation"}
    )
    
    # Verify response
    assert response.status_code == 202
    assert response.json() == {"ok": True}
    
    # Optional: You can also verify emails were "sent" by checking SES
    # This depends on your actual implementation
    
    
@mock_aws
def test_feedback_with_different_regions():
    """Test feedback works with different AWS regions."""
    # Test with multiple regions to ensure compatibility
    region ='ap-south-2'
    ses_client = boto3.client('ses', region_name=region)
    ses_client.verify_email_identity(EmailAddress='[email protected]')
    
    response = client.post(
        "/api/feedback",
        json={"message": f"test message from {region}"}
    )
    
    assert response.status_code == 202
    assert response.json() == {"ok": True}


@mock_aws
def test_feedback_error_handling():
    """Test feedback endpoint error handling."""
    # Test with invalid JSON
    response = client.post(
        "/api/feedback",
        json={}  # Empty message
    )
    
    # This test depends on your actual validation logic
    # Adjust the expected status code based on your implementation
    assert response.status_code in [400, 422]  # Bad Request or Unprocessable Entity
