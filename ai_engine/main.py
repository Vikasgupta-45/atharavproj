"""FastAPI entrypoint for the modular AI text analysis backend."""

from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from ai_engine.engines.diff_engine import DiffEngine
from ai_engine.engines.explanation_engine import ExplanationEngine
from ai_engine.engines.narrative_engine import NarrativeConsistencyEngine
from ai_engine.engines.structure_engine import StructureClarityEngine
from ai_engine.engines.tone_engine import ToneControlEngine
from ai_engine.engines.correction_engine import CorrectionEngine
from ai_engine.models.request_models import AnalyzeRequest
from ai_engine.models.response_models import AnalyzeResponse
from ai_engine.models.live_models import LiveCheckRequest, LiveCheckResponse

app = FastAPI(
    title="AI Text Analysis Engine",
    version="1.0.0",
    description="Modular backend for narrative, structure, tone, explanation, and diff analysis.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

narrative_engine = NarrativeConsistencyEngine()
structure_engine = StructureClarityEngine()
tone_engine = ToneControlEngine()
diff_engine = DiffEngine()
explanation_engine = ExplanationEngine()
correction_engine = CorrectionEngine()


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_text(payload: AnalyzeRequest) -> AnalyzeResponse:
    """Run full text analysis pipeline and return a structured response."""
    try:
        narrative_result = narrative_engine.analyze(payload.text)
        structure_result = structure_engine.analyze(payload.text)
        # Phase 1: Context and Tone modification
        tone_result = tone_engine.analyze(payload.text, payload.target_tone)
        
        # Phase 2: Explicit Error Correction (catching what the model missed)
        correction_result = correction_engine.analyze(tone_result.modified_text)
        
        final_modified_text = correction_result.corrected_text
        
        # Calculate diff between ORIGINAL and FINAL corrected/toned text
        diff_result = diff_engine.analyze(payload.text, final_modified_text)

        # ── Enrichment Phase ──
        # Attach reasons from CorrectionEngine to the Diff items if they match
        final_changes = []
        for change in diff_result.changes:
            # Look for a reason in the correction result
            reason = None
            # Matching logic: check if this 'before' word was corrected
            match = next((c for c in correction_result.changes if c["before"] == change["before"]), None)
            if match:
                reason = match.get("reason")
            
            # Default reasons if missing
            if not reason:
                if change["type"] == "modification":
                    reason = "AI adjusted this word to better match the target tone and flow."
                elif change["type"] == "addition":
                    reason = "AI added this to improve narrative clarity."
                elif change["type"] == "deletion":
                    reason = "AI removed this for conciseness."

            final_changes.append({
                **change,
                "reason": reason
            })

        explanation = explanation_engine.analyze(
            narrative_output=narrative_result,
            structure_output=structure_result,
            tone_output=tone_result,
            diff_output=diff_result,
        )

        return AnalyzeResponse(
            consistency_score=narrative_result.consistency_score,
            readability_score=structure_result.readability_score,
            detected_tone=tone_result.detected_tone,
            modified_text=final_modified_text,
            changes=final_changes,
            explanation=explanation.explanation,
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Analysis pipeline failed: {exc}") from exc


@app.post("/live-check", response_model=LiveCheckResponse)
def live_check(payload: LiveCheckRequest) -> LiveCheckResponse:
    """Real-time relevance checking as the user types."""
    try:
        result = narrative_engine.check_relevance(payload.text, payload.topic)
        return LiveCheckResponse(**result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Live check failed: {exc}") from exc
