from groq import Groq
from dotenv import load_dotenv
import os, json, re, time

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))
MODEL = "llama-3.3-70b-versatile"  # free, fast, high quality

# ── Helpers ───────────────────────────────────────────────────────────────────

def call_groq(messages: list, retries: int = 3) -> str:
    """Call Groq with automatic retry on rate limit errors."""
    for attempt in range(retries):
        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=messages,
                max_tokens=1000,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            err = str(e)
            if "429" in err or "rate" in err.lower():
                wait = 10 * (attempt + 1)
                print(f"[Groq] Rate limit hit, waiting {wait}s (attempt {attempt+1}/{retries})")
                time.sleep(wait)
                continue
            raise ValueError(f"Groq error: {err}")
    raise ValueError("Groq rate limit exceeded after retries. Try again in a moment.")


# ── Resume Screening ──────────────────────────────────────────────────────────

def screen_resume(resume_text: str, job_description: str) -> dict:
    messages = [
        {
            "role": "system",
            "content": "You are an expert HR recruiter. Return ONLY valid JSON, no markdown, no code blocks, no extra text."
        },
        {
            "role": "user",
            "content": f"""Analyze this resume against the job description.

JOB DESCRIPTION:
{job_description}

RESUME:
{resume_text}

Return exactly this JSON:
{{
  "candidate_name": "<name from resume or Unknown>",
  "match_score": <integer 0-100>,
  "recommendation": "<Hire | Consider | Reject>",
  "experience_summary": "<1 sentence>",
  "skills_matched": ["skill1", "skill2"],
  "skills_missing": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "interview_questions": ["question1", "question2", "question3"]
}}"""
        }
    ]

    try:
        raw = call_groq(messages)
        raw = re.sub(r"^```json\s*", "", raw)
        raw = re.sub(r"^```\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        return json.loads(raw)
    except json.JSONDecodeError:
        raise ValueError("Groq returned invalid JSON. Try again.")
    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"Groq API error: {str(e)}")


# ── HR Chatbot ────────────────────────────────────────────────────────────────

HR_SYSTEM_PROMPT = """You are NeuraHR Assistant — a professional HR chatbot.

Company HR Policies:
- Working hours: 9 AM to 6 PM, Monday to Friday
- Annual leave: 18 days per year
- Sick leave: 10 days per year
- Casual leave: 6 days per year
- WFH policy: Up to 2 days per week with manager approval
- Probation period: 6 months
- Notice period: 2 months (employee), 1 month (company)
- Payroll: Last working day of each month
- Medical insurance: Employee + spouse + 2 children
- Performance review: April and October
- Referral bonus: 25000 INR after 6 months
- Dress code: Business casual Mon-Thu, casual Friday
- Grievance: hr@neurahr.com

Be concise, friendly and professional. Only answer HR-related questions."""


def chat_response(message: str, history: list) -> str:
    # Build messages array with system prompt + history + new message
    messages = [{"role": "system", "content": HR_SYSTEM_PROMPT}]

    # Add conversation history
    for msg in history:
        role = msg.get("role") if isinstance(msg, dict) else msg.role
        parts = msg.get("parts") if isinstance(msg, dict) else msg.parts
        # Groq uses "assistant" not "model"
        groq_role = "assistant" if role == "model" else role
        content = parts[0] if isinstance(parts, list) else parts
        messages.append({"role": groq_role, "content": content})

    # Add current message
    messages.append({"role": "user", "content": message})

    try:
        return call_groq(messages)
    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"Chatbot error: {str(e)}")