from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from typing import Any, Dict, List


@dataclass(frozen=True)
class PlanTask:
    id: str
    type: str
    depends_on: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "type": self.type,
            "depends_on": list(self.depends_on),
            "metadata": dict(self.metadata),
        }


class PlannerService:
    """Build a simple execution plan from a user query."""

    def build_plan(self, query: str) -> Dict[str, Any]:
        normalized = (query or "").lower()
        plan_id = f"plan_{uuid.uuid4().hex[:8]}"

        steps: List[PlanTask] = []
        lookup_needed = any(keyword in normalized for keyword in ("đơn", "sản phẩm", "tìm", "tra cứu", "đặt hàng", "mã"))
        analysis_needed = any(keyword in normalized for keyword in ("phân tích", "doanh thu", "bán", "tổng", "thống kê"))
        report_needed = any(keyword in normalized for keyword in ("báo cáo", "tổng kết", "kết luận", "summary", "report"))

        if lookup_needed:
            steps.append(PlanTask(id="step_01", type="lookup", depends_on=[]))
        if analysis_needed:
            steps.append(PlanTask(id="step_02", type="analysis", depends_on=[step.id for step in steps]))
        if report_needed or not steps:
            steps.append(PlanTask(id="step_03", type="report", depends_on=[step.id for step in steps]))

        if not steps:
            steps = [
                PlanTask(id="step_01", type="lookup", depends_on=[]),
                PlanTask(id="step_02", type="analysis", depends_on=["step_01"]),
                PlanTask(id="step_03", type="report", depends_on=["step_02"]),
            ]

        return {
            "plan_id": plan_id,
            "query": query,
            "steps": [step.to_dict() for step in steps],
        }
