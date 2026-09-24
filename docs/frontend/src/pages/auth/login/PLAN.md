# Login — PLAN

> Files: `index.html` + `login.js` + `login.css` + `PLAN.md`, colocated.
> Status: `scaffold-pending` — no code in this phase.
> Visual spec: `src/design-system/PLAN.md`. App shell: `src/layouts/auth/PLAN.md`.

## 1. Purpose

Authenticate returning users into their workspace. No pitching — one-line
product context only ("Welcome back / Sign in to your AgentOS workspace.").

## 2. Form

Work email + password (Show/Hide toggle, "Forgot password?" placeholder),
primary block submit, divider, SSO button, switch line → `../register/`.
Real labels, autocomplete attributes, JS-owned validation (email format,
password ≥ 8), inline errors cleared on edit.

## 3. States

Default/focus/invalid per shared auth styles; loading = disabled + "Signing in…";
error maps: 401 → password error, 422 → field errors, 429/5xx → form note.
Success → workspace landing per `src/config` routes; session in httpOnly cookie,
never localStorage.

## 4. Integration point

Submit handler calls `src/services/auth` → `src/api/auth.login`. This page owns
markup + field states; `src/features/authentication` owns session/guards.

## 5. Acceptance

Closed graph (login ↔ register, brand → home); keyboard + screen-reader pass;
no backend dependency for markup/validation contract.
