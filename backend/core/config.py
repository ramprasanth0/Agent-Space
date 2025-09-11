from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # AWS Settings - these will automatically read from env vars
    AWS_REGION: str = "ap-south-2"  # fallback default only
    CLOUDWATCH_LOG_GROUP: str = "agent-space-logs" 
    CLOUDWATCH_LOG_STREAM: str = "backend"
    
    # Email Settings
    SES_SENDER_EMAIL: str = "no-reply@agent-space.com"
    SES_RECIPIENT_EMAIL: str = "admin@agent-space.com"
    
    # API Settings  
    CORS_ORIGINS: list = ["*"]
    CORS_HEADERS: list = ["*"]

    class Config:
        env_file = ".env"

settings = Settings()
