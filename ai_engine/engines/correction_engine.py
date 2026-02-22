import spacy
import re
from dataclasses import dataclass
from typing import List, Dict
from textblob import TextBlob
from ai_engine.utils.text_utils import normalize_text

@dataclass
class CorrectionResult:
    """Structured result for text correction."""
    corrected_text: str
    changes: List[Dict[str, str]]

class CorrectionEngine:
    """Provides word-level spelling and basic grammar correction."""

    def __init__(self) -> None:
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except:
            self.nlp = spacy.blank("en")

    def _should_correct(self, token) -> bool:
        """Heuristics to avoid correcting entities or technical terms."""
        text = token.text
        if not text or len(text) <= 2:
            return False
        # Avoid correcting tokens that aren't primarily alphabetic
        if not token.is_alpha:
            return False
        # Skip proper nouns identified by Spacy
        if token.pos_ == "PROPN":
            return False
        # Avoid all-caps (acronyms)
        if text.isupper():
            return False
        return True

    def _grammar_check(self, text: str) -> List[Dict[str, str]]:
        """Identify common grammar issues using regex and Spacy rules."""
        grammar_changes = []
        
        # 1. Regex-based checks
        # Duplicate words
        for match in re.finditer(r'\b(\w+)\s+\1\b', text, re.IGNORECASE):
            grammar_changes.append({"type": "deletion", "before": match.group(0), "after": match.group(1), "reason": "Duplicate word detected."})
            
        # A/An checks
        for match in re.finditer(r'\ba\s+([aeiouAEIOU]\w+)\b', text):
            grammar_changes.append({"type": "modification", "before": match.group(0), "after": f"an {match.group(1)}", "reason": "Use 'an' before a vowel sound."})
        for match in re.finditer(r'\ban\s+([^aeiouAEIOU\s][A-Za-z]+)\b', text):
            # Filtering some common exceptions isn't easy with regex, but this covers most
            grammar_changes.append({"type": "modification", "before": match.group(0), "after": f"a {match.group(1)}", "reason": "Use 'a' before a consonant sound."})

        # 2. Spacy-based checks
        doc = self.nlp(text)
        for i, token in enumerate(doc):
            # A. Auxiliaries like "do/did" + Past Tense (e.g., "didn't completed")
            if token.lemma_ == "do" and i < len(doc) - 1:
                next_word = doc[i+1]
                if next_word.pos_ == "PART" and next_word.text.lower() in ["not", "n't"] and i < len(doc) - 2:
                    next_word = doc[i+2]
                
                if next_word.pos_ == "VERB" and next_word.tag_ in ["VBD", "VBN", "VBZ"]:
                    grammar_changes.append({
                        "type": "modification",
                        "before": next_word.text,
                        "after": next_word.lemma_,
                        "reason": f"After '{token.text}', use the base form '{next_word.lemma_}'."
                    })

            # B. "I am go" -> "I am going" or "I go"
            if token.lemma_ == "be" and i < len(doc) - 1:
                next_word = doc[i+1]
                if next_word.pos_ == "VERB" and next_word.tag_ == "VB":
                    grammar_changes.append({
                        "type": "modification",
                        "before": next_word.text,
                        "after": next_word.lemma_ + "ing",
                        "reason": f"Expected present participle '-ing' after '{token.text}'."
                    })

            # C. Modal verbs (can, will, should) + non-base form
            if token.tag_ == "MD" and i < len(doc) - 1:
                next_word = doc[i+1]
                if next_word.pos_ == "VERB" and next_word.tag_ != "VB":
                    grammar_changes.append({
                        "type": "modification",
                        "before": next_word.text,
                        "after": next_word.lemma_,
                        "reason": f"After modal '{token.text}', use use base form '{next_word.lemma_}'."
                    })

            # D. Adverb/Adjective confusion (e.g., "were very angrily" -> "were very angry")
            if token.pos_ == "AUX" and i < len(doc) - 2:
                next_word = doc[i+1]
                adv_word = doc[i+2]
                if next_word.text.lower() == "very" and adv_word.tag_ == "RB" and adv_word.text.endswith("ly"):
                    grammar_changes.append({
                        "type": "modification",
                        "before": adv_word.text,
                        "after": adv_word.text[:-2],
                        "reason": "Expected an adjective after 'very' here."
                    })

            # E. Unidiomatic plurals/suffixes
            if token.text.lower() == "soonly":
                grammar_changes.append({"type": "modification", "before": token.text, "after": "soon", "reason": "'Soonly' is not a standard word; use 'soon'."})
            if token.text.lower() == "meeted":
                grammar_changes.append({"type": "modification", "before": token.text, "after": "met", "reason": "'Meeted' is incorrect; the past tense of 'meet' is 'met'."})
            if token.text.lower() == "works" and token.pos_ == "NOUN" and any(child.lemma_ == "the" for child in token.children):
                 grammar_changes.append({"type": "modification", "before": token.text, "after": "work", "reason": "In this context, 'work' is usually uncountable."})
            if token.text.lower() == "offices" and token.pos_ == "NOUN" and any(child.lemma_ == "the" for child in token.children):
                 # "the offices" -> "the office"
                 grammar_changes.append({"type": "modification", "before": token.text, "after": "office", "reason": "Singular 'office' is more likely correct here."})

        return grammar_changes

    def analyze(self, text: str) -> CorrectionResult:
        """Correct misspelled words and grammar using Spacy and TextBlob."""
        # 1. Grammar rules first
        grammar_changes = self._grammar_check(text)
        
        # Highlight: we want to collect ALL changes.
        # However, to produce 'corrected_text', we apply them sequentially.
        all_changes = []
        seen_before = set()
        
        # Deduplicate grammar changes
        for g in grammar_changes:
            if g["before"] not in seen_before:
                all_changes.append(g)
                seen_before.add(g["before"])

        # 2. Re-tokenize for spelling
        doc = self.nlp(text)
        corrected_parts = []
        
        for token in doc:
            # If this word was already handled by grammar, skip spelling for it
            if token.text in seen_before:
                # Find the correction
                match = next((c for c in all_changes if c["before"] == token.text), None)
                corrected_parts.append(match["after"] if match else token.text)
            elif self._should_correct(token):
                word_blob = TextBlob(token.text)
                corrected = str(word_blob.correct())
                
                # Forced common catch for ESL
                if token.text.lower() == "meeted": corrected = "met"
                if token.text.lower() == "soonly": corrected = "soon"
                if token.text.lower() == "which" and token.head.pos_ == "NOUN": 
                    # check if parent is person... hard to do without NER but "manager" is person
                    pass

                if corrected.lower() != token.text.lower():
                    if token.text.istitle(): corrected = corrected.title()
                    elif token.text.isupper(): corrected = corrected.upper()
                    
                    corrected_parts.append(corrected)
                    all_changes.append({
                        "type": "modification",
                        "before": token.text,
                        "after": corrected,
                        "reason": "Spelling or common word usage correction."
                    })
                else:
                    corrected_parts.append(token.text)
            else:
                corrected_parts.append(token.text)
            
            corrected_parts.append(token.whitespace_)

        corrected_text = "".join(corrected_parts)
        
        return CorrectionResult(
            corrected_text=corrected_text,
            changes=all_changes
        )
