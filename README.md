# ⚡ NeuraHR — AI-Powered HR Management System

<div align="center">

**Screen resumes in seconds. Answer HR queries instantly. Manage your team intelligently.**

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_App-7c3aed?style=for-the-badge)](https://neurahr-c0872eo3v-sowjanya5751s-projects.vercel.app)
[![API Docs](https://img.shields.io/badge/📖_API_Docs-Swagger_UI-059669?style=for-the-badge)](https://neurahr-api.onrender.com/docs)
[![Built With](https://img.shields.io/badge/AI-Groq_LLaMA_3-f59e0b?style=for-the-badge)](https://groq.com)

> 🏆 **Submission for FWC IT Services AI/ML Fullstack Hackathon 2026**
> Theme: *Build the Future of HR Management with AI-Powered Solutions*

</div>

---

## 🎬 Demo Video

> 📹 **[Watch 2-min Demo on Loom](https://www.loom.com/share/3b4e096bdada4ec99f9a606febeb4875)** — See AI resume screening + chatbot in action

---
## 📸 Screenshots

### Resume Screener
![Resume Screener](./screenshots/screener.png)

### Dashboard
![Dashboard](./screenshots/dashboard.png)

---

## 🌐 Live Links

| | URL |
|---|---|
| 🖥️ **Frontend** | https://neurahr-c0872eo3v-sowjanya5751s-projects.vercel.app |
| ⚙️ **Backend API** | https://neurahr-api.onrender.com |
| 📖 **Swagger Docs** | https://neurahr-api.onrender.com/docs |

---

## 🔑 Demo — Log In Instantly

No signup needed. Use any of these pre-seeded accounts:

| Role | Email | Password | What You Can Do |
|------|-------|----------|-----------------|
| 👑 **Admin** | admin@neurahr.com | Admin123 | Everything — dashboard, screening, employees, chatbot |
| 👥 **HR** | hr@neurahr.com | Hr123456 | Screen resumes, view results, use chatbot |
| 📊 **Manager** | manager@neurahr.com | Mgr12345 | HR chatbot access |
| 👤 **Employee** | employee@neurahr.com | Emp12345 | HR chatbot access |

---

## ✨ What It Does

### 🤖 AI Resume Screener — *The Star Feature*
Upload any PDF resume + paste a job description. Groq LLaMA-3 returns in seconds:
- **Match Score** — 0 to 100 with animated ring visualization
- **Recommendation** — Hire / Consider / Reject with color coding
- **Skills Matched & Missing** — visual chip tags
- **Strengths & Weaknesses** — detailed breakdown
- **3 Interview Questions** — auto-generated and role-specific
- **Download Report** — one-click PDF export for HR records

### 💬 HR Policy Chatbot
Ask anything in plain English. Instant answers about:
leave policy · WFH rules · payroll dates · medical insurance · notice period · referral bonus · performance reviews

### 📊 Admin Dashboard
- Animated stat cards with live counts
- Donut chart — Hire / Consider / Reject breakdown
- Real numbers pulled from actual screening history

### 👥 Employee Management
- Searchable employee table with role badges
- Add new employees with role assignment
- Avatar initials auto-generated per employee

### 🔐 Role-Based Access Control
4 roles with different permissions. Route guards on both frontend and backend. JWT tokens with 24hr expiry.

---

## 🛠 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 18 + Vite | Fast, modern, component-based |
| **Backend** | FastAPI + Python | Async, auto-docs, production-ready |
| **Database** | SQLite → PostgreSQL | Zero config dev, scalable prod |
| **AI** | Groq API — LLaMA 3.3 70B | Free tier, high RPM, low latency |
| **Auth** | JWT + bcrypt | Stateless, secure, role-aware |
| **PDF** | pdfplumber | Reliable text extraction from any PDF |
| **Deploy** | Vercel + Render | Free, fast, CI/CD on git push |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER BROWSER                         │
│              React 18 + Vite (Vercel CDN)               │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS + JWT
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  FASTAPI BACKEND                        │
│                  (Render.com)                           │
│                                                         │
│  /auth          /recruitment        /chatbot            │
│  Register       PDF Upload          Message             │
│  Login          AI Screening        Suggestions         │
│  JWT Guard      Results CRUD                            │
└────────┬──────────────┬──────────────────┬─────────────┘
         │              │                  │
         ▼              ▼                  ▼
  ┌──────────┐   ┌──────────────┐   ┌──────────────┐
  │  SQLite  │   │  Groq API    │   │  pdfplumber  │
  │ /Postgres│   │  LLaMA-3 70B │   │  PDF Parser  │
  └──────────┘   └──────────────┘   └──────────────┘
```

---

## ⚡ Run Locally in 5 Minutes

### 1. Clone
```bash
git clone https://github.com/sowjanya5751/neurahr.git
cd neurahr
```

### 2. Backend
```bash
cd backend
pip install -r requirements.txt
```
Create `backend/.env`:
```
GROQ_API_KEY=your_groq_key_from_console.groq.com
JWT_SECRET=any_long_random_string_here
DATABASE_URL=sqlite:///./neurahr.db
```
```bash
uvicorn main:app --reload
# → http://localhost:8000/docs
```

### 3. Frontend
```bash
cd frontend
npm install
```
Create `frontend/.env`:
```
VITE_API_URL=http://localhost:8000
```
```bash
npm run dev
# → http://localhost:5173
```

---

## 📡 API Reference

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | Public | Create account |
| `POST` | `/auth/login` | Public | Login → JWT |
| `GET` | `/auth/me` | Any | Current user |
| `GET` | `/auth/users` | Admin | All users |
| `POST` | `/recruitment/screen` | HR/Admin | AI resume screen |
| `GET` | `/recruitment/results` | HR/Admin | All results |
| `DELETE` | `/recruitment/results/{id}` | Admin | Delete result |
| `POST` | `/chatbot/message` | Any | Chat message |
| `GET` | `/chatbot/suggestions` | Any | Suggested Qs |

---

## 📁 Project Structure

```
neurahr/
├── backend/
│   ├── api/
│   │   ├── auth.py            # JWT auth, 4 roles
│   │   ├── recruitment.py     # ⭐ AI resume screening
│   │   └── chatbot.py         # ⭐ HR chatbot
│   ├── models/models.py       # SQLAlchemy ORM
│   ├── services/
│   │   ├── groq_service.py          # Groq LLaMA integration
│   │   └── resume_parser.py   # PDF → text
│   ├── database.py
│   ├── seed.py                # Demo accounts
│   ├── main.py
│   └── requirements.txt
└── frontend/src/
    ├── pages/
    │   ├── auth/Login.jsx
    │   ├── dashboard/Dashboard.jsx
    │   ├── hr/ResumeScreener.jsx  # ⭐
    │   ├── hr/Chatbot.jsx         # ⭐
    │   ├── hr/Employees.jsx
    │   └── NotFound.jsx
    ├── components/
    │   ├── Navbar.jsx
    │   └── ProtectedRoute.jsx
    ├── context/
    │   ├── AuthContext.jsx
    │   └── ToastContext.jsx
    └── services/api.js
```

---

## 🎯 Key Design Decisions

| Decision | Reason |
|----------|--------|
| Groq over OpenAI/Groq | Free tier, no quota issues, faster response |
| SQLite for dev | Zero config, judges can run locally in seconds |
| Hardcoded HR policies in chatbot | Makes responses feel real, not generic |
| 4 demo accounts pre-seeded | Judges can instantly explore every role |
| Role guards on frontend + backend | Production-grade security, not just UI-level |

---

<div align="center">

**Built by R. Sowjanya** · BTech AI & ML, MS Ramaiah University · CGPA 8.6

*"A beautiful, reliable 2-feature app beats a broken 6-feature app every time."*

</div>