"""Crew Specification validator — rewritten from docs/backend/crewai/specs/*.md.

Pure stdlib, deterministic, read-only: never mutates its input, no LLM /
network / database / external calls. Rule IDs are exactly those of
specs/validation-spec.md. If ANY rule fails, the runtime MUST NOT execute.
"""

import re
from dataclasses import dataclass, field
from typing import Any, Dict, List, Tuple

SLUG_RE = re.compile(r"^[a-z0-9]+(?:_[a-z0-9]+)*$")
SEMVER_RE = re.compile(r"^(\d+)\.(\d+)\.(\d+)(?:-[0-9A-Za-z.-]+)?$")
KNOWN_SPEC_VERSION_MAJOR = 1

TOP_LEVEL_KEYS = (
    "metadata", "objective", "agents", "tasks", "tools",
    "dependencies", "process", "execution", "constraints",
)
REQUIRED_TOP = ("metadata", "objective", "agents", "tasks", "tools", "process")

SECRET_PATTERNS: Tuple[Tuple[str, "re.Pattern[str]"], ...] = tuple(
    (label, re.compile(pat, re.IGNORECASE))
    for label, pat in (
        ("api_key", r"api[_-]?key"),
        ("password", r"passw(or|d)"),
        ("token", r"token"),
        ("secret", r"secret"),
        ("bearer", r"bearer\s"),
        ("sk-prefix", r"sk-"),
        ("private-key", r"-----BEGIN .*PRIVATE KEY-----"),
    )
)

FAILURE_STRATEGIES = ("halt", "skip_dependents", "retry_once")
OUTPUT_STRATEGIES = ("last_task", "collect_all")
PROCESS_TYPES = ("sequential", "hierarchical")
AGENT_CONSTRAINT_RANGES = {"max_iterations": (1, 50), "timeout_seconds": (30, 3600)}


@dataclass(frozen=True)
class ValidationError:
    rule: str
    path: str
    message: str  # never carries secret values (V-SEC-01: label only)

    def __str__(self) -> str:
        return f"{self.rule}: {self.path}: {self.message}"


@dataclass(frozen=True)
class ValidationResult:
    valid: bool
    errors: Tuple[ValidationError, ...] = ()


def _is_int(value: Any) -> bool:
    return isinstance(value, int) and not isinstance(value, bool)


def _coerce_int(value: Any) -> Any:
    if _is_int(value):
        return value
    if isinstance(value, str):
        try:
            return int(value.strip())
        except ValueError:
            return None
    return None


class _Validator:
    def __init__(self) -> None:
        self.errors: List[ValidationError] = []

    def err(self, rule: str, path: str, message: str) -> None:
        self.errors.append(ValidationError(rule, path, message))

    def req_str(self, obj: Any, key: str, path: str, *,
                min_len: int = 1, max_len: int = 0) -> Any:
        """Required non-empty string; V-TOP-02 on missing/wrong/empty."""
        if not isinstance(obj, dict) or key not in obj:
            self.err("V-TOP-02", path, "missing required field")
            return None
        value = obj[key]
        if not isinstance(value, str) or len(value.strip()) < min_len:
            self.err("V-TOP-02", path, "must be a non-empty string")
            return None
        if max_len and len(value.strip()) > max_len:
            self.err("V-TOP-02", path, f"must be <= {max_len} chars")
            return None
        return value.strip()

    def opt_str(self, obj: Dict[str, Any], key: str, path: str) -> Any:
        if key not in obj or obj[key] is None:
            return None
        value = obj[key]
        if not isinstance(value, str):
            self.err("V-TOP-02", path, "must be a string or null")
            return None
        return value

    # -- top level ------------------------------------------------------

    def validate(self, spec: Any) -> ValidationResult:
        if not isinstance(spec, dict):
            self.err("V-TOP-02", "$", "spec must be an object")
            return self._done()
        for key in spec:
            if key not in TOP_LEVEL_KEYS:
                self.err("V-TOP-01", key, "unknown top-level key")
        for key in REQUIRED_TOP:
            if key not in spec:
                self.err("V-TOP-02", key, "missing required section")
        self._metadata(spec.get("metadata"))
        self._objective(spec.get("objective"))
        agent_ids = self._agents(spec.get("agents"))
        task_ids, dep_graph, contexts, agent_refs = self._tasks(
            spec.get("tasks"), agent_ids)
        tool_ids = self._tools(spec.get("tools"))
        self._tool_refs(spec.get("agents"), tool_ids)
        self._unreferenced_agents(spec.get("agents"), agent_refs)
        self._dependencies(spec.get("tasks"), spec.get("dependencies"),
                           task_ids, dep_graph)
        self._contexts(contexts, task_ids, dep_graph)
        self._process(spec.get("process"), task_ids, agent_ids, dep_graph)
        self._execution(spec.get("execution"))
        self._constraints(spec.get("constraints"), task_ids, agent_ids)
        self._secrets(spec)
        return self._done()

    def _done(self) -> ValidationResult:
        return ValidationResult(valid=not self.errors,
                                errors=tuple(self.errors))

    # -- metadata / objective ---------------------------------------------

    def _metadata(self, meta: Any) -> None:
        if meta is None:
            return
        if not isinstance(meta, dict):
            self.err("V-TOP-02", "metadata", "must be an object")
            return
        crew_id = self.req_str(meta, "crew_id", "metadata.crew_id")
        if crew_id is not None and not SLUG_RE.match(crew_id):
            self.err("V-TOP-02", "metadata.crew_id", "must be a slug")
        self.req_str(meta, "name", "metadata.name", max_len=120)
        version = self.req_str(meta, "version", "metadata.version")
        if version is not None:
            match = SEMVER_RE.match(version)
            if not match or int(match.group(1)) != KNOWN_SPEC_VERSION_MAJOR:
                self.err("V-TOP-02", "metadata.version",
                         "must be semver of known major "
                         f"{KNOWN_SPEC_VERSION_MAJOR}")
        desc = meta.get("description")
        if desc is not None and not isinstance(desc, str):
            self.err("V-TOP-02", "metadata.description",
                     "must be a string or null")

    def _objective(self, obj: Any) -> None:
        if obj is None:
            return
        if not isinstance(obj, dict):
            self.err("V-TOP-02", "objective", "must be an object")
            return
        self.req_str(obj, "objective", "objective.objective")
        self.req_str(obj, "goal", "objective.goal")
        self.req_str(obj, "expected_outcome", "objective.expected_outcome")

    # -- agents -------------------------------------------------------------

    def _agents(self, agents: Any) -> List[str]:
        ids: List[str] = []
        if agents is None:
            return ids
        if not isinstance(agents, list) or not agents:
            self.err("V-TOP-02", "agents", "must be a non-empty list")
            return ids
        seen: Dict[str, int] = {}
        for i, agent in enumerate(agents):
            path = f"agents[{i}]"
            if not isinstance(agent, dict):
                self.err("V-TOP-02", path, "must be an object")
                continue
            aid = self.req_str(agent, "id", f"{path}.id")
            if aid is not None:
                if not SLUG_RE.match(aid):
                    self.err("V-AG-02", f"{path}.id", "must be a slug")
                if aid in seen:
                    self.err("V-AG-01", f"{path}.id",
                             f"duplicate agent id '{aid}'")
                else:
                    seen[aid] = i
                    ids.append(aid)
            self.req_str(agent, "role", f"{path}.role", max_len=80)
            self.req_str(agent, "goal", f"{path}.goal")
            self.opt_str(agent, "backstory", f"{path}.backstory")
            self.req_str(agent, "model", f"{path}.model")
            tool_refs = agent.get("tool_refs")
            if not isinstance(tool_refs, list) or any(
                    not isinstance(t, str) for t in tool_refs):
                self.err("V-TOP-02", f"{path}.tool_refs",
                         "must be a list of strings")
            constraints = agent.get("constraints")
            if constraints is not None:
                self._agent_constraints(constraints, f"{path}.constraints")
        return ids

    def _agent_constraints(self, constraints: Any, path: str) -> None:
        if not isinstance(constraints, dict):
            self.err("V-EXE-01", path, "must be an object")
            return
        for key, value in constraints.items():
            if key not in AGENT_CONSTRAINT_RANGES:
                self.err("V-EXE-01", f"{path}.{key}", "unknown constraint key")
                continue
            low, high = AGENT_CONSTRAINT_RANGES[key]
            number = _coerce_int(value)
            if number is None or not (low <= number <= high):
                self.err("V-EXE-01", f"{path}.{key}",
                         f"must be an integer in {low}-{high}")

    # -- tasks ----------------------------------------------------------------

    def _tasks(self, tasks: Any, agent_ids: List[str]
               ) -> Tuple[List[str], Dict[str, List[str]],
                          List[Tuple[str, List[str]]], List[str]]:
        ids: List[str] = []
        graph: Dict[str, List[str]] = {}
        contexts: List[Tuple[str, List[str]]] = []
        agent_refs: List[str] = []
        if tasks is None:
            return ids, graph, contexts, agent_refs
        if not isinstance(tasks, list) or not tasks:
            self.err("V-TOP-02", "tasks", "must be a non-empty list")
            return ids, graph, contexts, agent_refs
        seen: Dict[str, int] = {}
        for i, task in enumerate(tasks):
            path = f"tasks[{i}]"
            if not isinstance(task, dict):
                self.err("V-TOP-02", path, "must be an object")
                continue
            tid = self.req_str(task, "id", f"{path}.id")
            if tid is not None:
                if not SLUG_RE.match(tid):
                    self.err("V-TOP-02", f"{path}.id", "must be a slug")
                if tid in seen:
                    self.err("V-TASK-01", f"{path}.id",
                             f"duplicate task id '{tid}'")
                    tid = None  # do not register twice
                else:
                    seen[tid] = i
                    ids.append(tid)
            self.req_str(task, "name", f"{path}.name", max_len=80)
            self.req_str(task, "description", f"{path}.description")
            agent_ref = task.get("agent_ref")
            if not isinstance(agent_ref, str) or not agent_ref:
                self.err("V-TASK-02" if isinstance(agent_ref, str)
                         else "V-TOP-02", f"{path}.agent_ref",
                         "must be a non-empty agent id string")
            else:
                agent_refs.append(agent_ref)
                if agent_ref not in agent_ids:
                    self.err("V-TASK-02", f"{path}.agent_ref",
                             f"references unknown agent '{agent_ref}'")
            self.req_str(task, "expected_output", f"{path}.expected_output")
            depends = task.get("depends_on", [])
            if not isinstance(depends, list) or any(
                    not isinstance(d, str) for d in depends):
                self.err("V-TOP-02", f"{path}.depends_on",
                         "must be a list of strings")
                depends = []
            if tid is not None:
                graph[tid] = list(depends)
            context = task.get("context", [])
            if not isinstance(context, list) or any(
                    not isinstance(c, str) for c in context):
                self.err("V-TOP-02", f"{path}.context",
                         "must be a list of strings")
            elif tid is not None and context:
                contexts.append((tid, list(context)))
        return ids, graph, contexts, agent_refs

    # -- tools ------------------------------------------------------------------

    def _tools(self, tools: Any) -> List[str]:
        ids: List[str] = []
        if tools is None:
            return ids
        if not isinstance(tools, list):
            self.err("V-TOP-02", "tools", "must be a list")
            return ids
        seen: Dict[str, int] = {}
        for i, tool in enumerate(tools):
            path = f"tools[{i}]"
            if not isinstance(tool, dict):
                self.err("V-TOP-02", path, "must be an object")
                continue
            tid = self.req_str(tool, "id", f"{path}.id")
            if tid is not None:
                if not SLUG_RE.match(tid):
                    self.err("V-TOP-02", f"{path}.id", "must be a slug")
                if tid in seen:
                    self.err("V-TOOL-02", f"{path}.id",
                             f"duplicate tool id '{tid}'")
                else:
                    seen[tid] = i
                    ids.append(tid)
            self.req_str(tool, "name", f"{path}.name", max_len=80)
            self.req_str(tool, "purpose", f"{path}.purpose")
            config_ref = tool.get("config_ref")
            if config_ref is not None:
                if not isinstance(config_ref, str) or not config_ref.strip():
                    self.err("V-TOP-02", f"{path}.config_ref",
                             "must be a non-empty name string")
                elif not SLUG_RE.match(config_ref.strip()):
                    self.err("V-TOP-02", f"{path}.config_ref",
                             "must be a slug-like name")
        return ids

    def _tool_refs(self, agents: Any, tool_ids: List[str]) -> None:
        if not isinstance(agents, list):
            return
        for i, agent in enumerate(agents):
            if not isinstance(agent, dict):
                continue
            refs = agent.get("tool_refs")
            if not isinstance(refs, list):
                continue
            for ref in refs:
                if isinstance(ref, str) and ref not in tool_ids:
                    self.err("V-TOOL-01", f"agents[{i}].tool_refs",
                             f"references unknown tool '{ref}'")

    def _unreferenced_agents(self, agents: Any,
                             agent_refs: List[str]) -> None:
        if not isinstance(agents, list):
            return
        refs = set(agent_refs)
        for i, agent in enumerate(agents):
            if not isinstance(agent, dict):
                continue
            aid = agent.get("id")
            if isinstance(aid, str) and aid not in refs:
                self.err("V-AG-03", f"agents[{i}].id",
                         f"agent '{aid}' is referenced by no task")

    # -- dependencies -------------------------------------------------------------

    def _dependencies(self, tasks: Any, declared: Any, task_ids: List[str],
                      graph: Dict[str, List[str]]) -> None:
        edge_list: List[Tuple[str, str]] = []
        seen_edges: Dict[Tuple[str, str], str] = {}
        for tid in graph:
            for dep in graph[tid]:
                if not isinstance(dep, str) or dep not in task_ids:
                    self.err("V-DEP-01", f"tasks.{tid}.depends_on",
                             f"references unknown task '{dep}'")
                    continue
                edge = (dep, tid)
                if edge in seen_edges:
                    self.err("V-DEP-04", f"tasks.{tid}.depends_on",
                             "duplicate dependency edge")
                else:
                    seen_edges[edge] = tid
                    edge_list.append(edge)
                if dep == tid:
                    self.err("V-DEP-02", f"tasks.{tid}.depends_on",
                             "task must not depend on itself")
                    continue
        if self._has_cycle(graph, task_ids):
            self.err("V-DEP-03", "tasks", "circular dependency detected")
        if declared is None:
            return
        if not isinstance(declared, list):
            self.err("V-TOP-02", "dependencies", "must be a list of edges")
            return
        declared_edges: List[Tuple[str, str]] = []
        for i, edge in enumerate(declared):
            path = f"dependencies[{i}]"
            if not isinstance(edge, dict):
                self.err("V-TOP-02", path, "must be an object")
                continue
            src = edge.get("source")
            tgt = edge.get("target")
            typ = edge.get("type", "blocks")
            if not isinstance(src, str) or src not in task_ids:
                self.err("V-DEP-01", f"{path}.source",
                         "must reference an existing task")
                continue
            if not isinstance(tgt, str) or tgt not in task_ids:
                self.err("V-DEP-01", f"{path}.target",
                         "must reference an existing task")
                continue
            if typ != "blocks":
                self.err("V-TOP-02", f"{path}.type",
                         "must be 'blocks'")
                continue
            declared_edges.append((src, tgt))
        if sorted(declared_edges) != sorted(edge_list):
            self.err("V-DEP-05", "dependencies",
                     "must equal the edge set derived from depends_on")

    @staticmethod
    def _has_cycle(graph: Dict[str, List[str]], order: List[str]) -> bool:
        white = set(order)
        gray: set = set()
        black: set = set()

        def visit(node: str) -> bool:
            if node in black:
                return False
            if node in gray:
                return True
            gray.add(node)
            for dep in graph.get(node, []):
                if dep in graph and visit(dep):
                    return True
            gray.discard(node)
            black.add(node)
            return False

        for node in order:
            if node in white:
                white.discard(node)
                if visit(node):
                    return True
        return False

    # -- task context ---------------------------------------------------------------

    def _contexts(self, contexts: List[Tuple[str, List[str]]],
                  task_ids: List[str], graph: Dict[str, List[str]]) -> None:
        for tid, entries in contexts:
            deps = set(graph.get(tid, []))
            for entry in entries:
                if entry.startswith("crew_input."):
                    if len(entry) <= len("crew_input."):
                        self.err("V-TASK-03", f"tasks.{tid}.context",
                                 "crew_input reference needs a key")
                    continue
                if entry.endswith(".output") and len(entry) > len(".output"):
                    ref = entry[: -len(".output")]
                    if ref not in task_ids:
                        self.err("V-TASK-03", f"tasks.{tid}.context",
                                 f"references unknown task '{ref}'")
                    elif ref not in deps:
                        self.err("V-TASK-03", f"tasks.{tid}.context",
                                 f"output of '{ref}' is not a declared "
                                 "dependency")
                else:
                    self.err("V-TASK-03", f"tasks.{tid}.context",
                             "must be 'crew_input.<key>' or "
                             "'<task_id>.output'")

    # -- process / execution / constraints ----------------------------------------------

    def _process(self, process: Any, task_ids: List[str],
                 agent_ids: List[str], graph: Dict[str, List[str]]) -> None:
        if process is None:
            return
        if not isinstance(process, dict):
            self.err("V-TOP-02", "process", "must be an object")
            return
        ptype = process.get("type")
        if ptype not in PROCESS_TYPES:
            self.err("V-PROC-01", "process.type",
                     "must be one of 'sequential', 'hierarchical'")
            ptype = None
        order = process.get("execution_order")
        if order is not None:
            if (not isinstance(order, list)
                    or sorted(order) != sorted(task_ids)
                    or any(not isinstance(t, str) for t in order)):
                self.err("V-PROC-02", "process.execution_order",
                         "must be a permutation of task ids")
            elif not self._order_respects_deps(order, graph):
                self.err("V-PROC-02", "process.execution_order",
                         "violates task dependencies")
        config = process.get("configuration")
        if config is not None:
            if not isinstance(config, dict):
                self.err("V-TOP-02", "process.configuration",
                         "must be an object")
            elif ptype == "sequential" and config:
                self.err("V-TOP-02", "process.configuration",
                         "sequential process takes no configuration keys")
            elif ptype == "hierarchical":
                for key, value in config.items():
                    if key != "coordinator":
                        self.err("V-TOP-02",
                                 f"process.configuration.{key}",
                                 "unknown configuration key")
                    elif value not in agent_ids:
                        self.err("V-PROC-03",
                                 "process.configuration.coordinator",
                                 "must reference an existing agent")

    @staticmethod
    def _order_respects_deps(order: List[str],
                             graph: Dict[str, List[str]]) -> bool:
        position = {tid: n for n, tid in enumerate(order)}
        return all(position[dep] < position[tid]
                   for tid in graph for dep in graph[tid]
                   if dep in position and tid in position)

    def _execution(self, execution: Any) -> None:
        if execution is None:
            return
        if not isinstance(execution, dict):
            self.err("V-EXE-01", "execution", "must be an object")
            return
        for key in execution:
            if key not in ("timeout_seconds", "max_iterations",
                           "failure_strategy", "output_strategy"):
                self.err("V-EXE-01", f"execution.{key}", "unknown field")
        timeout = execution.get("timeout_seconds")
        if timeout is not None and (
                _coerce_int(timeout) is None
                or not 30 <= _coerce_int(timeout) <= 3600):
            self.err("V-EXE-01", "execution.timeout_seconds",
                     "must be an integer in 30-3600")
        max_iter = execution.get("max_iterations")
        if max_iter is not None and (
                _coerce_int(max_iter) is None
                or not 1 <= _coerce_int(max_iter) <= 50):
            self.err("V-EXE-01", "execution.max_iterations",
                     "must be an integer in 1-50")
        failure = execution.get("failure_strategy")
        if failure is not None and failure not in FAILURE_STRATEGIES:
            self.err("V-EXE-01", "execution.failure_strategy",
                     f"must be one of {', '.join(FAILURE_STRATEGIES)}")
        output = execution.get("output_strategy")
        if output is not None and output not in OUTPUT_STRATEGIES:
            self.err("V-EXE-01", "execution.output_strategy",
                     f"must be one of {', '.join(OUTPUT_STRATEGIES)}")

    def _constraints(self, constraints: Any, task_ids: List[str],
                     agent_ids: List[str]) -> None:
        if constraints is None:
            return
        if not isinstance(constraints, dict):
            self.err("V-CON-01", "constraints", "must be an object")
            return
        for key in constraints:
            if key not in ("task_limit", "agent_limit", "allowed_resources"):
                self.err("V-CON-01", f"constraints.{key}", "unknown field")
        task_limit = constraints.get("task_limit")
        if task_limit is not None:
            number = _coerce_int(task_limit)
            if number is None or not 1 <= number <= 100:
                self.err("V-CON-01", "constraints.task_limit",
                         "must be an integer in 1-100")
            elif len(task_ids) > number:
                self.err("V-CON-01", "constraints.task_limit",
                         "task count exceeds task_limit")
        agent_limit = constraints.get("agent_limit")
        if agent_limit is not None:
            number = _coerce_int(agent_limit)
            if number is None or not 1 <= number <= 50:
                self.err("V-CON-01", "constraints.agent_limit",
                         "must be an integer in 1-50")
            elif len(agent_ids) > number:
                self.err("V-CON-01", "constraints.agent_limit",
                         "agent count exceeds agent_limit")
        resources = constraints.get("allowed_resources")
        if resources is not None:
            if (not isinstance(resources, list)
                    or any(not isinstance(r, str) or not r.strip()
                           for r in resources)
                    or len(set(resources)) != len(resources)):
                self.err("V-CON-01", "constraints.allowed_resources",
                         "must be unique non-empty strings")

    # -- security -------------------------------------------------------------------------

    def _secrets(self, spec: Dict[str, Any]) -> None:
        for path, value in self._walk_strings(spec, "$"):
            for label, pattern in SECRET_PATTERNS:
                if pattern.search(value):
                    self.err("V-SEC-01", path,
                             f"secret pattern '{label}' detected; "
                             "credentials must stay outside the spec")
                    break

    @staticmethod
    def _walk_strings(node: Any, path: str):
        if isinstance(node, dict):
            for key, value in node.items():
                key_path = f"{path}.{key}"
                if isinstance(key, str):
                    yield key_path, key
                yield from _Validator._walk_strings(value, key_path)
        elif isinstance(node, list):
            for i, value in enumerate(node):
                yield from _Validator._walk_strings(value, f"{path}[{i}]")
        elif isinstance(node, str):
            yield path, node


def validate(spec: Any) -> ValidationResult:
    """Validate a Crew Specification dict. Read-only, deterministic."""
    return _Validator().validate(spec)
