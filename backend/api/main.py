"""Backend API foundation with shared contracts and health endpoints."""

from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException

from backend.core.config import get_settings
from backend.core.contracts import (
    WorkflowStep,
    build_api_response,
    create_run_event,
    create_run_summary,
)

settings = get_settings()
app = FastAPI(title=settings.app_name, version=settings.app_version)


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.get(f"{settings.api_prefix}/health")
def health_v1() -> Dict[str, Any]:
    return build_api_response(True, {"status": "ok", "version": "v1"})


@app.post(f"{settings.api_prefix}/runs")
def create_run(payload: Dict[str, Any]) -> Dict[str, Any]:
    run_id = payload.get("run_id") or "run_001"
    status = payload.get("status", "queued")
    summary = create_run_summary(run_id, status)
    event = create_run_event(run_id, "run.created", {"source": payload})
    return build_api_response(True, {"run": summary, "event": event})


@app.get(f"{settings.api_prefix}/runs/{{run_id}}/status")
def get_run_status(run_id: str) -> Dict[str, Any]:
    summary = create_run_summary(run_id, "queued")
    return build_api_response(True, {"run": summary})


@app.get(f"{settings.api_prefix}/runs/{{run_id}}/events")
def get_run_events(run_id: str) -> Dict[str, Any]:
    event = create_run_event(run_id, "run.started", {"message": "run accepted"})
    return build_api_response(True, {"events": [event]})


@app.post(f"{settings.api_prefix}/plans")
def create_plan(payload: Dict[str, Any]) -> Dict[str, Any]:
    steps: List[WorkflowStep] = [
        WorkflowStep(id="step_01", type="lookup", depends_on=[]),
        WorkflowStep(id="step_02", type="analysis", depends_on=["step_01"]),
        WorkflowStep(id="step_03", type="report", depends_on=["step_02"]),
    ]
    plan = {
        "plan_id": payload.get("plan_id") or "plan_001",
        "steps": [step.to_dict() for step in steps],
    }
    return build_api_response(True, {"plan": plan})
