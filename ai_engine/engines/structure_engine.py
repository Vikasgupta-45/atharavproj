"""Structure and clarity engine using readability and grammar rules."""

from __future__ import annotations

from dataclasses import dataclass
from typing import List

import textstat

from ai_engine.utils.text_utils import normalize_text, split_sentences


@dataclass
class StructureResult:
    """Structured result for structure and clarity analysis."""

    readability_score: float
    long_sentences: List[str]
    suggestions: List[str]


class StructureClarityEngine:
    """Computes readability, long sentences, and grammar suggestions."""

    def __init__(self) -> None:
        try:
            import nltk
            nltk.download('punkt', quiet=True)
            nltk.download('punkt_tab', quiet=True)
            nltk.download('brown', quiet=True)
        except Exception:
            pass

    @staticmethod
    def _find_long_sentences(sentences: List[str], threshold: int = 30) -> List[str]:
        long_ones: List[str] = []
        for sentence in sentences:
            if len(sentence.split()) > threshold:
                long_ones.append(sentence)
        return long_ones

    def _grammar_suggestions(self, text: str) -> List[str]:
        try:
            from textblob import TextBlob
            blob = TextBlob(text)
            messages: List[str] = []
            
            for sentence in blob.sentences:
                for word in sentence.words:
                    if len(word) > 2:
                        corrected = word.correct()
                        if word.lower() != corrected.lower():
                            messages.append(f"Possible spelling/grammar issue: '{word}'. Consider '{corrected}'.")
                            if len(messages) >= 10:
                                return messages
            return messages
        except Exception as e:
            return [f"Grammar checker encountered an issue: {e}"]

    def analyze(self, text: str) -> StructureResult:
        """Run structure and clarity analysis for the input text."""
        normalized = normalize_text(text)
        sentences = split_sentences(normalized)
        readability = float(textstat.flesch_reading_ease(normalized))
        long_sentences = self._find_long_sentences(sentences)
        suggestions = self._grammar_suggestions(normalized)

        if readability < 50:
            suggestions.append("Improve readability by using shorter sentences and simpler words.")
        if long_sentences:
            suggestions.append(f"Split {len(long_sentences)} long sentence(s) to improve clarity.")
        if not suggestions:
            suggestions.append("Structure and clarity look good.")

        return StructureResult(
            readability_score=readability,
            long_sentences=long_sentences,
            suggestions=suggestions,
        )
