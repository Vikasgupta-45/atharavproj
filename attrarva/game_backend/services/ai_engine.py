import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

class GroqService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            print("WARNING: GROQ_API_KEY not found in environment")
            
    def _call_groq_json(self, system_msg, user_msg):
        if not self.api_key:
            return {}
        try:
            resp = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": system_msg},
                        {"role": "user", "content": user_msg}
                    ],
                    "response_format": {"type": "json_object"}
                }
            )
            data = resp.json()
            if "choices" in data and data["choices"]:
                content = data["choices"][0]["message"]["content"]
                return json.loads(content)
        except Exception as e:
            print(f"Groq error: {e}")
        return {}

    def generate_prompt(self, game_type: str) -> dict:
        system = (
            "You are a gamified writing assistant. Given a sub-game name, generate a creative "
            "exercise for the user to solve. Return JSON with 'text' (the exercise description/problem), "
            "and optionally 'hint' (a clue). "
            "For example, if game_type is 'Tone Switcher', describe a text they need to rewrite."
        )
        result = self._call_groq_json(system, f"Generate an exercise for game type: {game_type}")
        return result

    def verify_answer(self, game_type: str, user_input: str, context: dict) -> dict:
        system = (
            "You are an AI judge for a language game. Analyze the user's answer for the game_type "
            "and given context. "
            "Verify if it solves the problem correctly. Return a JSON object with: "
            "'success' (boolean), "
            "'reason' (string explaining why), "
            "'mastery_level' (float 0.0 to 1.0 reflecting quality), "
            "'correct_answer' (string with an ideal answer)."
        )
        msg = f"Game Type: {game_type}\nContext: {json.dumps(context)}\nUser Input: {user_input}"
        result = self._call_groq_json(system, msg)
        return result
