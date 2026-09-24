from backend.execution.service import ExecutionService, RunRecord, RunStatus
from backend.planner.service import PlannerService, PlanTask


def test_planner_builds_task_plan():
    planner = PlannerService()
    plan = planner.build_plan("tìm đơn hàng và phân tích doanh thu")

    assert plan["plan_id"].startswith("plan_")
    assert any(step["type"] == "lookup" for step in plan["steps"])
    assert any(step["type"] == "analysis" for step in plan["steps"])


def test_execution_service_tracks_run_status():
    service = ExecutionService()
    run = service.create_run("plan_001")

    assert run.status == RunStatus.QUEUED
    run = service.start_run(run.run_id)
    assert run.status == RunStatus.RUNNING
    run = service.complete_run(run.run_id)
    assert run.status == RunStatus.SUCCEEDED


def test_plan_task_shape():
    task = PlanTask(id="t1", type="lookup", depends_on=[])
    assert task.id == "t1"
