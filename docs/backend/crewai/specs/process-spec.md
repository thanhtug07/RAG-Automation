# process-spec — Process Specification (normative)

Part of PHASE 1. Conceptual background: `../PROCESS_MODEL.md`.

## process object

Field: type | Type: string | Required: YES | Nullable: NO |
Description: execution strategy the runtime must honor |
Allowed values: `sequential`, `hierarchical` | Default: none (no default
selected — see below) | Reference: — |
Validation: one of allowed (V-PROC-01) |
Example: `sequential`

Field: execution_order | Type: string[0..] | Required: NO | Nullable: YES |
Description: explicit run order; when absent the runtime derives document
topological order from `depends_on` |
Allowed values: permutation of `tasks[].id` | Default: null (= derive) |
Reference: `tasks[].id` | Validation: if present, exact permutation and a
valid topological order of the dependency graph (V-PROC-02) |
Example: `[research_data, analyze_revenue, generate_report]`

Field: configuration | Type: map[string,string] | Required: NO | Nullable: YES |
Description: strategy parameters | Allowed values: for `hierarchical`,
optional key `coordinator` = an `agents[].id` acting as delegation hub;
for `sequential`, no keys allowed | Default: null |
Reference: `agents[].id` (coordinator) |
Validation: keys restricted per type; coordinator resolves (V-PROC-03) |
Example: `{ coordinator: manager }`

## Strategy semantics (normative, minimal)

- `sequential`: tasks dispatch in `execution_order` (or derived order); each
  task sees outputs of its dependencies. Deterministic given the spec.
- `hierarchical`: the `coordinator` agent may delegate sub-work to
  specialists and integrates outputs; delegation is always to a named agent
  for a named task from the spec — no invented tasks, no invented agents.

## Capability vs decision

CREWAI CAPABILITY (framework supports): `sequential`, `hierarchical` as
defined above. AGENTOS DECISION (production default): none selected.

```text
PROCESS STRATEGY:
TBD — NOT DEFINED (non-critical: `type` is required per spec, so every
instance names its strategy explicitly; only the fleet-wide default awaits
a later phase)
```

## Valid / invalid

- `type: sequential` + acyclic deps → PASS.
- `type: random` → FAIL (V-PROC-01).
- `execution_order: [analyze_revenue, research_data]` while analyze depends
  on research → FAIL (V-PROC-02 order violates dependency).
- `type: hierarchical` without `coordinator` → PASS (coordinator optional;
  runtime uses manager-delegate pattern only if named).
- `type: hierarchical`, `coordinator: ghost` → FAIL (V-PROC-03).
