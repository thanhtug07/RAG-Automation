"""Validator unit tests — mirrors specs/validation-spec.md (valid V1 + invalid I*)."""

import copy

from backend.crewai.validation.validator import validate


def agent(aid, tools=("doc_search",), role="Researcher"):
    return {"id": aid, "role": role, "goal": f"Goal of {aid}.",
            "model": "approved-model-a", "tool_refs": list(tools)}


def task(tid, agent_ref, depends=(), context=()):
    return {"id": tid, "name": f"Name of {tid}.",
            "description": f"Do work for {tid}.",
            "agent_ref": agent_ref,
            "expected_output": f"Output of {tid}.",
            "depends_on": list(depends), "context": list(context)}


def tool(tid):
    return {"id": tid, "name": f"Name of {tid}.",
            "purpose": f"Purpose of {tid}."}


def base():
    return {
        "metadata": {"crew_id": "crew_a", "name": "Crew A",
                     "version": "1.0.0-draft"},
        "objective": {"objective": "Analyze Q3 revenue.",
                      "goal": "A reviewed revenue picture.",
                      "expected_outcome": "Report with figures."},
        "agents": [agent("researcher")],
        "tasks": [task("research_data", "researcher")],
        "tools": [tool("doc_search")],
        "process": {"type": "sequential"},
    }


def rules_of(result):
    return {e.rule for e in result.errors}


def test_valid_minimal_crew():
    assert validate(base()).valid


def test_valid_chain_with_context():
    spec = base()
    spec["agents"] = [agent("researcher"), agent("analyst")]
    spec["tasks"] = [task("a", "researcher"),
                     task("b", "analyst", depends=("a",), context=("a.output",))]
    assert validate(spec).valid


def test_missing_required_field_v_top_02():
    spec = base()
    del spec["objective"]["goal"]
    result = validate(spec)
    assert not result.valid and "V-TOP-02" in rules_of(result)


def test_unknown_top_level_key_v_top_01():
    spec = base()
    spec["whatever"] = 1
    result = validate(spec)
    assert not result.valid and "V-TOP-01" in rules_of(result)


def test_duplicate_agent_id_v_ag_01():
    spec = base()
    spec["agents"] = [agent("researcher"), agent("researcher")]
    result = validate(spec)
    assert not result.valid and "V-AG-01" in rules_of(result)


def test_unknown_agent_reference_v_task_02():
    spec = base()
    spec["tasks"] = [task("research_data", "ghost")]
    result = validate(spec)
    assert not result.valid and "V-TASK-02" in rules_of(result)
    assert any(e.path == "tasks[0].agent_ref" for e in result.errors)


def test_unknown_tool_reference_v_tool_01():
    spec = base()
    spec["agents"] = [agent("researcher", tools=("mind_reader",))]
    result = validate(spec)
    assert not result.valid and "V-TOOL-01" in rules_of(result)


def test_circular_dependency_v_dep_03():
    spec = base()
    spec["agents"] = [agent("a1"), agent("a2")]
    spec["tasks"] = [task("a", "a1", depends=("b",)),
                     task("b", "a2", depends=("a",))]
    result = validate(spec)
    assert not result.valid and "V-DEP-03" in rules_of(result)


def test_invalid_process_v_proc_01():
    spec = base()
    spec["process"] = {"type": "random"}
    result = validate(spec)
    assert not result.valid and "V-PROC-01" in rules_of(result)


def test_invalid_execution_v_exe_01():
    spec = base()
    spec["execution"] = {"timeout_seconds": 99999}
    result = validate(spec)
    assert not result.valid and "V-EXE-01" in rules_of(result)


def test_secret_inside_spec_v_sec_01_no_leak():
    spec = base()
    spec["tools"][0]["config_ref"] = "sk-live-abc123"
    result = validate(spec)
    assert not result.valid and "V-SEC-01" in rules_of(result)
    assert all("sk-live-abc123" not in e.message for e in result.errors)


def test_validator_is_deterministic_and_read_only():
    spec = base()
    snapshot = copy.deepcopy(spec)
    first = validate(spec)
    second = validate(spec)
    assert spec == snapshot
    assert first == second
