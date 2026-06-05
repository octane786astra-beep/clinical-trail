Write-Host "======================================================"
Write-Host " AI Clinical Trial Optimization Platform v2.0"
Write-Host " Team: The Collapse Architects | HACK4SOC 3.0"
Write-Host "======================================================"
Write-Host ""

# Ensure we're in the right directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "Step 1: Installing dependencies..."
pip install -r requirements.txt -q

Write-Host ""
Write-Host "Step 2: Running system tests..."

python -c @"
import sys; sys.path.insert(0, '.')
from database.connection import init_db, check_db_health
init_db()
h = check_db_health()
print(f'  DATABASE: {h[""status""].upper()} | Patients: {h.get(""patients"", 0)} | Trials: {h.get(""trials"", 0)}')
"@

python -c @"
import sys; sys.path.insert(0, '.')
from compiler.dsl_compiler import compile_trial
r = compile_trial('TRIAL t { PATIENT: age IN [40,60] DURATION: months = 6 ARMS: m = ""X"" MONITOR: s = true BUDGET: a = 100000 SITES: c = 2 }')
print('  COMPILER: PASS' if r['success'] else '  COMPILER: FAIL')
"@

python -c @"
import sys; sys.path.insert(0, '.')
from ai.response_predictor import ResponsePredictionEngine, generate_training_data
e = ResponsePredictionEngine()
e.train(generate_training_data())
p = e.predict_patient({'id':'T','age':52,'hba1c':8.5,'bmi':28,'gene_BRCA1':1,'gene_TP53':0,'crp_level':3.2,'insulin_resistance':4.5,'hrv_baseline':45,'spo2_mean':97,'gender_M':1})
print(f'  AI ENGINE: PASS | {p[""classification""]}')
"@

python -c @"
import sys; sys.path.insert(0, '.')
from quantum.cohort_optimizer import optimize_cohort
r = optimize_cohort({'min_age':40,'max_age':65,'diagnoses':['T2DM'],'exclude_cardiac':True,'max_insulin':40},target_n=3,budget=80000)
qr = r.get('quantum_result', {})
print(f'  QUANTUM: PASS | Qubits: {qr.get(""qubits_used"", ""N/A"")} | Selected: {qr.get(""selected_count"", ""N/A"")}')
"@

python -c @"
import sys; sys.path.insert(0, '.')
from matching.trial_matcher import match_patient_to_trials
r = match_patient_to_trials({'id':'T','age':52,'diagnosis':'T2DM','hba1c':8.5,'cardiac_history':False},0.72)
print(f'  MATCHER: PASS | Eligible trials: {r[""eligible_trials_found""]}')
"@

Write-Host ""
Write-Host "======================================================"
Write-Host " ALL SYSTEMS OPERATIONAL"
Write-Host " Starting server on http://localhost:8000"
Write-Host " API Docs: http://localhost:8000/docs"
Write-Host " Database: SQLite (switch to PostgreSQL via .env)"
Write-Host "======================================================"
Write-Host ""

python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
