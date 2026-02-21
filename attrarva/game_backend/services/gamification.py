from datetime import datetime
from typing import Dict, Any

class GamificationEngine:
    def __init__(self):
        # In-memory store: user_id -> dict
        self.users: Dict[str, Dict[str, Any]] = {
            "default_user": {
                "xp": 2000,
                "level": 1,
                "streak": 1, # daily streak
                "win_streak": 0, # consecutive correct answers streak
                "hearts": 5, # life system
                "games_played": 0,
                "games_won": 0,
                "last_active": datetime.now(),
                "spider_chart_data": {
                    "Grammar": 10,
                    "Vocabulary": 10,
                    "Tone & Style": 10,
                    "Concision": 10,
                    "Comprehension": 10
                }
            }
        }
        
    def _ensure_user(self, user_id: str):
        if user_id not in self.users:
            self.users[user_id] = {
                "xp": 0,
                "level": 1,
                "streak": 1, # daily streak
                "win_streak": 0, # consecutive correct answers streak
                "hearts": 5, # life system
                "games_played": 0,
                "games_won": 0,
                "last_active": datetime.now(),
                "spider_chart_data": {
                    "Grammar": 10,
                    "Vocabulary": 10,
                    "Tone & Style": 10,
                    "Concision": 10,
                    "Comprehension": 10
                }
            }

    def update_streak(self, user_id: str) -> int:
        self._ensure_user(user_id)
        user = self.users[user_id]
        
        now = datetime.now()
        last_active = user["last_active"]
        
        diff = now.date() - last_active.date()
        
        if diff.days == 1:
            user["streak"] += 1
        elif diff.days > 1:
            user["streak"] = 1
            
        user["last_active"] = now
        return user["streak"]
        
    def update_win_streak(self, user_id: str, won: bool) -> int:
        self._ensure_user(user_id)
        if won:
            self.users[user_id]["win_streak"] += 1
        else:
            self.users[user_id]["win_streak"] = 0
            
        return self.users[user_id]["win_streak"]

    def calculate_xp(self, user_id: str, game_type: str, accuracy: float, hint_used: bool = False) -> int:
        self._ensure_user(user_id)
        user = self.users[user_id]
        
        base_xp = {
            "Tone Switcher": 60,
            "Word Choice Duel": 40,
            "Redundancy Eraser": 30,
            "Sentence Builder": 50,
            "Sentence Reconstructor": 100,
            "Plot Hole Hunter": 80,
            "Dialogue Detective": 70,
            "Context Climber": 90,
            "Word Master": 50,
            "Story Spinner": 120,
            "Logic MCQ": 40,
            "Visual Vocab": 40
        }.get(game_type, 30)

        # Update Play Stats
        user["games_played"] += 1
        if accuracy >= 0.8:
            user["games_won"] += 1

        # Track Skill Proficiencies dynamically
        skill_map = {
            "Tone Switcher": "Tone & Style",
            "Word Choice Duel": "Vocabulary",
            "Redundancy Eraser": "Concision",
            "Sentence Builder": "Grammar",
            "Sentence Reconstructor": "Tone & Style",
            "Plot Hole Hunter": "Comprehension",
            "Dialogue Detective": "Comprehension",
            "Context Climber": "Tone & Style",
            "Word Master": "Grammar",
            "Story Spinner": "Tone & Style",
            "Logic MCQ": "Grammar",
            "Visual Vocab": "Vocabulary"
        }
        
        assigned_skill = skill_map.get(game_type, "Grammar")
        
        # Win Streak Multipliers: Cap at 2.0x
        multiplier = min(1.0 + (user["win_streak"] * 0.1), 2.0)
        
        
        # Calculate XP 
        if accuracy >= 0.8: # Won
            awarded_xp = int((base_xp * accuracy) * multiplier)
            # Apply hint penalty: 50% reduction
            if hint_used:
                awarded_xp = int(awarded_xp * 0.5)
            
            # Increase Skill Proficiency up to a cap of 100
            user["spider_chart_data"][assigned_skill] = min(user["spider_chart_data"].get(assigned_skill, 10) + 5, 100)
        else: # Lost -> Penalty
            awarded_xp = -int(base_xp * 0.5) # Lose 50% of base XP on failure
            # Slightly decrease proficiency on failure
            user["spider_chart_data"][assigned_skill] = max(user["spider_chart_data"].get(assigned_skill, 10) - 2, 0)
            
        return awarded_xp

    def add_xp(self, user_id: str, xp: int) -> int:
        self._ensure_user(user_id)
        user = self.users[user_id]
        
        # Allow XP to drop but not below 0
        user["xp"] = max(user["xp"] + xp, 0)
        
        # Level calculation: (Total_XP // 500) + 1
        user["level"] = (user["xp"] // 500) + 1
        
        return user["xp"]

    def deduct_heart(self, user_id: str) -> int:
        self._ensure_user(user_id)
        user = self.users[user_id]
        user["hearts"] = max(user["hearts"] - 1, 0)
        return user["hearts"]

    def redeem_xp(self, user_id: str, amount: int) -> Dict[str, Any]:
        """Redeems a specific amount of XP if the user has enough."""
        self._ensure_user(user_id)
        user = self.users[user_id]
        
        if user["xp"] >= amount:
            user["xp"] -= amount
            # Recalculate level after deduction
            user["level"] = (user["xp"] // 500) + 1
            return {"success": True, "new_xp": user["xp"], "new_level": user["level"]}
        
        return {"success": False, "message": "Insufficient XP balance."}

    def refill_hearts(self, user_id: str) -> int:
        self._ensure_user(user_id)
        self.users[user_id]["hearts"] = 5
        return 5

    def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        self._ensure_user(user_id)
        # Update streak on checking stats
        self.update_streak(user_id)
        return self.users[user_id]

    def get_leaderboard(self) -> list:
        board = []
        for uid, data in self.users.items():
            board.append({"user_id": uid, "level": data["level"], "xp": data["xp"]})
            
        # Add hyper-competitive mock data
        mock_data = [
            {"user_id": "Arjun_Pro", "level": 12, "xp": 6200},
            {"user_id": "Neha_Writer", "level": 10, "xp": 5100},
            {"user_id": "Rahul_Grammar", "level": 9, "xp": 4800},
            {"user_id": "Priya_Lit", "level": 8, "xp": 4200},
            {"user_id": "Vikram_Bot", "level": 7, "xp": 3600},
            {"user_id": "Sarthak_AI", "level": 15, "xp": 7500},
            {"user_id": "Aisha_Pen", "level": 6, "xp": 3100},
            {"user_id": "Kabir_Lyrics", "level": 5, "xp": 2600},
            {"user_id": "Rohan_Scribe", "level": 4, "xp": 2100},
            {"user_id": "Zoya_Auth", "level": 3, "xp": 1600}
        ]
        
        for mock_user in mock_data:
            if mock_user["user_id"] not in self.users:
                board.append(mock_user)
                
        board.sort(key=lambda x: x["xp"], reverse=True)
        return board[:15]
