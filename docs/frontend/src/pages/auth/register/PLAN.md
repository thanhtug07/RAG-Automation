# Register — PLAN

> Files: `index.html` + `register.js` + `register.css` + `PLAN.md`, colocated.
> Status: `scaffold-pending` — no code in this phase.
> Visual spec: `src/design-system/PLAN.md`. App shell: `src/layouts/auth/PLAN.md`.

## 1. Purpose

Create one account + one workspace ("Create your workspace", not "Sign up").
Collects identity only: full name, work email, password. Org naming/invites are
post-registration onboarding, out of scope.

## 2. Form

Three fields in order (name ≥ 2 chars, valid email, password ≥ 8 with toggle),
primary block submit, symmetric switch line → `../login/`. No SSO button.
Shares every auth style class with Login — no per-page input styling.

## 3. States

Same model as Login. Future: 409 (email taken) → email error + "Sign in instead";
password-strength hint may attach under the field without layout shift.

## 4. Integration point

Submit handler calls `src/services/auth` → `src/api/auth.register`, then follows
the onboarding target from `src/config/routes.js`.

## 5. Acceptance

Mirror of Login contract: geometry, validation timing (submit, not keystroke),
a11y, closed graph. No backend dependency for markup/validation contract.
