# crew-spec — Crew Specification (normative)

Part of PHASE 1 — CrewAI Specification. This file is the normative top-level
contract. Conceptual background: `../CREW_SPECIFICATION.md`, `../CREW_MODEL.md`.
Field-block convention: Field / Type / Required / Nullable / Description /
Allowed values / Default / Reference / Validation / Example.

Conventions used by all 7 specs: `id` slugs match `^[a-z0-9]+(_[a-z0-9]+)*$`,
max 64 chars. "Required YES + Nullable NO" unless stated._JSON/YAML-shaped
examples are specification illustrations, not implementation code._

## Structure

```text
CrewSpecification
├── metadata      (required, object — §1)
├── objective     (required, object — §2)
├── agents        (required, AgentSpec[1..] — ./agent-spec.md)
├── tasks         (required, TaskSpec[1..] — ./task-spec.md)
├── tools         (required, ToolSpec[0..] — ./tool-spec.md)
├── dependencies  (optional, edge list — ./dependency-spec.md)
├── process       (required, object — ./process-spec.md)
├── execution     (optional, object — §3)
└── constraints   (optional, object — §4)
```

Top-level validation: no unknown top-level keys; every required section
present with the correct container type (V-TOP-01).

## 1. metadata

Field: crew_id | Type: string | Required: YES | Nullable: NO |
Description: stable unique identifier of this spec instance |
Allowed values: slug | Default: none |
Reference: — | Validation: non-empty, unique per run scope |
Example: `q3_revenue_v1`

Field: name | Type: string | Required: YES | Nullable: NO |
Description: short human-readable label |
Allowed values: 1–120 chars | Default: none |
Reference: — | Validation: non-empty, trimmed |
Example: `Q3 revenue analysis`

Field: version | Type: string | Required: YES | Nullable: NO |
Description: spec-format version this instance conforms to |
Allowed values: semantic version | Default: none |
Reference: — | Validation: parses as semver; unknown major → reject.
Current issued version: `1.0.0-draft` |
Example: `1.0.0-draft`

Field: description | Type: string | Required: NO | Nullable: YES |
Description: one-paragraph summary of what the crew does |
Allowed values: free text | Default: null |
Reference: — | Validation: type only |
Example: `Research, analyze and report Q3 revenue.`

## 2. objective

Field: objective | Type: string | Required: YES | Nullable: NO |
Description: the business question or mission for this run |
Validation: non-empty | Example: `Analyze Q3 revenue.`

Field: goal | Type: string | Required: YES | Nullable: NO |
Description: the state the crew must bring about (checked for task coverage:
every goal clause is addressed by ≥ 1 task) |
Validation: non-empty | Example: `A reviewed picture of Q3 revenue drivers.`

Field: expected_outcome | Type: string | Required: YES | Nullable: NO |
Description: artifact contract of the final Crew Result — format, language,
required content (checked for result shape, not world state) |
Validation: non-empty | Example: `Report with findings, figures, cited
sources, in Vietnamese.`

## 3. execution (optional)

Present only when the run needs non-default runtime behavior. All fields
optional; each exists for one reason (stated). Absent = default.

Field: timeout_seconds | Type: integer | Required: NO | Nullable: NO |
Description: max wall-clock per task run; reason: bounding stuck tool calls |
Allowed values: 30–3600 | Default: 300 |
Reference: — | Validation: within range |
Example: `300`

Field: max_iterations | Type: integer | Required: NO | Nullable: NO |
Description: cap on agent reasoning/tool-call loops per task; reason:
bounding runaway loops | Allowed values: 1–50 | Default: 10 |
Validation: within range | Example: `10`

Field: failure_strategy | Type: string | Required: NO | Nullable: NO |
Description: behavior on task failure; reason: deterministic recovery |
Allowed values: `halt`, `skip_dependents`, `retry_once` |
Default: `halt` | Validation: one of allowed |
Example: `halt`

Field: output_strategy | Type: string | Required: NO | Nullable: NO |
Description: how task outputs aggregate; reason: deterministic result shape |
Allowed values: `last_task`, `collect_all` | Default: `collect_all` |
Validation: one of allowed | Example: `collect_all`

## 4. constraints (optional)

Declarative limits the runtime MUST respect. Absent section = only the
spec's own declarations constrain the run.

Field: task_limit | Type: integer | Required: NO | Nullable: NO |
Description: max tasks in `tasks` | Allowed values: 1–100 | Default: 20 |
Validation: `len(tasks) <= task_limit` | Example: `20`

Field: agent_limit | Type: integer | Required: NO | Nullable: NO |
Description: max agents in `agents` | Allowed values: 1–50 | Default: 10 |
Validation: `len(agents) <= agent_limit` | Example: `10`

Field: allowed_resources | Type: string[0..] | Required: NO | Nullable: NO |
Description: named data/compute scopes the crew may touch; every tool use
must fall inside one scope | Allowed values: free names, non-empty |
Default: `[]` (= no resource restriction beyond tool catalog) |
Validation: entries non-empty, unique | Example: `["sales_reports"]`

The tool allowlist is the `tools` catalog itself (§5 of package): any tool id
referenced but not declared is rejected (V-TOOL-01). No other constraint
vocabulary exists in this version.

## 5. Cross references (normative)

- `agents[].id` — defined in `./agent-spec.md`; referenced by
  `tasks[].agent_ref`.
- `tasks[].id` — defined in `./task-spec.md`; referenced by
  `tasks[].depends_on`, `tasks[].context`, `dependencies[]`.
- `tools[].id` — defined in `./tool-spec.md`; referenced by
  `agents[].tool_refs`.
- Edge semantics — `./dependency-spec.md`. Process — `./process-spec.md`.
- Full rule matrix and test scenarios — `./validation-spec.md`.

## 6. Valid minimal example (spec illustration)

```yaml
metadata: { crew_id: q3_min, name: Q3 minimal, version: 1.0.0-draft }
objective:
  objective: Analyze Q3 revenue.
  goal: A reviewed picture of Q3 revenue drivers.
  expected_outcome: Short report with figures, in Vietnamese.
agents:
  - id: analyst
    role: Data Analyst
    goal: Analyze revenue figures.
    model: approved-model-a
    tool_refs: [database_query]
tasks:
  - id: analyze_revenue
    name: Analyze revenue
    description: Analyze Q3 revenue from sales reports.
    agent_ref: analyst
    expected_output: Findings with figures, in Vietnamese.
tools:
  - id: database_query
    name: Database Query
    purpose: Query sales figures from approved reports.
process: { type: sequential }
```

## 7. Invalid examples (spec illustration)

- Missing `objective.goal` → FAIL (V-TOP-02, required field).
- `tasks[0].agent_ref: ghost` with no such agent → FAIL (V-TASK-02).
- `tools: []` while `agents[0].tool_refs: [database_query]` → FAIL (V-TOOL-01).
- `process.type: random` → FAIL (V-PROC-01).

## 8. Failure cases

- Unknown top-level key → reject whole spec (V-TOP-01).
- Empty `agents` or `tasks` → reject (crew must have ≥ 1 of each).
- `len(tasks)` exceeding `constraints.task_limit` → reject.
- Secret-looking string anywhere (`api_key`, `password`, `token`, `secret`
  patterns per `./validation-spec.md` V-SEC-01) → reject, CrewAI MUST NOT
  execute.
