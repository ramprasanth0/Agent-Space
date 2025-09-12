from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # API Keys
    perplexity_api_key: str = ""
    google_api_key: str = ""
    openrouter_api_key: str = ""

    # AWS Configuration
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "ap-south-2"

    # Email Settings
    ses_sender: str = ""
    ses_recipient: str = "essrramprasanth@gmail.com"

    # API Settings
    vite_backend_url: str = "http://localhost:8000"
    cors_origins: List[str] = ["*"]
    cors_headers: List[str] = ["*"]

    # Logging Configuration
    cloudwatch_log_group: str = "agent-space-logs"
    cloudwatch_log_stream: str = "backend"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"

settings = Settings()
