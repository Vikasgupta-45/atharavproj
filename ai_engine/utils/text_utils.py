"""Shared text utility helpers."""

from __future__ import annotations

import re
from typing import List

import nltk
from nltk.tokenize import sent_tokenize


def normalize_text(text: str) -> str:
    """Normalize whitespace for stable downstream processing."""
    return re.sub(r"\s+", " ", text).strip()


def split_sentences(text: str) -> List[str]:
    """Split text into sentences using NLTK with regex fallback."""
    try:
        nltk.data.find("tokenizers/punkt")
    except LookupError:
        try:
            nltk.download("punkt", quiet=True)
        except Exception:  # noqa: BLE001
            pass

    try:
        sentences = [s.strip() for s in sent_tokenize(text) if s.strip()]
        if sentences:
            return sentences
    except Exception:  # noqa: BLE001
        pass

    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
