"""Tone control engine backed by a local LoRA model."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional

import torch
from peft import PeftModel
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

@dataclass
class ToneResult:
    """Structured result for tone detection and modification."""

    detected_tone: str
    modified_text: str
    applied_replacements: List[str]


class ToneControlEngine:
    """Loads local LoRA adapter and performs tone rewrite inference."""

    def __init__(
        self,
        adapter_path: str = "ai_engine/tone_lora_model",
        base_model_name_or_path: Optional[str] = None,
    ) -> None:
        self.adapter_path = Path(adapter_path)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        self.tokenizer = None
        self.load_error: Optional[str] = None

        detected_base_model = self._read_base_model_from_adapter_config()
        self.base_model_name_or_path = (
            base_model_name_or_path
            or detected_base_model
            or "google/flan-t5-small"
        )

        self._load_model()

    def _read_base_model_from_adapter_config(self) -> Optional[str]:
        config_path = self.adapter_path / "adapter_config.json"
        if not config_path.exists():
            return None
        try:
            import json

            with config_path.open("r", encoding="utf-8") as fp:
                config = json.load(fp)
            value = config.get("base_model_name_or_path")
            return str(value) if value else None
        except Exception:
            return None

    def _load_model(self) -> None:
        try:
            if not self.adapter_path.exists():
                raise FileNotFoundError(f"Adapter path not found: {self.adapter_path}")

            # For this adapter, base model should be google/flan-t5-small.
            self.tokenizer = AutoTokenizer.from_pretrained(str(self.adapter_path), use_fast=True)
            base_model = AutoModelForSeq2SeqLM.from_pretrained(self.base_model_name_or_path)
            self.model = PeftModel.from_pretrained(base_model, str(self.adapter_path))
            self.model.to(self.device)
            self.model.eval()
            self.load_error = None
        except Exception as exc:  # noqa: BLE001
            self.model = None
            self.tokenizer = None
            self.load_error = str(exc)

    def _detect_tone(self, text: str) -> str:
        lowered = text.lower()
        formal_markers = {"therefore", "however", "moreover", "thus", "regarding"}
        informal_markers = {"gonna", "wanna", "kinda", "lol", "hey", "cool", "awesome"}
        formal_count = sum(1 for token in formal_markers if token in lowered)
        informal_count = sum(1 for token in informal_markers if token in lowered)

        if formal_count > informal_count:
            return "formal"
        if informal_count > formal_count:
            return "informal"
        return "neutral"

    @torch.inference_mode()
    def _rewrite_tone(self, text: str, target_tone: str) -> str:
        if self.model is None or self.tokenizer is None:
            raise RuntimeError(f"Tone model not loaded: {self.load_error}")

        prompt = (
            f"Rewrite the following text in a {target_tone} tone. "
            "Keep the meaning same and return only rewritten text:\n\n"
            f"{text}"
        )

        inputs = self.tokenizer(prompt, return_tensors="pt", truncation=True).to(self.device)
        outputs = self.model.generate(
            **inputs,
            max_new_tokens=128,
            do_sample=False,
            num_beams=4,
            early_stopping=True,
        )
        return self.tokenizer.decode(outputs[0], skip_special_tokens=True).strip()

    def analyze(self, text: str, target_tone: str) -> ToneResult:
        """Detect current tone and transform text toward target tone."""
        target = target_tone.lower().strip()
        detected = self._detect_tone(text)
        if target not in {"formal", "informal", "neutral"}:
            target = "neutral"

        try:
            rewritten = self._rewrite_tone(text, target)
            return ToneResult(
                detected_tone=detected,
                modified_text=rewritten if rewritten else text,
                applied_replacements=[f"model_inference:{self.base_model_name_or_path}+LoRA"],
            )
        except Exception as exc:  # noqa: BLE001
            # Safe fallback so API does not crash on model load/inference issues.
            return ToneResult(
                detected_tone=detected,
                modified_text=text,
                applied_replacements=[f"model_error:{exc}"],
            )
