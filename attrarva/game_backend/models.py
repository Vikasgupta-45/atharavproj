from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AnalyzeRequest(BaseModel):
    text: str

class AnalysisResultItem(BaseModel):
    type: str # "consistency", "redundancy", "tone"
    original: str
    suggested: str
    reason: str

class AnalyzeResponse(BaseModel):
    results: List[AnalysisResultItem]
    xp_gained: int

class GameVerifyRequest(BaseModel):
    game_type: str # e.g., "Tone Switcher", "Memory Match"
    user_input: str
    context: Optional[dict] = None # e.g., {"target_tone": "formal"}
    hint_used: bool = False

class GamePromptRequest(BaseModel):
    game_type: str

class GamePromptResponse(BaseModel):
    prompt_data: Dict[str, Any]
    hint: Optional[str] = None

class GameVerifyResponse(BaseModel):
    success: bool
    reason: str
    xp_reward: int
    new_streak: int
    win_streak: int
    mastery_level: float = 0.0 # From 0.0 to 1.0 (replaces accuracy)
    current_hearts: int = 5
    correct_answer: Optional[str] = None

class UserStatsResponse(BaseModel):
    user_id: str
    xp: int
    level: int
    streak: int
    win_streak: int
    hearts: int = 5
    games_played: int
    games_won: int
    spider_chart_data: Dict[str, int] # e.g., {"Grammar": 80, "Vocabulary": 60}

class LeaderboardUser(BaseModel):
    user_id: str
    level: int
    xp: int

class LeaderboardResponse(BaseModel):
    top_users: List[LeaderboardUser]

class RedeemXPRequest(BaseModel):
    amount: int = 1000

class RedeemXPResponse(BaseModel):
    success: bool
    message: str
    new_xp: Optional[int] = None
    new_level: Optional[int] = None
