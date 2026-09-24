# Home — PLAN

> Files: `index.html` + `home.js` + `home.css` + `PLAN.md` (this file), all colocated.
> Status: `scaffold-pending` — no code in this phase.
> Visual spec: `src/design-system/PLAN.md`. App shell: `src/layouts/marketing/PLAN.md`.

## 1. Purpose

Introduce AgentOS as an Enterprise AI Platform and route visitors to Sign in
(`../auth/login/`) or Get started (`../auth/register/`). Sells outcome
(reliable execution), not architecture.

## 2. Layout

Single column: sticky header → hero → product preview → capabilities → footer.
Eyebrow pill "ENTERPRISE AI PLATFORM"; headline "From business intent to
autonomous execution."; dual CTA (primary → register, secondary → login);
workspace preview card (request → 3-step pipeline → meta → 72% progress);
three capability cards; footer links mirror header targets.

## 3. Behavior

`home.js` only: mobile nav toggle (`aria-expanded`), footer year, one-time
progress fill. No scroll effects. `prefers-reduced-motion` disables transitions.

## 4. States

Static page; step badges (Completed/Running/Pending) are the live-state pattern
and the future realtime seam (`#previewProgress` + `data-progress` + ARIA).

## 5. Non-goals

No Dashboard/Agents/Workflows/Knowledge/Tools/Runs/API/backend work. No third
CTA, no newsletter/demo forms.

## 6. Acceptance

Closed nav graph (home ↔ login ↔ register); semantic HTML; tokens only;
1024/768/480 breakpoints; no horizontal scroll at 320px+; zero console errors.
