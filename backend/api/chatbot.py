from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from api.auth import get_current_user
from models.models import User
from services.groq_service import chat_response

router = APIRouter()

# ── Schemas ───────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role:  str    # "user" or "model"
    parts: list[str]

class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []

class ChatResponse(BaseModel):
    reply:   str
    message: str = "ok"

# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/message", response_model=ChatResponse)
def send_message(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    """Send a message to the HR chatbot — all roles allowed."""
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Convert history to Gemini format
    history = [
        {"role": msg.role, "parts": msg.parts}
        for msg in payload.history
    ]

    try:
        reply = chat_response(payload.message, history)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))

    return ChatResponse(reply=reply)


@router.get("/suggestions")
def get_suggestions(current_user: User = Depends(get_current_user)):
    """Return suggested questions shown on chatbot load."""
    return {
        "suggestions": [
            "What is the leave policy?",
            "How many sick leaves do I get per year?",
            "What is the WFH policy?",
            "When is salary processed?",
            "How do I apply for medical insurance?",
            "What is the notice period?",
            "How does the referral bonus work?",
            "When are performance reviews conducted?",
        ]
    }