from pydantic import BaseModel

class LiveCheckRequest(BaseModel):
    text: str
    topic: str | None = None

class LiveCheckResponse(BaseModel):
    is_on_topic: bool
    relevance_score: float
    suggestion: str | None = None
