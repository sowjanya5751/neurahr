from sqlalchemy import Column, String, Integer, Text, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base
import uuid

def gen_id():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id            = Column(String, primary_key=True, default=gen_id)
    name          = Column(String, nullable=False)
    email         = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role          = Column(String, nullable=False, default="employee")
    # role options: admin | hr | manager | employee
    created_at    = Column(DateTime(timezone=True), server_default=func.now())


class ScreeningResult(Base):
    __tablename__ = "screening_results"

    id                  = Column(String, primary_key=True, default=gen_id)
    screened_by         = Column(String, ForeignKey("users.id"), nullable=False)
    candidate_name      = Column(String, nullable=True)
    job_description     = Column(Text, nullable=False)
    resume_text         = Column(Text, nullable=False)
    match_score         = Column(Integer, nullable=True)
    recommendation      = Column(String, nullable=True)   # Hire | Consider | Reject
    full_result_json    = Column(Text, nullable=True)     # full Gemini response as JSON string
    created_at          = Column(DateTime(timezone=True), server_default=func.now())