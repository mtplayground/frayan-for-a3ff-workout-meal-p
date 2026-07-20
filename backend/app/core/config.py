from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = Field(default="API", validation_alias="APP_NAME")
    environment: Literal["development", "test", "staging", "production"] = Field(
        default="development",
        validation_alias="ENVIRONMENT",
    )
    frontend_origin: str = Field(default="http://localhost:5173", validation_alias="FRONTEND_ORIGIN")
    allowed_cors_origin: str | None = Field(default=None, validation_alias="ALLOWED_CORS_ORIGIN")
    self_url: str | None = Field(default=None, validation_alias="SELF_URL")
    cors_allow_credentials: bool = Field(default=True, validation_alias="CORS_ALLOW_CREDENTIALS")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )

    @property
    def cors_origins(self) -> list[str]:
        origins = [self.frontend_origin, self.allowed_cors_origin, self.self_url]
        return list(dict.fromkeys(origin.rstrip("/") for origin in origins if origin))


@lru_cache
def get_settings() -> Settings:
    return Settings()
