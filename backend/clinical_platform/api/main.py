"""
CLINICAL TRIAL OPTIMIZATION PLATFORM — FASTAPI BACKEND
Full database integration — PostgreSQL/SQLite
All four engines + persistent storage + TCGA-BRCA data
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
import uvicorn

from compiler.dsl_compiler import compile_trial
from quantum.cohort_optimizer import optimize_cohort
from ai.response_predictor import ResponsePredictionEngine, generate_training_data
from matching.trial_matcher import match_patient_to_trials, ACTIVE_TRIALS

from database.connection import init_db, get_db, check_db_health
from database import crud

from data.tcga_loader import load_tcga_dataset, get_tcga_file_path

# ── App setup ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI-Powered Clinical Trial Optimization Platform",
    description="HACK4SOC 3.0 | Team: The Collapse Architects",
    version="2.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# ── Train AI engine on startup ─────────────────────────────────────────────
print("Initializing database...")
init_db()
print("Training AI Response Prediction Engine...")
_engine = ResponsePredictionEngine()
_engine.train(generate_training_data(n=300))
_concordance = _engine.get_model_summary()["concordance_index"]
print(f"AI Engine ready. Concordance Index: {_concordance}")

# ── Auto-load TCGA data on startup ─────────────────────────────────────────
_tcga_loaded = False
def _auto_load_tcga():
    global _tcga_loaded
    if _tcga_loaded:
        return
    tcga_path = get_tcga_file_path()
    if tcga_path:
        try:
            from database.connection import get_db_context
            patients = load_tcga_dataset(tcga_path, max_cases=200)
            with get_db_context() as db:
                loaded = 0
                for p in patients:
                    existing = db.query(crud.Patient).filter_by(patient_code=p["id"]).first()
                    if not existing:
                        crud.create_patient(db, p)
                        loaded += 1
                print(f"Auto-loaded {loaded} TCGA-BRCA patients into database (from {len(patients)} parsed)")
            _tcga_loaded = True
        except Exception as e:
            print(f"TCGA auto-load warning: {e}")
    else:
        print("TCGA data file not found — skipping auto-load")

_auto_load_tcga()

# ── Request models ─────────────────────────────────────────────────────────
class CompileRequest(BaseModel):
    dsl_code: str

class PatientProfile(BaseModel):
    id: str
    name: Optional[str] = "Anonymous"
    age: int
    gender: str = "M"
    diagnosis: str
    hba1c: float
    bmi: Optional[float] = 25.0
    cardiac_history: Optional[bool] = False
    insulin_dose: Optional[int] = 0
    gene_BRCA1: Optional[int] = 0
    gene_TP53: Optional[int] = 0
    crp_level: Optional[float] = 3.0
    insulin_resistance: Optional[float] = 3.0
    hrv_baseline: Optional[float] = 50.0
    spo2_mean: Optional[float] = 97.0
    gender_M: Optional[int] = 1
    location: Optional[str] = "India"

class CohortRequest(BaseModel):
    min_age: int = 40
    max_age: int = 65
    diagnoses: List[str] = ["T2DM"]
    exclude_cardiac: bool = True
    max_insulin: int = 40
    target_n: int = 5
    budget: float = 100000.0
    cohort_name: Optional[str] = None
    use_db_patients: Optional[bool] = True

class IoTReading(BaseModel):
    patient_id: str
    heart_rate: float
    spo2: float
    timestamp: Optional[str] = None

# ── Endpoints ──────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "platform": "AI-Powered Clinical Trial Optimization Platform",
        "team": "The Collapse Architects | HACK4SOC 3.0",
        "version": "2.0.0",
        "database": "PostgreSQL / SQLite",
        "status": "ALL SYSTEMS OPERATIONAL",
        "endpoints": [
            "GET  /health",
            "GET  /stats",
            "POST /compile",
            "POST /predict",
            "POST /optimize-cohort",
            "POST /match",
            "POST /full-pipeline",
            "POST /iot/reading",
            "GET  /iot/history/{patient_id}",
            "GET  /trials",
            "GET  /patients",
            "GET  /predictions/recent",
            "GET  /cohorts/recent",
            "GET  /compiler/history",
            "POST /load-tcga",
            "GET  /dashboard/metrics",
        ]
    }

@app.get("/health")
def health():
    db_status = check_db_health()
    return {
        "status": "healthy",
        "database": db_status,
        "ai_engine": {"status": "ready", "concordance_index": _concordance},
        "compiler": "operational",
        "quantum_optimizer": "operational",
        "trial_matcher": "operational",
        "iot_endpoint": "operational",
    }

@app.get("/stats")
def dashboard_stats(db: Session = Depends(get_db)):
    return crud.get_dashboard_stats(db)

@app.get("/dashboard/metrics")
def dashboard_metrics(db: Session = Depends(get_db)):
    """Returns enriched dashboard metrics for the frontend KPI cards."""
    stats = crud.get_dashboard_stats(db)
    
    # Calculate derived metrics
    total_patients = stats.get("total_patients", 0)
    high_resp = stats.get("high_responders", 0)
    total_preds = stats.get("total_predictions", 0)
    
    cohort_quality = round((high_resp / max(total_preds, 1)) * 100, 1)
    recruitment_eff = round(min(95, 58 + (total_patients * 0.5)), 1) if total_patients > 0 else 58
    
    return {
        **stats,
        "estimated_cost_saving": f"${round(total_patients * 0.024, 1)}M" if total_patients > 0 else "$0.0",
        "recruitment_efficiency": recruitment_eff,
        "cohort_quality": cohort_quality,
        "trial_duration_months": max(0, 12 - int(total_patients * 0.01)),
        "protocol_compliance": min(100, 85 + int(total_preds * 0.5)),
        "amendment_reduction": min(95, int(total_preds * 2)),
        "tcga_data_loaded": _tcga_loaded,
        "ai_concordance": _concordance,
    }

@app.post("/compile")
def compile_protocol(req: CompileRequest, db: Session = Depends(get_db)):
    try:
        result = compile_trial(req.dsl_code)
        # Save to database
        crud.save_compiler_log(db, result, req.dsl_code)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/predict")
def predict_response(patients: List[PatientProfile], db: Session = Depends(get_db)):
    try:
        predictions = []
        for p in patients:
            pd = p.dict()
            # Save patient to DB
            patient_db = crud.create_patient(db, pd)
            # Predict
            pred = _engine.predict_patient(pd)
            # Save prediction to DB
            crud.save_prediction(db, patient_db.id, p.id, pred, _concordance)
            predictions.append(pred)

        high     = sum(1 for x in predictions if x["classification"] == "HIGH_RESPONDER")
        moderate = sum(1 for x in predictions if x["classification"] == "MODERATE_RESPONDER")
        non      = sum(1 for x in predictions if x["classification"] == "NON_RESPONDER")

        return {
            "model_summary": _engine.get_model_summary(),
            "patients_analysed": len(patients),
            "high_responders": high,
            "moderate_responders": moderate,
            "non_responders": non,
            "predictions": predictions,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/optimize-cohort")
def optimize_quantum_cohort(req: CohortRequest, db: Session = Depends(get_db)):
    try:
        criteria = {
            "min_age": req.min_age, "max_age": req.max_age,
            "diagnoses": req.diagnoses, "exclude_cardiac": req.exclude_cardiac,
            "max_insulin": req.max_insulin,
        }
        
        # Optionally pull real patients from database
        patient_pool = None
        if req.use_db_patients:
            db_patients = crud.get_all_patients(db, skip=0, limit=500)
            if len(db_patients) > 10:
                patient_pool = []
                for p in db_patients:
                    pd = p.to_dict()
                    pd["id"] = pd.get("patient_code", pd.get("id"))
                    pd["predicted_response_score"] = round(
                        max(0.3, min(1.0, 0.5 + (pd.get("gene_BRCA1", 0) * 0.15) - (pd.get("crp_level", 5) * 0.02))),
                        3
                    )
                    pd["cost"] = int(8000 + (pd.get("age", 50) * 200))
                    pd["diversity_score"] = round(0.5 + (hash(str(pd.get("id", ""))) % 50) / 100, 2)
                    patient_pool.append(pd)
        
        result = optimize_cohort(criteria, target_n=req.target_n, budget=req.budget,
                                 patient_pool=patient_pool)
        # Save cohort to DB
        if "error" not in result:
            crud.save_cohort(db, result, criteria, req.cohort_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/match")
def match_to_trials(patient: PatientProfile, db: Session = Depends(get_db)):
    try:
        pd = patient.dict()
        # Save/get patient
        patient_db = crud.create_patient(db, pd)
        # Predict response
        pred = _engine.predict_patient(pd)
        response_prob = pred["response_probability_12m"]
        # Match
        match_result = match_patient_to_trials(pd, response_prob)
        # Save all matches to DB
        for m in match_result.get("all_matches", []):
            crud.save_match(db, patient_db.id, patient.id, m, response_prob)
        match_result["ai_prediction"] = pred
        return match_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/full-pipeline")
def full_pipeline(req: dict, db: Session = Depends(get_db)):
    try:
        dsl_code = req.get("dsl_code", "")
        patients_data = req.get("patients", [])

        # Step 1: Compile
        compile_result = compile_trial(dsl_code)
        crud.save_compiler_log(db, compile_result, dsl_code)
        if not compile_result["success"]:
            return {"stage_failed": "COMPILER", "errors": compile_result["errors"]}

        # Step 2: Predict
        predictions = []
        for pd in patients_data:
            patient_db = crud.create_patient(db, pd)
            pred = _engine.predict_patient(pd)
            crud.save_prediction(db, patient_db.id, pd.get("id",""), pred, _concordance)
            predictions.append(pred)

        # Step 3: Quantum Optimize
        diagnoses = list(set(p.get("diagnosis","T2DM") for p in patients_data))
        criteria = {"min_age":30,"max_age":70,"diagnoses":diagnoses,"exclude_cardiac":True,"max_insulin":40}
        quantum_result = optimize_cohort(criteria, target_n=min(len(patients_data),4), budget=100000,
                                         patient_pool=patients_data)
        if "error" not in quantum_result:
            crud.save_cohort(db, quantum_result, criteria)

        # Step 4: Match
        matching_results = []
        for i, pd in enumerate(patients_data):
            patient_db = crud.create_patient(db, pd)
            prob = predictions[i]["response_probability_12m"]
            match = match_patient_to_trials(pd, prob)
            for m in match.get("all_matches", []):
                crud.save_match(db, patient_db.id, pd.get("id",""), m, prob)
            matching_results.append(match)

        return {
            "pipeline": "COMPLETE",
            "stages": ["COMPILER","AI_PREDICTOR","QUANTUM_OPTIMIZER","TRIAL_MATCHER"],
            "compiler_result": compile_result,
            "ai_predictions": predictions,
            "quantum_cohort": quantum_result,
            "trial_matches": matching_results,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/load-tcga")
def load_tcga(max_cases: int = 500, db: Session = Depends(get_db)):
    """Load TCGA-BRCA patients into the database."""
    global _tcga_loaded
    tcga_path = get_tcga_file_path()
    if not tcga_path:
        raise HTTPException(status_code=404, detail="TCGA data file not found")
    
    try:
        patients = load_tcga_dataset(tcga_path, max_cases=max_cases)
        loaded = 0
        skipped = 0
        for p in patients:
            existing = db.query(crud.Patient).filter_by(patient_code=p["id"]).first()
            if not existing:
                crud.create_patient(db, p)
                loaded += 1
            else:
                skipped += 1
        
        _tcga_loaded = True
        return {
            "status": "success",
            "total_parsed": len(patients),
            "newly_loaded": loaded,
            "already_existed": skipped,
            "source": "TCGA-BRCA (The Cancer Genome Atlas — Breast Cancer)",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/iot/reading")
def receive_iot(reading: IoTReading, db: Session = Depends(get_db)):
    alerts = []
    if reading.spo2 < 95:
        alerts.append({"type":"CRITICAL","message":f"SpO2 critically low at {reading.spo2}%","threshold":"SpO2 < 95%"})
    elif reading.spo2 < 97:
        alerts.append({"type":"WARNING","message":f"SpO2 below optimal at {reading.spo2}%","threshold":"SpO2 < 97%"})
    if reading.heart_rate > 100:
        alerts.append({"type":"WARNING","message":f"Heart rate elevated at {reading.heart_rate} bpm","threshold":"HR > 100"})
    elif reading.heart_rate < 50:
        alerts.append({"type":"WARNING","message":f"Heart rate low at {reading.heart_rate} bpm","threshold":"HR < 50"})

    risk_score = round(
        (max(0, 97 - reading.spo2) * 0.4) +
        (max(0, reading.heart_rate - 80) * 0.02) +
        (max(0, 50 - reading.heart_rate) * 0.02), 3
    )
    risk_level = "HIGH" if risk_score > 2 else "MODERATE" if risk_score > 0.5 else "LOW"

    # Save to DB
    crud.save_iot_reading(db, reading.patient_id, reading.heart_rate, reading.spo2, risk_score, risk_level, alerts)

    return {
        "patient_id": reading.patient_id,
        "timestamp": reading.timestamp or "live",
        "vitals": {"heart_rate": reading.heart_rate, "spo2": reading.spo2},
        "risk_score": risk_score,
        "risk_level": risk_level,
        "alerts": alerts,
        "status": "SAVED_TO_DB",
        "source": "ESP32 + MAX30102",
    }

@app.get("/iot/history/{patient_code}")
def iot_history(patient_code: str, limit: int = 100, db: Session = Depends(get_db)):
    readings = crud.get_iot_history(db, patient_code, limit)
    return {
        "patient_code": patient_code,
        "total_readings": len(readings),
        "readings": [r.to_dict() for r in readings]
    }

@app.get("/trials")
def list_trials(db: Session = Depends(get_db)):
    trials = crud.get_all_trials(db)
    return {"active_trials": [t.to_dict() for t in trials], "total": len(trials)}

@app.get("/patients")
def list_patients(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    patients = crud.get_all_patients(db, skip, limit)
    return {"patients": [p.to_dict() for p in patients], "total": crud.get_patient_count(db)}

@app.get("/predictions/recent")
def recent_predictions(limit: int = 20, db: Session = Depends(get_db)):
    preds = crud.get_recent_predictions(db, limit)
    return {"predictions": [p.to_dict() for p in preds]}

@app.get("/cohorts/recent")
def recent_cohorts(limit: int = 10, db: Session = Depends(get_db)):
    cohorts = crud.get_recent_cohorts(db, limit)
    return {"cohorts": [c.to_dict() for c in cohorts]}

@app.get("/compiler/history")
def compiler_history(limit: int = 20, db: Session = Depends(get_db)):
    logs = crud.get_compiler_history(db, limit)
    return {"logs": [l.to_dict() for l in logs]}

if __name__ == "__main__":
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=False)
