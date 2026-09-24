from backend.core.config import Settings, get_settings
from backend.core.contracts import (
    TenantContext,
    WorkflowStep,
    build_api_response,
    create_run_event,
    create_run_summary,
)


def test_tenant_context_serializes_cleanly():
    context = TenantContext(
        tenant_id="tenant_001",
        user_id="user_001",
        organization_id="org_001",
        roles=("admin", "operator"),
    )

    assert context.to_dict()["tenant_id"] == "tenant_001"
    assert context.to_dict()["roles"] == ["admin", "operator"]


def test_workflow_step_creation():
    step = WorkflowStep(
        id="step_01",
        type="lookup",
        depends_on=[],
        metadata={"source": "orders"},
    )

    assert step.id == "step_01"
    assert step.type == "lookup"
    assert step.to_dict()["depends_on"] == []


def test_run_event_and_summary_helpers():
    event = create_run_event("run_123", "run.started", {"message": "starting"})
    summary = create_run_summary("run_123", "queued")

    assert event["run_id"] == "run_123"
    assert event["event_type"] == "run.started"
    assert summary["status"] == "queued"
    assert summary["run_id"] == "run_123"


def test_api_response_builder_and_settings():
    payload = build_api_response(True, {"status": "ok"}, None)
    settings = get_settings()

    assert payload["success"] is True
    assert payload["data"]["status"] == "ok"
    assert isinstance(settings, Settings)
    assert settings.app_name == "rag-automation"
