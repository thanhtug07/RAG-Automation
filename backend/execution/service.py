from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from typing import Dict, Optional


class RunStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    BLOCKED = "blocked"


@dataclass
class RunRecord:
    run_id: str
    plan_id: str
    status: RunStatus
    created_at: str
    updated_at: str

    def to_dict(self) -> Dict[str, str]:
        return {
            "run_id": self.run_id,
            "plan_id": self.plan_id,
            "status": self.status.value,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }


class ExecutionService:
    """Minimal run lifecycle manager for planning + execution flow."""

    def __init__(self) -> None:
        self._runs: Dict[str, RunRecord] = {}

    @staticmethod
    def _now() -> str:
        return datetime.now(timezone.utc).isoformat()

    def create_run(self, plan_id: str) -> RunRecord:
        run_id = f"run_{uuid.uuid4().hex[:8]}"
        now = self._now()
        record = RunRecord(
            run_id=run_id,
            plan_id=plan_id,
            status=RunStatus.QUEUED,
            created_at=now,
            updated_at=now,
        )
        self._runs[run_id] = record
        return record

    def get_run(self, run_id: str) -> Optional[RunRecord]:
        return self._runs.get(run_id)

    def start_run(self, run_id: str) -> RunRecord:
        record = self._runs[run_id]
        record.status = RunStatus.RUNNING
        record.updated_at = self._now()
        return record

    def complete_run(self, run_id: str) -> RunRecord:
        record = self._runs[run_id]
        record.status = RunStatus.SUCCEEDED
        record.updated_at = self._now()
        return record

    def fail_run(self, run_id: str) -> RunRecord:
        record = self._runs[run_id]
        record.status = RunStatus.FAILED
        record.updated_at = self._now()
        return record
