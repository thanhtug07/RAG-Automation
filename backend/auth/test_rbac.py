"""RBAC tests: permission matrix, JWT stateless auth, deps, audit trail."""

import pytest
from fastapi import HTTPException

from backend.auth import audit as audit_mod
from backend.auth.audit import AuditLog
from backend.auth.deps import current_claims, require_roles
from backend.auth.jwt_auth import AuthError, mint_token, verify_token
from backend.auth.rbac import PermissionDenied, assert_allowed, is_allowed

SECRET = "test-secret-not-a-real-credential"


def token(roles=("operator",), org="org_a", minutes=60):
    return mint_token("user_1", org, tuple(roles),
                      secret=SECRET, expires_minutes=minutes)


# --- matrix ---------------------------------------------------------------

@pytest.mark.parametrize("role,action,expected", [
    ("admin", "crew:submit", True),
    ("admin", "crew:view", True),
    ("admin", "admin:manage", True),
    ("operator", "crew:submit", True),
    ("operator", "crew:view", True),
    ("operator", "admin:manage", False),
    ("viewer", "crew:submit", False),
    ("viewer", "crew:view", True),
    ("viewer", "admin:manage", False),
    ("ghost", "crew:view", False),
    ("admin", "nope:ever", False),
])
def test_matrix(role, action, expected):
    assert is_allowed(role, action) is expected


def test_assert_allowed_raises():
    with pytest.raises(PermissionDenied):
        assert_allowed("viewer", "crew:submit")
    assert_allowed("operator", "crew:submit")  # no raise


# --- JWT -------------------------------------------------------------------

def test_valid_token_claims():
    claims = verify_token(token(["admin", "viewer"]), SECRET)
    assert (claims.sub, claims.organization_id, claims.roles) == (
        "user_1", "org_a", ("admin", "viewer"))


def test_bad_signature_rejected():
    with pytest.raises(AuthError):
        verify_token(token(), "wrong-secret")


def test_expired_rejected():
    with pytest.raises(AuthError):
        verify_token(token(minutes=-1), SECRET)


def test_missing_org_rejected():
    bad = mint_token("u", "", ("viewer",), secret=SECRET)
    with pytest.raises(AuthError):
        verify_token(bad, SECRET)


def test_unknown_role_rejected():
    bad = mint_token("u", "org_a", ("superuser",), secret=SECRET)
    with pytest.raises(AuthError):
        verify_token(bad, SECRET)


def test_no_secret_configured(monkeypatch):
    monkeypatch.delenv("JWT_SECRET", raising=False)
    with pytest.raises(AuthError):
        verify_token(token(), "")


# --- deps (direct calls, no server) ------------------------------------------

class _Creds:
    def __init__(self, value):
        self.credentials = value


def test_current_claims_ok_and_missing(monkeypatch):
    monkeypatch.setenv("JWT_SECRET", SECRET)
    claims = current_claims(_Creds(token(["viewer"])))
    assert claims.organization_id == "org_a"
    with pytest.raises(HTTPException) as exc:
        current_claims(None)
    assert exc.value.status_code == 401
    with pytest.raises(HTTPException) as exc:
        current_claims(_Creds("garbage.token.here"))
    assert exc.value.status_code == 401


def test_require_roles_allow_and_forbid():
    checker = require_roles("admin", "operator")
    claims = verify_token(token(["operator"]), SECRET)
    assert checker(claims) is claims
    viewer_claims = verify_token(token(["viewer"]), SECRET)
    with pytest.raises(HTTPException) as exc:
        checker(viewer_claims)
    assert exc.value.status_code == 403


# --- audit -------------------------------------------------------------------

def test_audit_append_only_and_immutable():
    log = AuditLog()
    entry, log2 = log.record("u", "org_a", "crew:submit", "c1", "allow")
    assert log.entries == ()
    assert log2.entries == (entry,)
    assert entry.result == "allow" and entry.actor == "u"
    with pytest.raises(Exception):
        entry.result = "deny"  # frozen dataclass
    assert not hasattr(log2, "update") and not hasattr(log2, "delete")
    with pytest.raises(ValueError):
        log2.record("u", "org_a", "crew:submit", "c1", "maybe")
    assert audit_mod.AuditEntry.__dataclass_params__.frozen
