"""Shared API and workflow contracts for RAG automation tasks."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

VALID_RUN_STATUSES = (
    "queued",
    "running",
    "succeeded",
    "failed",
    "blocked",
)

VALID_EVENT_TYPES = (
    "run.created",
    "run.started",
    "run.completed",
    "run.failed",
    "step.started",
    "step.completed",
    "tool.called",
    "result.generated",
)


@dataclass(frozen=True)
class TenantContext:
    tenant_id: str
    user_id: str
    organization_id: str
    roles: Tuple[str, ...] = ()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "tenant_id": self.tenant_id,
            "user_id": self.user_id,
            "organization_id": self.organization_id,
            "roles": list(self.roles),
        }


@dataclass(frozen=True)
class WorkflowStep:
    id: str
    type: str
    depends_on: List[str] = field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "type": self.type,
            "depends_on": list(self.depends_on),
            "metadata": dict(self.metadata or {}),
        }


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def build_api_response(success: bool, data: Optional[Dict[str, Any]] = None,
                      error: Optional[str] = None) -> Dict[str, Any]:
    payload: Dict[str, Any] = {"success": bool(success)}
    if data is not None:
        payload["data"] = data
    if error is not None:
        payload["error"] = error
    return payload


def create_run_summary(run_id: str, status: str, **extra: Any) -> Dict[str, Any]:
    if status not in VALID_RUN_STATUSES:
        raise ValueError(f"Unknown run status: {status}")
    payload: Dict[str, Any] = {
        "run_id": run_id,
        "status": status,
        "updated_at": _utc_now(),
    }
    payload.update(extra)
    return payload


def create_run_event(run_id: str, event_type: str, payload: Optional[Dict[str, Any]] = None,
                    *, event_id: Optional[str] = None) -> Dict[str, Any]:
    if event_type not in VALID_EVENT_TYPES:
        raise ValueError(f"Unknown event type: {event_type}")
    result: Dict[str, Any] = {
        "event_id": event_id or f"evt_{run_id}_{len(str(payload or {}))}",
        "run_id": run_id,
        "event_type": event_type,
        "created_at": _utc_now(),
        "payload": payload or {},
    }
    return result
