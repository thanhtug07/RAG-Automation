"""Configuration helpers for the RAG Automation backend."""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    app_name: str = "rag-automation"
    app_version: str = "0.1.0"
    environment: str = "development"
    debug: bool = False
    api_prefix: str = "/api/v1"
    jwt_secret: str = "dev-secret"

    @classmethod
    def from_env(cls) -> "Settings":
        return cls(
            app_name=os.getenv("APP_NAME", "rag-automation"),
            app_version=os.getenv("APP_VERSION", "0.1.0"),
            environment=os.getenv("APP_ENV", "development"),
            debug=os.getenv("DEBUG", "false").lower() in {"1", "true", "yes"},
            api_prefix=os.getenv("API_PREFIX", "/api/v1"),
            jwt_secret=os.getenv("JWT_SECRET", "dev-secret"),
        )


def get_settings() -> Settings:
    """Return the application settings object."""
    return Settings.from_env()
