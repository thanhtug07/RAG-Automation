"""JWT verification (stateless) — roles and organization come from token claims.

No user store, no login endpoint (later phase). Secrets only from the
`secret` argument or the JWT_SECRET environment variable — never from code.
Uses python-jose (declared in requirements.txt). Error messages never
include tokens or secrets.
"""

import os
from dataclasses import dataclass
from typing import Any, Dict, Tuple

from jose import JWTError, jwt

from .rbac import ROLES

ALGORITHM = "HS256"


class AuthError(Exception):
    """Raised for any token problem (invalid, expired, missing claims)."""


@dataclass(frozen=True)
class TokenClaims:
    sub: str
    organization_id: str
    roles: Tuple[str, ...]


def _secret(explicit: str = "") -> str:
    secret = explicit or os.environ.get("JWT_SECRET", "")
    if not secret:
        raise AuthError("signing secret is not configured")
    return secret


def verify_token(token: str, secret: str = "") -> TokenClaims:
    """Verify signature + expiry, extract and validate claims."""
    if not isinstance(token, str) or not token:
        raise AuthError("missing token")
    try:
        payload: Dict[str, Any] = jwt.decode(
            token, _secret(secret), algorithms=[ALGORITHM])
    except JWTError:
        raise AuthError("invalid or expired token")
    sub = payload.get("sub")
    org = payload.get("organization_id")
    roles = payload.get("roles", [])
    if not isinstance(sub, str) or not sub:
        raise AuthError("token has no subject")
    if not isinstance(org, str) or not org:
        raise AuthError("token has no organization")
    if not isinstance(roles, list) or not roles or any(
            not isinstance(r, str) or r not in ROLES for r in roles):
        raise AuthError("token has no valid roles")
    return TokenClaims(sub=sub, organization_id=org, roles=tuple(roles))


def mint_token(sub: str, organization_id: str, roles: Tuple[str, ...],
               secret: str = "", expires_minutes: int = 60) -> str:
    """Test/ops helper: sign a token. Production issuance lives outside code."""
    from datetime import datetime, timedelta, timezone
    payload = {"sub": sub, "organization_id": organization_id,
               "roles": list(roles),
               "exp": datetime.now(timezone.utc) + timedelta(
                   minutes=expires_minutes)}
    return jwt.encode(payload, _secret(secret), algorithm=ALGORITHM)
