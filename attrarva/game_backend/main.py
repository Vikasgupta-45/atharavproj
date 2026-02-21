from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from models import (
    AnalyzeRequest, 
    AnalyzeResponse,
    AnalysisResultItem,
    GameVerifyRequest,
    GameVerifyResponse,
    UserStatsResponse,
    LeaderboardResponse,
    LeaderboardUser,
    GamePromptRequest,
    GamePromptResponse,
    RedeemXPRequest,
    RedeemXPResponse
)
from services.style import StyleRefinementService
from services.gamification import GamificationEngine
from services.ai_engine import GroqService

app = FastAPI(title="WriteLingo Backend", description="Gamified Writing Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
style_service = StyleRefinementService()
gamification_engine = GamificationEngine()
groq_service = GroqService()

# Default user if header is missing
DEFAULT_USER = "guest_user"

@app.post("/game/prompt", response_model=GamePromptResponse)
async def get_prompt(request: GamePromptRequest, x_user_id: str = Header(DEFAULT_USER)):
    """Generates a dynamic AI prompt using Groq."""
    ai_data = groq_service.generate_prompt(request.game_type)
    # Extract hint if present in the ai_data dictionary or use the one generated outside
    hint = ai_data.get("hint")
    return GamePromptResponse(prompt_data=ai_data, hint=hint)

@app.post("/game/verify", response_model=GameVerifyResponse)
async def verify_game(request: GameVerifyRequest, x_user_id: str = Header(DEFAULT_USER)):
    print(f"INCOMING PAYLOAD for {x_user_id}:", request.model_dump())
    try:
        # Use Groq for intelligent verification
        ai_result = groq_service.verify_answer(
            request.game_type, 
            request.user_input, 
            request.context or {}
        )
        
        success = ai_result.get("success", False)
        reason = ai_result.get("reason", "AI could not determine correctness.")
        mastery_level = ai_result.get("mastery_level", 0.0)
        correct_answer = ai_result.get("correct_answer")
    
        if success:
            xp_reward = gamification_engine.calculate_xp(x_user_id, request.game_type, mastery_level, request.hint_used)
            gamification_engine.add_xp(x_user_id, xp_reward)
            streak = gamification_engine.update_streak(x_user_id)
            current_hearts = gamification_engine.users[x_user_id]["hearts"]
        else:
            # Deduct a heart on failure
            current_hearts = gamification_engine.deduct_heart(x_user_id)
            
            # Still update XP (penalty is handled in calculate_xp)
            xp_reward = gamification_engine.calculate_xp(x_user_id, request.game_type, mastery_level, request.hint_used)
            gamification_engine.add_xp(x_user_id, xp_reward)
            streak = gamification_engine.get_user_stats(x_user_id)["streak"]
            
        win_streak = gamification_engine.update_win_streak(x_user_id, success)
    
        return GameVerifyResponse(
            success=success,
            reason=reason,
            xp_reward=xp_reward,
            new_streak=streak,
            win_streak=win_streak,
            mastery_level=mastery_level,
            current_hearts=current_hearts,
            correct_answer=correct_answer
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/user/refill-hearts")
async def refill_hearts(x_user_id: str = Header(DEFAULT_USER)):
    hearts = gamification_engine.refill_hearts(x_user_id)
    return {"hearts": hearts}

@app.post("/user/redeem-xp", response_model=RedeemXPResponse)
async def redeem_xp(request: RedeemXPRequest, x_user_id: str = Header(DEFAULT_USER)):
    """Redeems user XP for credits (simulated on frontend)."""
    result = gamification_engine.redeem_xp(x_user_id, request.amount)
    if not result["success"]:
        return RedeemXPResponse(success=False, message=result["message"])
    
    return RedeemXPResponse(
        success=True, 
        message=f"Successfully redeemed {request.amount} XP.",
        new_xp=result["new_xp"],
        new_level=result["new_level"]
    )

@app.get("/user/stats", response_model=UserStatsResponse)
async def get_user_stats(x_user_id: str = Header(DEFAULT_USER)):
    stats = gamification_engine.get_user_stats(x_user_id)
    return UserStatsResponse(
        user_id=x_user_id,        xp=stats.get("xp", 0),
        level=stats.get("level", 1),
        streak=stats.get("streak", 1),
        win_streak=stats.get("win_streak", 0),
        hearts=stats.get("hearts", 5),
        games_played=stats.get("games_played", 0),
        games_won=stats.get("games_won", 0),
        spider_chart_data=stats.get("spider_chart_data", {})
    )

@app.get("/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard():
    board = gamification_engine.get_leaderboard()
    return LeaderboardResponse(top_users=[LeaderboardUser(**user) for user in board])
