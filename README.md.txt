# NeuraHR — AI-Powered HRMS

> Next-generation Human Resource Management System powered by Google Gemini AI

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black)](https://neurahr.vercel.app)
[![API Docs](https://img.shields.io/badge/API%20Docs-Swagger-green)](https://neurahr-backend.onrender.com/docs)

---

## 🚀 Live Links

| Service | URL |
|---|---|
| Frontend | https://neurahr.vercel.app |
| Backend API | https://neurahr-backend.onrender.com |
| API Docs | https://neurahr-backend.onrender.com/docs |

---

## 🎯 Features

### ⭐ AI Resume Screener
- Upload any PDF resume
- Paste a job description
- Gemini AI returns:
  - Match score (0–100)
  - Recommendation: Hire / Consider / Reject
  - Skills matched & missing
  - Strengths & weaknesses
  - 3 interview questions

### 💬 HR Chatbot
- Powered by Google Gemini
- Answers HR policy questions instantly
- Knows: leave policy, WFH rules, payroll dates, insurance, and more
- Context-aware conversation history

### 🔐 JWT Authentication
- 4 roles: Admin, HR Recruiter, Manager, Employee
- Role-based route protection
- Secure JWT tokens (24hr expiry)

### 📊 Role-Based Dashboards
- Each role sees a tailored dashboard
- HR sees screening stats and quick actions
- Employees see chatbot access and info

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TailwindCSS, Vite, React Router |
| Backend | FastAPI, Python 3.10, SQLAlchemy |
| Database | SQLite (dev) / PostgreSQL (prod) |
| AI | Google Gemini 2.5 Flash |
| Auth | JWT (python-jose), bcrypt |
| Deploy | Vercel (frontend) + Render (backend) |

---

## 🏗 Architecture

```
Browser (React + Vite)
    │
    ▼ REST API (JWT)
FastAPI Backend
    ├── /auth          → Register, Login, JWT
    ├── /recruitment   → PDF Upload → Gemini → Score
    └── /chatbot       → Message → Gemini → Reply
    │
    ├── SQLite / PostgreSQL DB
    └── Google Gemini API
```

---

## 👤 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@neurahr.com | Admin123 |
| HR Recruiter | hr@neurahr.com | Hr123456 |
| Manager | manager@neurahr.com | Mgr12345 |
| Employee | employee@neurahr.com | Emp12345 |

---

## ⚙️ Local Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your GEMINI_API_KEY to .env
uvicorn main:app --reload
# API runs at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

---

## 📁 Project Structure

```
neurahr/
├── backend/
│   ├── api/
│   │   ├── auth.py            # JWT login/register
│   │   ├── recruitment.py     # ⭐ Resume screener
│   │   └── chatbot.py         # ⭐ HR chatbot
│   ├── models/
│   │   └── models.py          # DB tables
│   ├── services/
│   │   ├── gemini.py          # Gemini API calls
│   │   └── resume_parser.py   # PDF text extraction
│   ├── database.py
│   ├── main.py
│   ├── seed.py
│   └── requirements.txt
└── frontend/
    └── src/
        ├── pages/
        │   ├── auth/Login.jsx
        │   ├── dashboard/Dashboard.jsx
        │   └── hr/
        │       ├── ResumeScreener.jsx  # ⭐
        │       └── Chatbot.jsx         # ⭐
        ├── components/
        │   ├── Navbar.jsx
        │   └── ProtectedRoute.jsx
        ├── context/AuthContext.jsx
        └── services/api.js
```

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /auth/register | No | Register new user |
| POST | /auth/login | No | Login → JWT token |
| GET | /auth/me | Yes | Get current user |
| GET | /auth/users | Admin | List all users |
| POST | /recruitment/screen | HR/Admin | Screen resume with AI |
| GET | /recruitment/results | HR/Admin | List all screenings |
| GET | /recruitment/results/{id} | HR/Admin | Get screening detail |
| POST | /chatbot/message | All | Send chat message |
| GET | /chatbot/suggestions | All | Get suggested questions |

---

## 🏆 Built For

FWC IT Services Pvt. Ltd. — AI/ML Fullstack Hackathon 2026
Theme: Build the Future of HR Management with AI-Powered Solutions

---

## 👩‍💻 Developer

**R. Sowjanya** — AI/ML Full Stack Developer
BTech AI & ML, MS Ramaiah University | CGPA 8.6