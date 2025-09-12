import pytest
import os
from unittest.mock import patch, Mock
from backend.services.ses_service import send_feedback_email

class TestSESService:
    """Test SES Service functionality."""
    
    @pytest.fixture
    def mock_ses_success(self):
        """Mock successful SES send_email call."""
        with patch("backend.services.ses_service.ses") as mock_ses:
            mock_ses.send_email.return_value = {"MessageId": "test-message-id"}
            yield mock_ses
    
    @pytest.fixture
    def mock_ses_env_vars(self):
        """Mock SES environment variables."""
        env_vars = {
            "SES_SENDER": "sender@test.com",
            "SES_RECIPIENT": "recipient@test.com"
        }
        with patch.dict(os.environ, env_vars):
            yield
    
    def test_send_feedback_email_success(self, mock_ses_success, mock_ses_env_vars):
        """Test successful feedback email sending."""
        response = send_feedback_email("This is test feedback")
        
        assert response["MessageId"] == "test-message-id"
        mock_ses_success.send_email.assert_called_once()
    
    def test_send_feedback_email_missing_sender(self, mock_ses_success):
        """Test error when SES_SENDER is missing."""
        with patch.dict(os.environ, {"SES_SENDER": "", "SES_RECIPIENT": "recipient@test.com"}):
            with pytest.raises(RuntimeError, match="SES_SENDER or SES_RECIPIENT missing"):
                send_feedback_email("Test feedback")
    
    def test_send_feedback_email_missing_recipient(self, mock_ses_success):
        """Test error when SES_RECIPIENT is missing."""
        with patch.dict(os.environ, {"SES_SENDER": "sender@test.com", "SES_RECIPIENT": ""}):
            with pytest.raises(RuntimeError, match="SES_SENDER or SES_RECIPIENT missing"):
                send_feedback_email("Test feedback")
    
    def test_send_feedback_email_ses_client_error(self, mock_ses_env_vars):
        """Test SES client error handling."""
        from botocore.exceptions import ClientError
        
        with patch("backend.services.ses_service.ses") as mock_ses:
            mock_ses.send_email.side_effect = ClientError(
                error_response={'Error': {'Code': 'MessageRejected', 'Message': 'Email rejected'}},
                operation_name='SendEmail'
            )
            
            with pytest.raises(ClientError):
                send_feedback_email("Test feedback")
    
    def test_send_feedback_email_with_long_message(self, mock_ses_success, mock_ses_env_vars):
        """Test sending email with long feedback message."""
        long_feedback = "This is a very long feedback message. " * 100
        
        response = send_feedback_email(long_feedback)
        assert response["MessageId"] == "test-message-id"
    
    def test_send_feedback_email_with_special_characters(self, mock_ses_success, mock_ses_env_vars):
        """Test sending email with special characters."""
        special_feedback = "Test with émojis 🚀 and spëcial çhars & <html>tags</html>"
        
        response = send_feedback_email(special_feedback)
        assert response["MessageId"] == "test-message-id"
