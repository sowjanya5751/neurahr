from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Any
from api.auth import get_current_user, require_role
from models.models import User
from services.groq_service import call_groq
import json, re

router = APIRouter()

class JDRequest(BaseModel):
    job_title:  str
    experience: str = "2-4 years"
    skills:     str = ""

class PerformanceRequest(BaseModel):
    employee_name: str
    role:          str = ""
    period:        str = "Q1 2026"
    notes:         str

class SmartSearchRequest(BaseModel):
    query:      str
    employees:  List[Any] = []
    screenings: List[Any] = []

@router.post("/generate-jd")
def generate_jd(payload: JDRequest, current_user: User = Depends(require_role("admin", "hr"))):
    messages = [
        {"role":"system","content":"You are an expert HR professional. Write clear, professional job descriptions."},
        {"role":"user","content":f"""Write a complete professional job description for:
Job Title: {payload.job_title}
Experience: {payload.experience}
Key Skills: {payload.skills}
Include: About the Role, Key Responsibilities (6-8), Required Qualifications (5-6), Nice to Have (3-4), What We Offer (4-5).
Make it professional and attractive."""}
    ]
    try:
        result = call_groq(messages)
        return {"job_description": result, "job_title": payload.job_title}
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))

@router.post("/performance-review")
def generate_performance_review(payload: PerformanceRequest, current_user: User = Depends(require_role("admin","hr","manager"))):
    messages = [
        {"role":"system","content":"You are an expert HR analyst. Return ONLY valid JSON, no markdown, no code blocks."},
        {"role":"user","content":f"""Generate a structured performance review.
Employee: {payload.employee_name}
Role: {payload.role or "Not specified"}
Period: {payload.period}
Notes: {payload.notes}
Return exactly: {{"overall_rating":"<Outstanding|Exceeds Expectations|Meets Expectations|Needs Improvement>","score":<1-10>,"summary":"<2-3 sentences>","strengths":["s1","s2","s3"],"improvements":["i1","i2","i3"],"goals":["g1","g2","g3"],"recommendation":"<one sentence>"}}"""}
    ]
    try:
        raw = call_groq(messages)
        raw = re.sub(r"^```json\s*","",raw); raw = re.sub(r"^```\s*","",raw); raw = re.sub(r"\s*```$","",raw)
        review = json.loads(raw)
        return {"review": review, "employee_name": payload.employee_name}
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="AI returned invalid response. Try again.")
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))

@router.post("/smart-search")
def smart_search(payload: SmartSearchRequest, current_user: User = Depends(get_current_user)):
    emp_data = json.dumps(payload.employees[:50], default=str)
    scr_data = json.dumps(payload.screenings[:50], default=str)
    messages = [
        {"role":"system","content":"You are a smart HR data search assistant. Return ONLY valid JSON, no markdown."},
        {"role":"user","content":f"""Search query: "{payload.query}"
Employees: {emp_data}
Screenings: {scr_data}
Return: {{"answer":"<one sentence answer>","results":{{"employees":[<matching employees>],"screenings":[<matching screenings>]}}}}
Match semantically - 'HR staff' matches role=hr, 'high scores' matches score>70, 'hire recommendations' matches recommendation=Hire."""}
    ]
    try:
        raw = call_groq(messages)
        raw = re.sub(r"^```json\s*","",raw); raw = re.sub(r"^```\s*","",raw); raw = re.sub(r"\s*```$","",raw)
        return json.loads(raw)
    except Exception:
        q = payload.query.lower()
        filtered_emp = [e for e in payload.employees if q in str(e.get("name","")).lower() or q in str(e.get("role","")).lower()]
        filtered_scr = [s for s in payload.screenings if q in str(s.get("candidate_name","")).lower() or q in str(s.get("recommendation","")).lower()]
        return {"answer":f"Found {len(filtered_emp)} employees and {len(filtered_scr)} screenings.","results":{"employees":filtered_emp,"screenings":filtered_scr}}
