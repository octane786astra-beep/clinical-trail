"""
DATABASE CONNECTION & SESSION MANAGEMENT
Supports PostgreSQL (production) and SQLite (development/demo fallback)
"""

import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager
from .models import Base, ClinicalTrial, Patient
import json

# ─────────────────────────────────────────────────────────────────────────────
# DATABASE URL — PostgreSQL preferred, SQLite fallback for demo
# ─────────────────────────────────────────────────────────────────────────────
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "sqlite:///./clinical_trial_platform.db"   # fallback for demo
)

# Convert postgres:// to postgresql:// if needed (Railway/Heroku style)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Engine config
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        echo=False
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ─────────────────────────────────────────────────────────────────────────────
# DEPENDENCY — FastAPI dependency injection
# ─────────────────────────────────────────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context():
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


# ─────────────────────────────────────────────────────────────────────────────
# INIT — create all tables
# ─────────────────────────────────────────────────────────────────────────────
def init_db():
    Base.metadata.create_all(bind=engine)
    print(f"Database initialized: {DATABASE_URL.split('///')[0]}")
    seed_trials()


# ─────────────────────────────────────────────────────────────────────────────
# SEED — populate active clinical trials
# ─────────────────────────────────────────────────────────────────────────────
SEED_TRIALS = [
    {
        "trial_id": "NCT_DM_001",
        "title": "Novel GLP-2 Agonist for Type 2 Diabetes Management",
        "sponsor": "PharmaCorp India Pvt Ltd",
        "location": "Chennai, India",
        "disease": "T2DM", "phase": "Phase III",
        "min_age": 35, "max_age": 65,
        "required_diagnoses": ["T2DM"],
        "exclude_cardiac": True,
        "min_hba1c": 7.0, "max_hba1c": 12.0,
        "patients_needed": 200, "patients_enrolled": 142,
        "urgency": "HIGH", "status": "ACTIVE",
    },
    {
        "trial_id": "NCT_DM_002",
        "title": "Insulin Sensitizer Combination Therapy Trial",
        "sponsor": "AIIMS New Delhi",
        "location": "New Delhi, India",
        "disease": "T2DM", "phase": "Phase II",
        "min_age": 40, "max_age": 70,
        "required_diagnoses": ["T2DM", "Pre-diabetic"],
        "exclude_cardiac": False,
        "min_hba1c": 6.5, "max_hba1c": 14.0,
        "patients_needed": 150, "patients_enrolled": 89,
        "urgency": "MEDIUM", "status": "ACTIVE",
    },
    {
        "trial_id": "NCT_CARD_001",
        "title": "Cardioprotective Agent in Diabetic Patients",
        "sponsor": "Tata Memorial Centre",
        "location": "Mumbai, India",
        "disease": "Hypertension", "phase": "Phase III",
        "min_age": 45, "max_age": 75,
        "required_diagnoses": ["Hypertension", "T2DM"],
        "exclude_cardiac": False,
        "min_hba1c": 0.0, "max_hba1c": 10.0,
        "patients_needed": 300, "patients_enrolled": 201,
        "urgency": "LOW", "status": "ACTIVE",
    },
    {
        "trial_id": "NCT_PRE_001",
        "title": "Lifestyle Intervention for Pre-Diabetic Reversal",
        "sponsor": "Apollo Hospitals Bangalore",
        "location": "Bangalore, India",
        "disease": "Pre-diabetic", "phase": "Phase II",
        "min_age": 30, "max_age": 60,
        "required_diagnoses": ["Pre-diabetic"],
        "exclude_cardiac": True,
        "min_hba1c": 5.7, "max_hba1c": 8.0,
        "patients_needed": 100, "patients_enrolled": 34,
        "urgency": "HIGH", "status": "ACTIVE",
    },
    {
        "trial_id": "NCT_TB_001",
        "title": "Novel Regimen for Drug-Resistant Tuberculosis",
        "sponsor": "ICMR National Institute",
        "location": "Pune, India",
        "disease": "MDR-TB", "phase": "Phase II",
        "min_age": 18, "max_age": 65,
        "required_diagnoses": ["MDR-TB"],
        "exclude_cardiac": False,
        "min_hba1c": 0.0, "max_hba1c": 20.0,
        "patients_needed": 120, "patients_enrolled": 45,
        "urgency": "HIGH", "status": "ACTIVE",
    },
    # ── Oncology / Breast Cancer trials (TCGA-BRCA compatible) ──────────
    {
        "trial_id": "NCT_BRCA_001",
        "title": "Adaptive Immunotherapy for HER2+ Breast Cancer",
        "sponsor": "MD Anderson Cancer Center",
        "location": "Houston, TX, USA",
        "disease": "Breast Cancer", "phase": "Phase III",
        "min_age": 30, "max_age": 75,
        "required_diagnoses": [
            "Infiltrating duct carcinoma, NOS",
            "Lobular carcinoma, NOS",
            "Adenoid cystic carcinoma",
            "Apocrine adenocarcinoma",
        ],
        "exclude_cardiac": True,
        "min_hba1c": 0.0, "max_hba1c": 20.0,
        "patients_needed": 500, "patients_enrolled": 187,
        "urgency": "HIGH", "status": "ACTIVE",
    },
    {
        "trial_id": "NCT_BRCA_002",
        "title": "Neoadjuvant Chemotherapy Optimization in Triple-Negative BRCA",
        "sponsor": "Dana-Farber Cancer Institute",
        "location": "Boston, MA, USA",
        "disease": "Breast Cancer", "phase": "Phase II",
        "min_age": 25, "max_age": 70,
        "required_diagnoses": [
            "Infiltrating duct carcinoma, NOS",
            "Infiltrating duct mixed with other types of carcinoma",
            "Intraductal papillary adenocarcinoma with invasion",
        ],
        "exclude_cardiac": False,
        "min_hba1c": 0.0, "max_hba1c": 20.0,
        "patients_needed": 300, "patients_enrolled": 92,
        "urgency": "MEDIUM", "status": "ACTIVE",
    },
    {
        "trial_id": "NCT_BRCA_003",
        "title": "Hormone Receptor Targeted Therapy for ER+ Breast Cancer",
        "sponsor": "Mayo Clinic Rochester",
        "location": "Rochester, MN, USA",
        "disease": "Breast Cancer", "phase": "Phase III",
        "min_age": 40, "max_age": 80,
        "required_diagnoses": [
            "Infiltrating duct carcinoma, NOS",
            "Lobular carcinoma, NOS",
            "Mixed lobular-ductal carcinoma",
        ],
        "exclude_cardiac": True,
        "min_hba1c": 0.0, "max_hba1c": 20.0,
        "patients_needed": 400, "patients_enrolled": 156,
        "urgency": "HIGH", "status": "ACTIVE",
    },
]

def seed_trials():
    with get_db_context() as db:
        for t in SEED_TRIALS:
            exists = db.query(ClinicalTrial).filter_by(trial_id=t["trial_id"]).first()
            if not exists:
                trial = ClinicalTrial(**t)
                db.add(trial)
        print(f"Seeded {len(SEED_TRIALS)} clinical trials into database.")


# ─────────────────────────────────────────────────────────────────────────────
# DATABASE HEALTH CHECK
# ─────────────────────────────────────────────────────────────────────────────
def check_db_health() -> dict:
    try:
        with get_db_context() as db:
            db.execute(text("SELECT 1"))
            patient_count = db.query(Patient).count()
            trial_count   = db.query(ClinicalTrial).count()
        return {
            "status": "connected",
            "database": DATABASE_URL.split("///")[0],
            "patients": patient_count,
            "trials": trial_count,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
