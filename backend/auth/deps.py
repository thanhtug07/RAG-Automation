"""FastAPI dependencies: authentication + RBAC + organization isolation.

- Identity and roles come ONLY from the verified JWT (never from client
  fields, query params, or headers).
- organization_id comes ONLY from token claims (server-side context).
"""

import os
from typing import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .jwt_auth import AuthError, TokenClaims, verify_token

bearer_scheme = HTTPBearer(auto_error=False)


def current_claims(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> TokenClaims:
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="missing bearer token")
    try:
        return verify_token(credentials.credentials,
                            os.environ.get("JWT_SECRET", ""))
    except AuthError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail=str(exc))


def require_roles(*roles: str) -> Callable:
    """Dependency factory: allow only callers holding one of `roles`."""

    def checker(claims: TokenClaims = Depends(current_claims)) -> TokenClaims:
        if any(role in roles for role in claims.roles):
            return claims
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="role not authorized")

    return checker


def current_organization_id(
    claims: TokenClaims = Depends(current_claims),
) -> str:
    return claims.organization_id
