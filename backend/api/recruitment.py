from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models.models import User, ScreeningResult
from api.auth import get_current_user, require_role
from services.resume_parser import extract_text_from_pdf
from services.groq_service import screen_resume
import json

router = APIRouter()

# ── Schemas ───────────────────────────────────────────────────────────────────

class ScreeningResultOut(BaseModel):
    id:              str
    candidate_name:  str | None
    match_score:     int | None
    recommendation:  str | None
    full_result_json: str | None
    created_at:      str | None

    class Config:
        from_attributes = True

# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/screen")
async def screen_resume_endpoint(
    job_description: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(require_role("admin", "hr")),
    db: Session = Depends(get_db),
):
    """Upload a PDF resume + job description → get AI screening result."""

    # Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # Read and parse PDF
    file_bytes = await file.read()
    try:
        resume_text = extract_text_from_pdf(file_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Call Gemini
    try:
        result = screen_resume(resume_text, job_description)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))

    # Save to DB
    record = ScreeningResult(
        screened_by=current_user.id,
        candidate_name=result.get("candidate_name", "Unknown"),
        job_description=job_description,
        resume_text=resume_text[:5000],   # store first 5000 chars only
        match_score=result.get("match_score"),
        recommendation=result.get("recommendation"),
        full_result_json=json.dumps(result),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "id":      record.id,
        "result":  result,
        "message": "Resume screened successfully",
    }


@router.get("/results")
def get_all_results(
    current_user: User = Depends(require_role("admin", "hr")),
    db: Session = Depends(get_db),
):
    """Get all past screening results — HR and Admin only."""
    records = (
        db.query(ScreeningResult)
        .order_by(ScreeningResult.created_at.desc())
        .all()
    )
    return [
        {
            "id":             r.id,
            "candidate_name": r.candidate_name,
            "match_score":    r.match_score,
            "recommendation": r.recommendation,
            "created_at":     str(r.created_at),
        }
        for r in records
    ]


@router.get("/results/{result_id}")
def get_result_detail(
    result_id: str,
    current_user: User = Depends(require_role("admin", "hr")),
    db: Session = Depends(get_db),
):
    """Get full detail of a single screening result."""
    record = db.query(ScreeningResult).filter(ScreeningResult.id == result_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Result not found")

    return {
        "id":             record.id,
        "candidate_name": record.candidate_name,
        "match_score":    record.match_score,
        "recommendation": record.recommendation,
        "job_description":record.job_description,
        "result":         json.loads(record.full_result_json) if record.full_result_json else {},
        "created_at":     str(record.created_at),
    }


@router.delete("/results/{result_id}")
def delete_result(
    result_id: str,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Admin only — delete a screening result."""
    record = db.query(ScreeningResult).filter(ScreeningResult.id == result_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Result not found")
    db.delete(record)
    db.commit()
    return {"message": "Deleted successfully"}