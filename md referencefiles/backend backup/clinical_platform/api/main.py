"""
CLINICAL TRIAL OPTIMIZATION PLATFORM — FASTAPI BACKEND
Full database integration — PostgreSQL/SQLite
All four engines + persistent storage
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

# ── App setup ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI-Powered Clinical Trial Optimization Platform",
    description="HACK4SOC 3.0 | Team: The Collapse Architects",
    version="2.0.0"
)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ── Train AI engine on startup ─────────────────────────────────────────────
print("Initializing database...")
init_db()
print("Training AI Response Prediction Engine...")
_engine = ResponsePredictionEngine()
_engine.train(generate_training_data(n=300))
_concordance = _engine.get_model_summary()["concordance_index"]
print(f"AI Engine ready. Concordance Index: {_concordance}")

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
        result = optimize_cohort(criteria, target_n=req.target_n, budget=req.budget)
        # Save cohort to DB
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
        quantum_result = optimize_cohort(criteria, target_n=min(len(patients_data),4), budget=100000)
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
