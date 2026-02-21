import spacy
from typing import Dict, List, Any

class NarrativeConsistencyService:
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            # Fallback if model not downloaded gracefully handle later
            import os
            os.system("python -m spacy download en_core_web_sm")
            self.nlp = spacy.load("en_core_web_sm")
            
        # In-memory store: user_id -> entity_name -> location (GPE) or ORG
        self.world_state: Dict[str, Dict[str, str]] = {}

    def track_and_analyze(self, user_id: str, text: str) -> List[Dict[str, str]]:
        if user_id not in self.world_state:
            self.world_state[user_id] = {}

        doc = self.nlp(text)
        current_locations = {}
        issues = []

        # Find PERSON and GPE in the current sentence/text
        persons = [ent.text for ent in doc.ents if ent.label_ == "PERSON"]
        locations = [ent.text for ent in doc.ents if ent.label_ == "GPE"]
        
        # Simple heuristic: bind the first mentioned GPE to all PERSONs in this text chunk
        # In a real app, dependency parsing would be used.
        detected_loc = locations[0] if locations else None

        for person in persons:
            if detected_loc:
                # Check consistency
                previous_loc = self.world_state[user_id].get(person)
                
                # If they were somewhere else and no transition word is found (simplified logic)
                if previous_loc and previous_loc != detected_loc:
                    if "travel" not in text.lower() and "went" not in text.lower() and "moved" not in text.lower():
                        issues.append({
                            "type": "consistency",
                            "original": f"{person} in {detected_loc}",
                            "suggested": f"Explain how {person} moved from {previous_loc} to {detected_loc}.",
                            "reason": f"Plot contradiction found: {person} was previously in {previous_loc} but is now in {detected_loc} without a transition."
                        })
                
                # Update world state
                self.world_state[user_id][person] = detected_loc

        # Return found issues
        return issues
