"""Pydantic request models for API input validation."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    """Request body for the /analyze endpoint."""

    text: str = Field(..., min_length=1, description="Input text to analyze.")
    target_tone: Literal["formal", "informal", "neutral"] = Field(
        "neutral",
        description="Desired output tone.",
    )
    focus_topic: str | None = Field(None, description="Optional topic to check relevance against.")
