"""Append-only audit trail — immutable by construction.

Entries are frozen dataclasses; the log exposes NO update or delete API —
history can only grow. Persistence (database/event bus) is a later phase;
this module defines the record shape and the append-only contract.
"""

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Tuple


@dataclass(frozen=True)
class AuditEntry:
    ts: str          # UTC ISO-8601 creation time, set at record() time
    actor: str       # token subject performing the action
    org: str         # organization_id from token claims
    action: str      # e.g. "crew:submit"
    resource: str    # e.g. crew_id or object identifier
    result: str      # "allow" or "deny"


class AuditLog:
    """Immutable log: record() returns (entry, new_log); nothing mutates."""

    def __init__(self, entries: Tuple[AuditEntry, ...] = ()) -> None:
        self._entries = tuple(entries)

    @property
    def entries(self) -> Tuple[AuditEntry, ...]:
        return self._entries

    def record(self, actor: str, org: str, action: str,
               resource: str, result: str) -> Tuple[AuditEntry, "AuditLog"]:
        if result not in ("allow", "deny"):
            raise ValueError("result must be 'allow' or 'deny'")
        entry = AuditEntry(
            ts=datetime.now(timezone.utc).isoformat(),
            actor=actor, org=org, action=action,
            resource=resource, result=result)
        return entry, AuditLog(self._entries + (entry,))
