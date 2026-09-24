# dependency-spec — Dependency Specification (normative)

Part of PHASE 1. Dependencies are declared ONLY in `tasks[].depends_on`.
The optional top-level `dependencies[]` array, if present, MUST equal the
derived edge set (validator checks equality, V-DEP-05) — it is a redundant
view, never a second source of truth.

## Edge model

```text
task_a
  ↓  (edge: source=task_a, target=task_b, type=blocks)
task_b
  ↓  (edge: source=task_b, target=task_c, type=blocks)
task_c
```

Field (edge): source | Type: string | Required: YES | Nullable: NO |
Description: the prerequisite task | Allowed values: a `tasks[].id` |
Reference: `tasks[].id` | Validation: resolves (V-DEP-01) |
Example: `research_data`

Field (edge): target | Type: string | Required: YES | Nullable: NO |
Description: the dependent task | Allowed values: a `tasks[].id` |
Reference: `tasks[].id` | Validation: resolves; `source != target`
(V-DEP-02) | Example: `analyze_revenue`

Field (edge): type | Type: string | Required: YES | Nullable: NO |
Description: dependency meaning | Allowed values: `blocks` (target starts
only after source SUCCEEDS) | Default: `blocks` |
Validation: must be `blocks`; additional types: TBD — NOT DEFINED
(non-critical: one type covers all current needs) |
Example: `blocks`

## Derived edge set (normative construction)

For each task T with `depends_on: [A, B]`, edges are
`(A→T, blocks)`, `(B→T, blocks)`. Duplicate entries in one list collapse to
one edge; duplicates across the spec are reported (V-DEP-04, FAIL).

## Validation rules (full)

- V-DEP-01 missing task: any edge endpoint not in `tasks[].id` → FAIL.
- V-DEP-02 self dependency: `source == target` → FAIL.
- V-DEP-03 circular dependency: any directed cycle (any length) → FAIL.
  Detection: standard DFS/topological check — deterministic.
- V-DEP-04 duplicate dependency: same (source, target) twice → FAIL.
- V-DEP-05 redundant-view equality: if top-level `dependencies[]` present,
  as a set it MUST equal the derived edge set → else FAIL.

## Valid / invalid

- Chain `research_data → analyze_revenue → generate_report` → PASS.
- Two roots (`depends_on: []` on both) → PASS (independent tasks).
- `depends_on: [ghost]` → FAIL (V-DEP-01).
- `analyze_revenue` depending on itself → FAIL (V-DEP-02).
- A→B→C→A → FAIL (V-DEP-03).
- `depends_on: [research_data, research_data]` → FAIL (V-DEP-04).
