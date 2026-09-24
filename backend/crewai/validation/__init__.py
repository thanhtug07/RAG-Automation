"""Crew Specification validation domain — see docs/backend/crewai/specs/validation-spec.md."""

from .validator import ValidationError, ValidationResult, validate

__all__ = ["ValidationError", "ValidationResult", "validate"]
