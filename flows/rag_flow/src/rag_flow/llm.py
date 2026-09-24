"""Shared model resolution: env id + litellm `openai/` prefix on custom base."""

import os


def default_model() -> str:
    """Model string for agents. Bare provider id + custom OPENAI_API_BASE
    gets the `openai/` prefix (provider id itself unchanged)."""
    name = os.getenv("OPENAI_MODEL_NAME") or "gpt-4o-mini"
    if "/" not in name and os.getenv("OPENAI_API_BASE"):
        return f"openai/{name}"
    return name
