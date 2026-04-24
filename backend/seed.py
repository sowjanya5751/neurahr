from sqlalchemy.orm import Session
from database import SessionLocal
from models.models import User
from passlib.context import CryptContext

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

DEMO_USERS = [
    {"id": "user-admin-001", "name": "Arjun Mehta",   "email": "admin@neurahr.com",    "password": "Admin123",   "role": "admin"},
    {"id": "user-hr-001",    "name": "Priya Sharma",  "email": "hr@neurahr.com",        "password": "Hr123456",   "role": "hr"},
    {"id": "user-mgr-001",   "name": "Ravi Kumar",    "email": "manager@neurahr.com",   "password": "Mgr12345",   "role": "manager"},
    {"id": "user-emp-001",   "name": "Sneha Reddy",   "email": "employee@neurahr.com",  "password": "Emp12345",   "role": "employee"},
]

def seed_users():
    db: Session = SessionLocal()
    try:
        for u in DEMO_USERS:
            exists = db.query(User).filter(User.email == u["email"]).first()
            if not exists:
                user = User(
                    id=u["id"],
                    name=u["name"],
                    email=u["email"],
                    hashed_password=pwd_ctx.hash(u["password"]),
                    role=u["role"],
                )
                db.add(user)
        db.commit()
        print("[Seed] Demo users ready.")
    except Exception as e:
        print(f"[Seed] Error: {e}")
        db.rollback()
    finally:
        db.close()