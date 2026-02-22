"""Narrative consistency engine based on entities and sentence semantics."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List

import numpy as np
import spacy
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

from ai_engine.utils.text_utils import normalize_text, split_sentences


@dataclass
class NarrativeResult:
    """Structured result for narrative consistency analysis."""

    entities: Dict[str, List[str]]
    consistency_score: float
    pairwise_similarities: List[float]


class NarrativeConsistencyEngine:
    """Analyzes text-level narrative consistency."""

    def __init__(self) -> None:
        self._nlp = self._load_spacy_model()
        self._nli_model = self._load_nli_model()

    @staticmethod
    def _load_spacy_model():
        try:
            return spacy.load("en_core_web_sm")
        except OSError:
            return spacy.blank("en")

    @staticmethod
    def _load_nli_model():
        try:
            from sentence_transformers import CrossEncoder
            return CrossEncoder("cross-encoder/nli-deberta-v3-small")
        except Exception:  # noqa: BLE001
            return None

    def _group_entities(self, text: str) -> Dict[str, List[str]]:
        doc = self._nlp(text)
        grouped: Dict[str, List[str]] = {}
        for ent in doc.ents:
            grouped.setdefault(ent.label_, [])
            if ent.text not in grouped[ent.label_]:
                grouped[ent.label_].append(ent.text)
        return grouped

    def _compute_long_context_consistency(self, sentences: List[str], window_size: int = 5) -> List[float]:
        """
        Check consistency of each sentence against a rolling window of past sentences.
        This provides long-text tracking across paragraphs instead of just adjacent pairs.
        """
        if len(sentences) < 2:
            return []

        if self._nli_model is None:
            return [0.5 for _ in range(len(sentences) - 1)]

        similarities: List[float] = []
        
        # Build pairs: Compare current sentence against up to `window_size` previous sentences
        pairs = []
        pair_indices = [] # keep track of which output belongs to which sentence index
        
        for i in range(1, len(sentences)):
            current_sentence = sentences[i]
            # Look back up to `window_size` sentences
            start_idx = max(0, i - window_size)
            past_context = " ".join(sentences[start_idx:i])
            
            pairs.append([past_context, current_sentence])
            pair_indices.append(i)

        # Batch predict for speed
        scores = self._nli_model.predict(pairs)
        
        for i in range(len(scores)):
            score_logits = scores[i]
            exp_scores = np.exp(score_logits - np.max(score_logits))
            probs = exp_scores / np.sum(exp_scores)
            
            # label 0 is contradiction, 1 is entailment, 2 is neutral
            # High contradiction probability = low consistency score
            consistency = 1.0 - float(probs[0])
            similarities.append(float(np.clip(consistency, 0.0, 1.0)))
            
        return similarities

    def analyze(self, text: str) -> NarrativeResult:
        """Extract entities and estimate long-context consistency score."""
        normalized = normalize_text(text)
        sentences = split_sentences(normalized)
        entities = self._group_entities(normalized)
        
        # Using a window size of 10 past sentences to hold global narrative state across longer text
        rolling_consistency = self._compute_long_context_consistency(sentences, window_size=10)
        
        consistency_score = float(np.mean(rolling_consistency)) if rolling_consistency else 1.0

        return NarrativeResult(
            entities=entities,
            consistency_score=float(np.clip(consistency_score, 0.0, 1.0)),
            pairwise_similarities=rolling_consistency,
        )

    def check_relevance(self, text: str, topic: str | None = None) -> dict:
        """Check if the latest part of the text is relevant to the topic."""
        if not topic or not text.strip():
            return {"is_on_topic": True, "relevance_score": 1.0, "suggestion": None}

        sentences = split_sentences(text)
        if not sentences:
             return {"is_on_topic": True, "relevance_score": 1.0, "suggestion": None}
             
        # Check the last 3 sentences (most recent focus)
        recent_text = " ".join(sentences[-3:])
        
        if self._nli_model is None:
             return {"is_on_topic": True, "relevance_score": 0.5, "suggestion": "NLI Model not loaded."}

        # NLI check: Does 'topic' entail 'recent_text'?
        # In NLI: label 0 contradiction, 1 entailment, 2 neutral
        score_logits = self._nli_model.predict([topic, recent_text])
        exp_scores = np.exp(score_logits - np.max(score_logits))
        probs = exp_scores / np.sum(exp_scores)
        
        relevance_score = float(probs[1]) + (0.5 * float(probs[2])) # Entailment + half Neutral
        is_on_topic = relevance_score > 0.4
        
        suggestion = None
        if not is_on_topic:
            suggestion = f"You might be drifting away from your topic: '{topic}'. Try to bring it back to the main point."
        elif relevance_score < 0.6:
            suggestion = "You're getting a bit off-track. Stay focused on the script's goal."

        return {
            "is_on_topic": is_on_topic,
            "relevance_score": relevance_score,
            "suggestion": suggestion
        }
