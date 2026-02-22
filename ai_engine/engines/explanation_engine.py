"""Explanation engine that aggregates outputs from all analysis engines."""

from __future__ import annotations

from dataclasses import dataclass
from typing import List

from ai_engine.engines.diff_engine import DiffResult
from ai_engine.engines.narrative_engine import NarrativeResult
from ai_engine.engines.structure_engine import StructureResult
from ai_engine.engines.tone_engine import ToneResult


@dataclass
class ExplanationResult:
    """Structured explanation payload."""

    explanation: List[str]


class ExplanationEngine:
    """Builds consolidated explanations for downstream services."""

    @staticmethod
    def analyze(
        narrative_output: NarrativeResult,
        structure_output: StructureResult,
        tone_output: ToneResult,
        diff_output: DiffResult,
    ) -> ExplanationResult:
        """Combine engine outputs into readable explanation entries."""
        items: List[str] = []

        if narrative_output.consistency_score < 0.5:
            items.append(
                f"Narrative warning: low adjacent sentence consistency ({narrative_output.consistency_score:.2f})."
            )
        else:
            items.append(
                f"Narrative status: consistency is acceptable ({narrative_output.consistency_score:.2f})."
            )

        if structure_output.suggestions:
            for suggestion in structure_output.suggestions:
                items.append(f"Structure suggestion: {suggestion}")

        if tone_output.applied_replacements:
            items.append(
                f"Tone modifications applied: {', '.join(tone_output.applied_replacements)}"
            )
        else:
            items.append("Tone modifications: no replacements were applied.")

        items.append(f"Change tracker detected {len(diff_output.changes)} change(s).")
        return ExplanationResult(explanation=items)
