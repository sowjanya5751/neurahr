from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import engine
from models.models import Base

load_dotenv()

from api.auth import router as auth_router
from api.recruitment import router as recruitment_router
from api.chatbot import router as chatbot_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NeuraHR API",
    description="AI-Powered HRMS — Resume Screening + HR Chatbot",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://*.vercel.app",   # your Vercel URL goes here after deploy
    ],   # Vercel URL added after deploy
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router,        prefix="/auth",        tags=["Auth"])
app.include_router(recruitment_router, prefix="/recruitment", tags=["Resume Screening"])
app.include_router(chatbot_router,     prefix="/chatbot",     tags=["HR Chatbot"])

@app.on_event("startup")
def on_startup():
    from seed import seed_users
    seed_users()

@app.get("/", tags=["Health"])
def root():
    return {"status": "NeuraHR API is running", "docs": "/docs"}

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}