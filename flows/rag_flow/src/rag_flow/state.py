"""Typed Flow state (Pydantic). Single source of truth passed between steps."""

from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class RagFlowState(BaseModel):
    query: str = ""
    context_text: str = ""
    channel: Optional[Literal["shopee", "tiktok", "p2p"]] = None
    intent: str = ""
    retrieved_docs: List[str] = Field(default_factory=list)
    analysis_result: str = ""
    final_answer: str = ""
    confidence: float = 0.0
    error: Optional[str] = None
    metadata: dict = Field(default_factory=dict)
