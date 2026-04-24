from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import engine
from models.models import Base

# Load env vars first
load_dotenv()

# Import routers
from api.auth import router as auth_router
from api.recruitment import router as recruitment_router
from api.chatbot import router as chatbot_router

# Create all DB tables
Base.metadata.create_all(bind=engine)

# Seed demo users on startup
from seed import seed_users

app = FastAPI(
    title="NeuraHR API",
    description="AI-Powered HRMS — Resume Screening + HR Chatbot",
    version="1.0.0"
)

# CORS — allow local dev + Vercel production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://*.vercel.app",   # your Vercel URL goes here after deploy
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router,        prefix="/auth",        tags=["Auth"])
app.include_router(recruitment_router, prefix="/recruitment", tags=["Resume Screening"])
app.include_router(chatbot_router,     prefix="/chatbot",     tags=["HR Chatbot"])

@app.on_event("startup")
def on_startup():
    seed_users()

@app.get("/", tags=["Health"])
def root():
    return {"status": "NeuraHR API is running", "docs": "/docs"}

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}