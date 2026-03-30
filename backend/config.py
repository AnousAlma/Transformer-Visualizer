from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # application configuration
    app_name: str = "Transformer Visualizer API"
    host: str = "0.0.0.0"
    port: int = 8000
    
    # model configuration
    default_language: str = "en"
    device: str = "cpu"
    
    # API keys
    groq_api_key: Optional[str] = None
    
    # Deployment environment
    environment: str = "development"
    
    class Config:
        env_file = ".env"
        # Allow environment variables to override
        case_sensitive = False

# global settings instance
settings = Settings()
