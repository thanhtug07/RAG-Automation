# agent-spec — Agent Specification (normative)

Part of PHASE 1. Conceptual background: `../AGENT_MODEL.md`. No production
agent roles are defined here; roles below appear only as spec examples.

## AgentSpec

Field: id | Type: string | Required: YES | Nullable: NO |
Description: sole handle for agent references; the only thing tasks use |
Allowed values: slug, unique within `agents` | Default: none |
Reference: referenced by `tasks[].agent_ref` |
Validation: matches slug pattern; unique; referenced by ≥ 1 task
(unreferenced agents rejected, V-AG-03) |
Example: `researcher`

Field: role | Type: string | Required: YES | Nullable: NO |
Description: function label, determines task eligibility |
Allowed values: 1–80 chars | Default: none |
Reference: — | Validation: non-empty |
Example: `Researcher`

Field: goal | Type: string | Required: YES | Nullable: NO |
Description: outcome the agent pursues within each assigned task |
Allowed values: non-empty text | Default: none |
Reference: — | Validation: non-empty |
Example: `Find accurate Q3 sales data.`

Field: backstory | Type: string | Required: NO | Nullable: YES |
Description: working context/persona; advisory only, never overrides goal,
tools, or task description | Allowed values: free text | Default: null |
Reference: — | Validation: type only |
Example: `You are a careful sales-data researcher.`

Field: model | Type: string | Required: YES | Nullable: NO |
Description: LLM binding by name (never credentials, never parameters) |
Allowed values: entry of the approved model catalog |
Default: none | Reference: runtime model catalog |
Validation: non-empty string; catalog membership enforced by the runtime,
not the spec validator. Approved catalog: TBD — NOT DEFINED (non-critical:
field shape and rules are final; only the catalog contents await the
runtime phase) |
Example: `approved-model-a`

Field: tool_refs | Type: string[0..] | Required: YES | Nullable: NO |
Description: maximum tool set of this agent; each entry is a capability id.
Empty list = reasoning-only agent |
Allowed values: subset of `tools[].id` | Default: none (key required, may
be `[]`) | Reference: `tools[].id` |
Validation: every entry resolves (V-TOOL-01); task execution further
narrows to the task's effective allowlist |
Example: `[document_search]`

Field: constraints | Type: map[string,string] | Required: NO | Nullable: YES |
Description: per-agent limits | Allowed values: keys restricted to
`max_iterations`, `timeout_seconds` (same ranges as execution) |
Default: null | Reference: — |
Validation: keys from allowed set; values in range |
Example: `{ max_iterations: "5" }`

## Relationships

- Agent → Task: via `tasks[].agent_ref == agents[].id` (exactly one assignee
  per task; joint ownership invalid).
- Agent → Tool: via `tool_refs ⊆ tools[].id`. Agents never declare tools
  inline; unknown ids rejected.

## Valid example

```yaml
- id: researcher
  role: Researcher
  goal: Find accurate Q3 sales data.
  model: approved-model-a
  tool_refs: [document_search]
```

## Invalid examples

- Two agents with `id: researcher` → FAIL (V-AG-01 duplicate Agent ID).
- `tool_refs: [mind_reader]` undeclared → FAIL (V-TOOL-01).
- Agent `archivist` referenced by no task → FAIL (V-AG-03 unreferenced).
- `model: ""` → FAIL (required, non-empty).
