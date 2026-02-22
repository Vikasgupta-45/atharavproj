"""Pydantic response models for API output."""

from __future__ import annotations

from typing import List

from pydantic import BaseModel


class ChangeItem(BaseModel):
    """Represents one detected text change."""

    type: str
    before: str
    after: str
    reason: str | None = None


class AnalyzeResponse(BaseModel):
    """Response body for the /analyze endpoint."""

    consistency_score: float
    readability_score: float
    detected_tone: str
    modified_text: str
    changes: List[ChangeItem]
    explanation: List[str]
