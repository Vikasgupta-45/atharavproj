"""Diff engine for structured text change tracking."""

from __future__ import annotations

import difflib
from dataclasses import dataclass
from typing import Dict, List


@dataclass
class DiffResult:
    """Structured result for text differences."""

    changes: List[Dict[str, str]]


class DiffEngine:
    """Tracks additions, deletions, and modifications between two texts."""

    @staticmethod
    def analyze(original_text: str, modified_text: str) -> DiffResult:
        """Generate structured changes using difflib opcodes."""
        original_words = original_text.split()
        modified_words = modified_text.split()
        matcher = difflib.SequenceMatcher(a=original_words, b=modified_words)

        changes: List[Dict[str, str]] = []
        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == "equal":
                continue

            before = " ".join(original_words[i1:i2]).strip()
            after = " ".join(modified_words[j1:j2]).strip()

            change_type = "modification"
            if tag == "insert":
                change_type = "addition"
            elif tag == "delete":
                change_type = "deletion"

            if before or after:
                changes.append(
                    {
                        "type": change_type,
                        "before": before,
                        "after": after,
                    }
                )

        return DiffResult(changes=changes)
