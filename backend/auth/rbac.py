"""Role-Based Access Control matrix — Phase: backend RBAC (JWT stateless).

Pure stdlib, deterministic, fail-closed: unknown roles or actions are
denied. Roles: admin (full), operator (run + view), viewer (view only).
"""

from typing import FrozenSet

ROLES: FrozenSet[str] = frozenset({"admin", "operator", "viewer"})

# action -> roles allowed. Keep minimal; extend only with a documented need.
PERMISSIONS = {
    "crew:submit": frozenset({"admin", "operator"}),
    "crew:view": frozenset({"admin", "operator", "viewer"}),
    "admin:manage": frozenset({"admin"}),
}


def is_allowed(role: str, action: str) -> bool:
    """Return True iff `role` may perform `action`. Unknown -> False."""
    if not isinstance(role, str) or not isinstance(action, str):
        return False
    allowed = PERMISSIONS.get(action)
    if allowed is None:
        return False
    return role in allowed and role in ROLES


def assert_allowed(role: str, action: str) -> None:
    """Raise PermissionDenied if `role` may not perform `action`."""
    if not is_allowed(role, action):
        raise PermissionDenied(f"role '{role}' may not perform '{action}'")


class PermissionDenied(Exception):
    """Raised when a role attempts an unauthorized action."""
