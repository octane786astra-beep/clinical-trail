# Clinical Trial Optimization Platform — Master Context Document
> **Version:** 2.1.0 | **Team:** The Collapse Architects | **Event:** HACK4SOC 3.0

This document is the single source of truth for the entire platform. It covers project goals, architecture, frontend views, backend services, API reference, database schema, and developer notes. Use it as a universal context file when prompting AI assistants or onboarding collaborators.

---

## 1. Project Overview

An AI-powered, full-stack clinical trial optimization platform that uses four core engines to reduce trial overhead, improve patient stratification, and enforce regulatory compliance:

| Engine | Technology | Purpose |
|---|---|---|
| **DSL Compiler** | Custom Python Lexer → Parser → AST | Compile trial protocol specs in a domain language into structured IR |
| **AI Predictor** | Cox Proportional Hazards (`lifelines`) | Predict patient drug response probability before trial begins |
| **Quantum Optimizer** | Qiskit (QAOA) | Optimally select patient cohorts from a large pool using QAOA |
| **Trial Matcher** | Rule-based + AI scoring | Match patients to best-fit active clinical trials |

**Stack summary:**
- **Frontend:** React 18 + Vite + TypeScript + TailwindCSS (Vanilla CSS)
- **Backend:** FastAPI + SQLAlchemy + Uvicorn
- **Database:** SQLite (local dev) → upgradeable to PostgreSQL via `.env`
- **Data Source:** TCGA-BRCA (The Cancer Genome Atlas — Breast Cancer) patient dataset

---

## 2. Repository Structure

```
clinical trail/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/         # All React view components
│   │   │   ├── DashboardView.tsx
│   │   │   ├── DnaBackground.tsx
│   │   │   ├── EditorView.tsx
│   │   │   ├── GenomeDataView.tsx   ← NEW in v2.1
│   │   │   ├── Header.tsx
│   │   │   ├── LandingView.tsx
│   │   │   ├── OptimizeView.tsx
│   │   │   ├── ReportsView.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── App.tsx             # Root component, routing state
│   │   ├── api.ts              # All backend API client functions
│   │   ├── types.ts            # Shared TypeScript enums and interfaces
│   │   ├── main.tsx            # React entry point
│   │   └── index.css           # Global styles
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   └── clinical_platform/
│       ├── api/
│       │   └── main.py         # FastAPI app + all endpoint definitions
│       ├── ai/
│       │   └── response_predictor.py   # Cox PH engine
│       ├── compiler/
│       │   └── dsl_compiler.py         # DSL Lexer → Parser → Compliance
│       ├── database/
│       │   ├── models.py       # SQLAlchemy ORM table definitions
│       │   ├── crud.py         # All DB read/write operations
│       │   └── connection.py   # DB init, session factory, health check
│       ├── data/
│       │   └── tcga_loader.py  # TCGA-BRCA CSV parser and loader
│       ├── matching/
│       │   └── trial_matcher.py        # Patient → trial eligibility matching
│       ├── quantum/
│       │   └── cohort_optimizer.py     # QAOA cohort selection
│       ├── requirements.txt
│       ├── run.ps1             # Windows PowerShell startup script
│       └── run.sh              # Linux/Mac startup script
│
├── .gitignore
├── GenomeData_Documentation.md
└── README.md
```

---

## 3. Frontend Architecture

### 3.1 Navigation & Routing

Navigation is managed via a `ViewType` enum in `types.ts`. The `App.tsx` component holds `currentView` state and conditionally renders each view. There is no React Router — routing is done with simple conditional JSX.

```typescript
// types.ts
export enum ViewType {
  LANDING = "landing",
  DASHBOARD = "dashboard",
  EDITOR = "editor",
  COHORT = "cohort",
  OPTIMIZE = "optimize",
  GENOME_DATA = "genome_data",   // Patient genomic data ingestion
  REPORTS = "reports",
  AUDIT = "audit",
  DOCUMENTS = "documents",
  SETTINGS = "settings",
}
```

Views `COHORT`, `AUDIT`, `DOCUMENTS`, and `SETTINGS` are placeholder stubs — they show a "locked module" card.

### 3.2 Component Breakdown

#### `LandingView.tsx`
The hero landing page rendered above the app workspace. Features animated DNA strands, a headline section, and a CTA button that scrolls down to the main workspace. Always visible at the top of the page.

#### `DnaBackground.tsx`
An animated SVG/canvas background effect rendered behind all content. Pure visual; no data or props.

#### `Header.tsx`
**Props:** `compilerStatus`, `simulationActive`, `onReset`, `systemMetrics`

Sticky top bar that includes:
- Breadcrumb workspace label
- **Status Rail** (API Gateway, DSL Compiler, Solver Engine) — each is clickable and opens a floating info card
- Global reset button
- Notification bell with dropdown
- User profile badge (Dr. Ram Murthy)

#### `Sidebar.tsx`
**Props:** `currentView`, `onViewChange`, `onLogoClick`

Left navigation panel (fixed, 288px wide). Contains logo, nav menu, and a system status indicator at the bottom.

#### `DashboardView.tsx`
**Props:** `metrics`, `templates`, `selectedTemplate`, `onSelectTemplate`, `onNavigateToOptimize`

Main metrics dashboard showing:
- KPI cards (patients enrolled, cost savings, recruitment efficiency, etc.)
- Trial templates selector (3 hardcoded oncology/diabetes protocols)
- Recent predictions and cohort stats from live backend data

#### `EditorView.tsx`
**Props:** `dslCode`, `onDslCodeChange`, `compilerLogs`, `onCompile`, `isCompiling`, `constraints`, `onUpdateConstraintScore`

The protocol editor. Left panel is a DSL code editor with syntax keywords. Right panel streams compiler logs in real time. Shows active constraint cards (Regulatory, Feasibility, Budgetary). On successful compile, navigates to Optimize view.

**DSL Syntax** (domain-specific language):
```
TRIAL <TrialName> {
  PATIENT: age IN [30,75], diagnosis = "T2DM"
  EXCLUDE: cardiac_history = true, insulin_dose > 40
  INCLUDE: gene_BRCA1 = 1
  DURATION: months = 28
  ARMS: treatment = "DrugX", placebo = "control"
  MONITOR: safety = true
  BUDGET: amount = 21000000
  SITES: count = 3
}
```

#### `OptimizeView.tsx`
**Props:** `optimizationSteps`, `onTriggerOptimization`, `isOptimizing`, `selectedTemplateTitle`

Displays 3 optimization steps (Cohort Stratification, Site Selection, Trial Performance Predictor) as animated progress cards. Calls the quantum optimizer backend. Shows metrics like qubits used, states explored, and circuit depth.

#### `ReportsView.tsx`
**Props:** `reports`, `onTriggerDownload`, `selectedTemplateId`

Shows protocol reports in card layout. Each report has title, phase, area, feasibility score, cost saving, and status. Downloadable as a plain-text audit report.

#### `GenomeDataView.tsx` *(Added v2.1)*
No props — self-contained. Two input modes:

1. **Bulk JSON Upload** — Drag-and-drop or paste a JSON array of `PatientProfile` objects. Sends to `POST /patients/bulk`.
2. **Manual Entry Form** — Individual patient form with fields for: Patient Code, Age, Gender, HbA1c, Diagnosis, BRCA1 toggle (0/1), TP53 toggle (0/1). Sends single record to `POST /patients/bulk`.

Shows a status badge after each submission (uploading / success / error).

### 3.3 Key State in `App.tsx`

| State | Type | Purpose |
|---|---|---|
| `currentView` | `ViewType` | Current active view |
| `templates` | `TrialReport[]` | 3 trial templates shown in Dashboard/Reports |
| `selectedTemplateId` | `string` | Which trial is active in the workflow |
| `dslCode` | `string` | Current DSL code in editor |
| `compilerLogs` | `CompilerLog[]` | Streamed logs from compile run |
| `constraints` | `ActiveConstraint[]` | Regulatory, feasibility, budget constraint scores |
| `optimizationSteps` | `OptimizationCore[]` | Status of 3 quantum optimizer steps |
| `isOptimizing` | `boolean` | Quantum optimizer running flag |
| `isCompiling` | `boolean` | DSL compiler running flag |
| `backendConnected` | `boolean` | Healthcheck connection state |
| `quantumResult` | `Record<string,unknown>` | Raw quantum optimizer result from backend |
| `dynamicMetricsOverride` | `Record<string,unknown>` | Live backend KPI data from `/dashboard/metrics` |

### 3.4 API Client (`api.ts`)

All backend calls go through `apiFetch()` which wraps `fetch()` with JSON headers and error throwing. Base URL defaults to `http://localhost:8000` (overridable via `VITE_API_URL` env var).

**Exported functions:**

| Function | Method | Endpoint |
|---|---|---|
| `getHealthStatus()` | GET | `/health` |
| `getDashboardStats()` | GET | `/stats` |
| `getDashboardMetrics()` | GET | `/dashboard/metrics` |
| `compileProtocol(dslCode)` | POST | `/compile` |
| `optimizeCohort(params)` | POST | `/optimize-cohort` |
| `predictResponse(patients)` | POST | `/predict` |
| `matchPatient(patient)` | POST | `/match` |
| `runFullPipeline(dslCode, patients)` | POST | `/full-pipeline` |
| `loadTcgaData(maxCases)` | POST | `/load-tcga` |
| `getTrials()` | GET | `/trials` |
| `getPatients(skip, limit)` | GET | `/patients` |
| `getRecentPredictions(limit)` | GET | `/predictions/recent` |
| `getRecentCohorts(limit)` | GET | `/cohorts/recent` |
| `getCompilerHistory(limit)` | GET | `/compiler/history` |
| `addPatientsBulk(patients)` | POST | `/patients/bulk` |

---

## 4. Backend Architecture

### 4.1 Entry Point (`api/main.py`)

FastAPI application. On startup it:
1. Calls `init_db()` to create SQLite tables if they don't exist.
2. Trains the `ResponsePredictionEngine` on 300 synthetic records.
3. Auto-loads TCGA-BRCA data from disk (up to 200 patients) if the file is found.

**CORS config:** Allows `*`, `localhost:3000`, `localhost:5173`.

### 4.2 Request Models (Pydantic)

```python
class PatientProfile(BaseModel):
    id: str                              # Unique patient code (e.g. "TCGA-A1-A0SB")
    name: Optional[str] = "Anonymous"
    age: int
    gender: str = "M"                    # "M" or "F"
    diagnosis: str
    hba1c: float
    bmi: Optional[float] = 25.0
    cardiac_history: Optional[bool] = False
    insulin_dose: Optional[int] = 0
    gene_BRCA1: Optional[int] = 0        # 0 = wild-type, 1 = mutant
    gene_TP53: Optional[int] = 0         # 0 = wild-type, 1 = mutant
    crp_level: Optional[float] = 3.0
    insulin_resistance: Optional[float] = 3.0
    hrv_baseline: Optional[float] = 50.0
    spo2_mean: Optional[float] = 97.0
    gender_M: Optional[int] = 1          # Binary encoding for AI model
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
```

### 4.3 DSL Compiler (`compiler/dsl_compiler.py`)

A full 5-stage compiler pipeline:

```
Source Text
    ↓
[Stage 1] LEXER — tokenizes DSL text (keywords, operators, numbers, strings)
    ↓
[Stage 2] PARSER — produces AST (TrialNode → SectionNode → RuleNode)
    ↓
[Stage 3] SEMANTIC ANALYSIS — checks required sections, duration logic, age conflicts
    ↓
[Stage 4] FDA COMPLIANCE CHECK — validates against 4 ICH/FDA rules
    ↓
[Stage 5] IR OUTPUT — JSON intermediate representation of the compiled protocol
```

**FDA Rules checked:**
- `FDA-001`: Must have a MONITOR section (ICH E6 5.1)
- `FDA-002`: Must define at least one SITES entry (ICH E6 4.1)
- `FDA-003`: Must declare BUDGET (FDA 21 CFR Part 312)
- `FDA-004`: Trial name must not be empty (FDA 21 CFR Part 312.23)

**Compiler output:**
```json
{
  "success": true,
  "trial_name": "TCGA_BRCA_AdaptiveImmunotherapy",
  "ir": { "trial_name": "...", "sections": {} },
  "tokens_count": 42,
  "errors": [],
  "warnings": ["DURATION WARNING: Trial > 12 months..."],
  "compliance": { "violations": [], "passed": [...] },
  "stages_completed": ["LEXER", "PARSER", "AST", "SEMANTIC_ANALYSIS", "COMPLIANCE_CHECK"]
}
```

### 4.4 AI Response Predictor (`ai/response_predictor.py`)

**Model:** Cox Proportional Hazards (`lifelines.CoxPHFitter`, penalizer=0.1)

**Training:** On startup, trains on 300 synthetic patients mimicking TCGA-style data.

**Features used:**
- `age`, `hba1c`, `bmi`, `gene_BRCA1`, `gene_TP53`
- `crp_level`, `insulin_resistance`, `hrv_baseline`, `spo2_mean`, `gender_M`

**Output per patient:**
```json
{
  "patient_id": "TCGA-A1-A0SB",
  "response_probability_12m": 0.72,
  "median_response_months": 18.3,
  "risk_score": 0.843,
  "classification": "HIGH_RESPONDER",
  "recommendation": "INCLUDE — strong predicted response",
  "causal_drivers": [
    { "feature": "gene_BRCA1", "coefficient": 0.03, "hazard_ratio": 1.03, "p_value": 0.012, "significant": true }
  ],
  "model": "Cox Proportional Hazards (Bradford Hill + Pearl framework)"
}
```

**Classification thresholds:**
- `>= 0.65` → `HIGH_RESPONDER`
- `0.40–0.64` → `MODERATE_RESPONDER`
- `< 0.40` → `NON_RESPONDER`

### 4.5 Quantum Cohort Optimizer (`quantum/cohort_optimizer.py`)

Uses **QAOA (Quantum Approximate Optimization Algorithm)** via Qiskit to solve the NP-hard patient cohort selection problem as a QUBO (Quadratic Unconstrained Binary Optimization).

Given a pool of patients with predicted response scores and costs, it selects the optimal cohort of `target_n` patients that maximizes total response score within a budget.

**Output:**
```json
{
  "total_patients_screened": 200,
  "eligible_after_filter": 85,
  "candidates_sent_to_quantum": 10,
  "quantum_result": {
    "method": "QAOA",
    "qubits_used": 10,
    "shots": 1024,
    "unique_states_explored": 234,
    "best_bitstring": "1010100010",
    "selected_count": 5,
    "total_response_score": 3.87,
    "total_cost": 48200,
    "circuit_depth": 12
  }
}
```

### 4.6 Trial Matcher (`matching/trial_matcher.py`)

Rule-based engine that matches a patient profile against `ACTIVE_TRIALS` (a hardcoded list of 8 real-world trial specs). Each trial has eligibility criteria (age range, diagnosis, HbA1c bounds, cardiac exclusions, gene requirements). Calculates a match score and returns eligible trials ranked by score.

### 4.7 TCGA Data Loader (`data/tcga_loader.py`)

Parses a local TCGA-BRCA clinical CSV file and maps fields to the `Patient` schema. On startup, up to 200 patients are auto-loaded into the database. Additional patients can be loaded via `POST /load-tcga?max_cases=500`.

---

## 5. API Reference

All endpoints are served at `http://localhost:8000`.

### Health & Monitoring

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Platform info and list of all endpoints |
| `GET` | `/health` | DB status, AI engine status, all subsystems |
| `GET` | `/stats` | Raw database record counts |
| `GET` | `/dashboard/metrics` | Enriched KPIs for frontend dashboard cards |

### Core Engines

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/compile` | `{ "dsl_code": "..." }` | Run DSL compiler, get IR + compliance report |
| `POST` | `/predict` | `[PatientProfile, ...]` | AI response predictions for N patients |
| `POST` | `/optimize-cohort` | `CohortRequest` | Quantum cohort selection |
| `POST` | `/match` | `PatientProfile` | Match single patient to all active trials |
| `POST` | `/full-pipeline` | `{ "dsl_code": "...", "patients": [...] }` | Run all 4 stages in sequence |

### Patient Data

| Method | Path | Description |
|---|---|---|
| `GET` | `/patients?skip=0&limit=50` | List patients from DB |
| `POST` | `/patients/bulk` | Bulk insert array of PatientProfiles |
| `POST` | `/load-tcga?max_cases=500` | Load TCGA-BRCA patients from CSV file |

### Data Retrieval

| Method | Path | Description |
|---|---|---|
| `GET` | `/trials` | List all ACTIVE clinical trials |
| `GET` | `/predictions/recent?limit=20` | Recent AI predictions |
| `GET` | `/cohorts/recent?limit=10` | Recent quantum cohort results |
| `GET` | `/compiler/history?limit=20` | Recent DSL compilation logs |

---

## 6. Database Schema

**Engine:** SQLite (file: `backend/clinical_platform/clinical_trial_platform.db`)
**ORM:** SQLAlchemy 2.0

### `patients`

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `patient_code` | STRING(50) UNIQUE | e.g. "TCGA-A1-A0SB" |
| `name` | STRING(100) | Default: "Anonymous" |
| `age` | INTEGER | Required |
| `gender` | STRING(10) | "M" or "F" |
| `diagnosis` | STRING(100) | e.g. "Infiltrating duct carcinoma, NOS" |
| `hba1c` | FLOAT | HbA1c blood sugar marker |
| `bmi` | FLOAT | Body mass index |
| `cardiac_history` | BOOLEAN | Default: false |
| `insulin_dose` | INTEGER | Default: 0 |
| `gene_BRCA1` | INTEGER | 0=wild-type, 1=mutant |
| `gene_TP53` | INTEGER | 0=wild-type, 1=mutant |
| `crp_level` | FLOAT | C-reactive protein inflammation marker |
| `insulin_resistance` | FLOAT | HOMA-IR index |
| `hrv_baseline` | FLOAT | Heart rate variability |
| `spo2_mean` | FLOAT | Average blood oxygen saturation |
| `gender_M` | INTEGER | Binary encoding (1=male, 0=female) |
| `location` | STRING(200) | Geographic location |
| `created_at` | DATETIME | Auto-set |
| `updated_at` | DATETIME | Auto-updated |

### `clinical_trials`

| Column | Type | Notes |
|---|---|---|
| `trial_id` | STRING(50) UNIQUE | NCT-style ID |
| `title` | STRING(500) | Full trial name |
| `sponsor`, `location` | STRING | Org and site |
| `disease`, `phase` | STRING | |
| `min_age`, `max_age` | INTEGER | Eligibility age range |
| `required_diagnoses` | JSON | Array of diagnosis strings |
| `exclude_cardiac` | BOOLEAN | Cardiac exclusion flag |
| `min_hba1c`, `max_hba1c` | FLOAT | HbA1c bounds |
| `patients_needed` | INTEGER | Target enrollment |
| `patients_enrolled` | INTEGER | Current enrollment |
| `urgency` | STRING(20) | "HIGH", "MEDIUM", "LOW" |
| `status` | STRING(20) | "ACTIVE" (only active trials matched) |
| `dsl_protocol` | TEXT | Raw DSL source for this trial |

### `predictions`

| Column | Type | Notes |
|---|---|---|
| `patient_id` | FK → patients.id | |
| `patient_code` | STRING | Denormalized for quick queries |
| `response_probability` | FLOAT | 0–1 scale |
| `median_response_months` | FLOAT | |
| `risk_score` | FLOAT | Cox partial hazard score |
| `classification` | STRING(30) | HIGH/MODERATE/NON_RESPONDER |
| `recommendation` | TEXT | |
| `causal_drivers` | JSON | Top 5 feature importance array |
| `model_used` | STRING | Model name/version |
| `concordance_index` | FLOAT | Model accuracy metric |

### `cohorts`

| Column | Type | Notes |
|---|---|---|
| `cohort_name` | STRING | Auto-generated timestamp name or custom |
| `total_screened` | INTEGER | Patients screened |
| `eligible_after_filter` | INTEGER | After criteria filter |
| `candidates_sent_to_quantum` | INTEGER | Sent to QAOA solver |
| `selected_count`, `target_count` | INTEGER | |
| `total_response_score`, `total_cost` | FLOAT | Optimization objective values |
| `qubits_used`, `shots`, `unique_states_explored`, `circuit_depth` | INTEGER | Quantum metrics |
| `selected_patients` | JSON | Array of selected patient objects |
| `criteria` | JSON | The CohortRequest criteria used |

### `compiler_logs`

Stores every DSL compilation: source code, success flag, token count, errors, warnings, compliance results, and the full IR output.

### `trial_matches`

Stores patient-to-trial match results: match score, eligibility boolean, match reasons, disqualifiers, and the AI response probability used during matching.

### `iot_readings` *(Legacy — kept in schema, not actively used in v2.1)*

Legacy table from the IoT Simulator feature. Still exists in the DB schema for data integrity but no new records are written.

---

## 7. Developer Setup

### Prerequisites
- **Python 3.10–3.13** (avoid 3.14 — some binary deps don't support it yet)
- **Node.js 18+** and npm
- Git

### Backend Setup (Windows)
```powershell
cd "clinical trail\backend\clinical_platform"
powershell -ExecutionPolicy Bypass -File .\run.ps1
# Server starts at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### Backend Setup (Linux/Mac)
```bash
cd "clinical trail/backend/clinical_platform"
chmod +x run.sh && ./run.sh
```

### Frontend Setup
```bash
cd "clinical trail/frontend"
npm install
npm run dev       # Dev server → http://localhost:3000
npm run build     # Production build → ./dist/
```

### Environment Variables
Copy `.env.example` to `.env` in the backend directory:
```
DATABASE_URL=sqlite:///./clinical_trial_platform.db
# Uncomment for PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost/clinicaldb
```

### Python Dependencies (`requirements.txt`)
```
fastapi==0.111.0
uvicorn==0.30.0
sqlalchemy==2.0.30
# psycopg2-binary==2.9.9   ← disabled (compilation issues on Windows/Python 3.14)
alembic==1.13.1
databases==0.9.0
# asyncpg==0.29.0          ← disabled
qiskit==1.1.0
qiskit-aer==0.14.2
lifelines==0.27.8
pandas==2.2.2
numpy==1.26.4
scikit-learn==1.5.0
pydantic==2.7.1
python-dotenv==1.0.1
```

---

## 8. Key Implementation Notes

### Frontend Patterns
- All TypeScript casting issues with Framer Motion variants use `as any` in `DashboardView.tsx` for build stability.
- `import.meta.env` is accessed via `(import.meta as any).env` throughout `api.ts` for TypeScript compatibility.
- The platform uses a **scroll-based layout**: landing section renders above the sticky app workspace. The Sidebar button `onLogoClick` scrolls back to the top.

### Backend Patterns
- The `create_patient()` CRUD function is idempotent — if a patient with the same `patient_code` already exists, it returns the existing record without creating a duplicate.
- The Quantum optimizer's `QAOA` circuit degrades gracefully — if Qiskit's AerSimulator is unavailable, it falls back to a classical greedy algorithm.
- The TCGA auto-load runs once per server session (guarded by `_tcga_loaded` flag).

### Known Constraints
- PostgreSQL (`psycopg2`) and async drivers (`asyncpg`) are disabled in `requirements.txt` due to C-extension compilation failures on Windows + Python 3.14.
- The `iot_readings` table is still in the DB schema but no new data is written — can be safely migrated out in a future cleanup.

---

## 9. Trial Protocol Templates

Three pre-built DSL protocols are hardcoded in `App.tsx`:

### TCGA-BRCA Adaptive Immunotherapy (HER2+)
- Phase III, Oncology — Breast Cancer
- Enrollment: 200 | Feasibility: 94%
- Requires: `gene_BRCA1 = 1`, age 30–75, diagnosis = Infiltrating duct carcinoma
- Excludes: cardiac history, insulin > 40

### GLP-2 Agonist for T2DM — AIIMS
- Phase III, Endocrinology
- Enrollment: 200 | Feasibility: 91%
- Requires: age 35–65, diagnosis = T2DM, `gene_TP53 = 0`
- Excludes: HbA1c > 12, cardiac history

### ER+ Hormone Receptor Targeted Therapy
- Phase III, Oncology — Breast Cancer
- Enrollment: 400 | Feasibility: 89%
- Requires: `gene_BRCA1 = 1`, age 40–80, diagnosis = Lobular carcinoma
- Excludes: cardiac history

---

## 10. Changelog

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | 2026-05-12 | Initial platform — DSL compiler, AI predictor, quantum optimizer |
| 2.0.0 | 2026-06-05 | Full backend integration, TCGA data loader, SQLite persistence, frontend overhaul |
| 2.1.0 | 2026-06-06 | Removed IoT Simulator; added Genome Data Integration (manual form + bulk JSON upload) |

---

## 11. Active Localhost Links

| Service | URL |
|---|---|
| Frontend App | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

---

*Document maintained by The Collapse Architects. Last updated: 2026-06-06*
