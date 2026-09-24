"""Builder tests: Plan -> validated CrewSpec (offline, no LLM)."""

import copy

import pytest

from backend.builder.builder import BuilderError, build, to_flow_inputs
from backend.crewai.validation.validator import validate
from backend.planner.service import PlannerService


def test_build_from_real_planner_passes_validation():
    plan = PlannerService().build_plan("tìm đơn hàng và phân tích doanh thu, báo cáo")
    spec = build(plan)
    assert validate(spec).valid
    assert spec["metadata"]["crew_id"] == plan["plan_id"]
    assert [t["id"] for t in spec["tasks"]] == [s["id"] for s in plan["steps"]]
    # dependency DAG preserved
    assert spec["tasks"][1]["depends_on"] == ["step_01"]
    assert spec["tasks"][1]["context"] == ["step_01.output"]


def test_step_types_map_to_expected_agents():
    plan = {"plan_id": "plan_x1", "query": "q",
            "steps": [{"id": "s1", "type": "lookup", "depends_on": []},
                      {"id": "s2", "type": "analysis", "depends_on": ["s1"]},
                      {"id": "s3", "type": "report", "depends_on": ["s2"]},
                      {"id": "s4", "type": "weird", "depends_on": []}]}
    spec = build(plan)
    by_task = {t["id"]: t["agent_ref"] for t in spec["tasks"]}
    assert by_task == {"s1": "researcher", "s2": "data_analyst",
                       "s3": "analyst", "s4": "executor"}
    assert validate(spec).valid


def test_invalid_plans_rejected():
    with pytest.raises(BuilderError):
        build({"query": "q", "steps": []})
    with pytest.raises(BuilderError):
        build({"plan_id": "p", "steps": [{"id": "s", "type": "t", "depends_on": []}]})
    with pytest.raises(BuilderError):
        build({"plan_id": "p", "query": "q", "steps": []})
    with pytest.raises(BuilderError):
        build({"plan_id": "p", "query": "q",
               "steps": [{"id": "", "type": "t", "depends_on": []}]})
    with pytest.raises(BuilderError):
        build("not-a-dict")


def test_build_does_not_mutate_plan():
    plan = PlannerService().build_plan("phan tich doanh thu")
    snapshot = copy.deepcopy(plan)
    build(plan)
    assert plan == snapshot


def test_to_flow_inputs_mapping():
    plan = PlannerService().build_plan("tong doanh thu?")
    spec = build(plan)
    inputs = to_flow_inputs(spec, context_text="CTX")
    assert inputs == {"query": plan["query"], "context_text": "CTX", "channel": None}
    with pytest.raises(BuilderError):
        to_flow_inputs({})
    with pytest.raises(BuilderError):
        to_flow_inputs({"objective": {}})
