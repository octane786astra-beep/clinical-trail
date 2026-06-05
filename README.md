<p align="center">
  <img src="https://img.shields.io/badge/HACK4SOC-3.0-emerald?style=for-the-badge&labelColor=0f172a" alt="HACK4SOC 3.0"/>
  <img src="https://img.shields.io/badge/Status-Fully%20Integrated-00c853?style=for-the-badge&labelColor=0f172a" alt="Status"/>
  <img src="https://img.shields.io/badge/Quantum-Qiskit%202.4-6366f1?style=for-the-badge&labelColor=0f172a" alt="Qiskit"/>
  <img src="https://img.shields.io/badge/AI-Cox%20PH%20Model-f59e0b?style=for-the-badge&labelColor=0f172a" alt="AI"/>
</p>

# 🧬 AI Clinical Trial Optimization Platform

> **Team:** The Collapse Architects — **HACK4SOC 3.0**

An AI-powered, quantum-enhanced clinical trial optimization platform that compiles trial protocols through a custom DSL, optimizes patient cohort selection using Qiskit quantum circuits, and predicts treatment response with a Cox Proportional Hazards survival model — all backed by real **TCGA-BRCA** clinical data from The Cancer Genome Atlas.

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [What It Does](#-what-it-does)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Core Features](#-core-features)
- [Application Walkthrough](#-application-walkthrough)
- [API Endpoints](#-api-endpoints)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)
- [Team](#-team)

---

## ❓ Problem Statement

Clinical trials today suffer from:
- **80% failure rates** in patient recruitment timelines
- **Manual, error-prone** protocol design and compliance checking
- **Suboptimal cohort selection** leading to underpowered studies
- **No real-time monitoring** of patient vitals during trial execution

This platform addresses all four by combining AI prediction, quantum optimization, a domain-specific language compiler, and IoT biosensor integration into a single, unified system.

---

## 🎯 What It Does

| Capability | How |
|---|---|
| **Protocol Design** | Write trial protocols in a custom DSL with built-in FDA compliance checking (ICH E6, 21 CFR Part 312) |
| **Quantum Cohort Optimization** | QUBO formulation executed on Qiskit Aer simulator — selects the mathematically optimal patient cohort under budget and eligibility constraints |
| **AI Treatment Prediction** | Cox Proportional Hazards model (Concordance Index: 0.8009) predicts 12-month response probability per patient |
| **Trial Matching** | Automatically matches patients to eligible trials based on age, diagnosis, biomarkers, and exclusion criteria |
| **Real-Time IoT Monitoring** | Designed for ESP32 + MAX30102 wearable sensors — heart rate, SpO2, risk scoring |
| **Real Clinical Data** | 200 breast cancer patients from TCGA-BRCA (The Cancer Genome Atlas) loaded into the database |

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                  │
│                     http://localhost:5173                     │
│                                                              │
│  ┌─────────┐ ┌────────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Landing │ │ Dashboard  │ │ Protocol │ │   Optimize    │  │
│  │  View   │ │   View     │ │  Editor  │ │     View      │  │
│  └─────────┘ └────────────┘ └──────────┘ └───────────────┘  │
│       │            │              │              │            │
│       └────────────┴──────┬───────┴──────────────┘            │
│                           │                                   │
│                     api.ts (HTTP Client)                      │
└───────────────────────────┬──────────────────────────────────┘
                            │ REST API (JSON)
                            │ CORS enabled
┌───────────────────────────┴──────────────────────────────────┐
│                  BACKEND (FastAPI + Uvicorn)                  │
│                  http://localhost:8000                        │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐    │
│  │   DSL    │ │ Quantum  │ │   AI     │ │    Trial     │    │
│  │ Compiler │ │Optimizer │ │Predictor │ │   Matcher    │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘    │
│       │            │              │              │            │
│       └────────────┴──────┬───────┴──────────────┘            │
│                           │                                   │
│                  SQLite Database (clinical.db)                │
│                  200 TCGA-BRCA patients + 8 trials            │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + TypeScript | UI framework with type safety |
| Vite 6 | Lightning-fast build tool & dev server |
| Framer Motion | Smooth animations & micro-interactions |
| Three.js / React Three Fiber | 3D animated DNA helix background |
| Recharts | Charts, sparklines, and data visualizations |
| GSAP ScrollTrigger | Netflix-style scroll transitions |
| Tailwind CSS | Utility-first styling |
| Lucide React | Iconography |

### Backend
| Technology | Purpose |
|---|---|
| Python 3.14 + FastAPI | High-performance async REST API |
| Uvicorn | ASGI server |
| SQLAlchemy 2.0 + SQLite | ORM & zero-config database |
| Qiskit 2.4.1 + Aer 0.17.2 | Quantum circuit SDK & simulator |
| Lifelines 0.30.3 | Cox Proportional Hazards survival model |
| Pandas + NumPy + SciPy | Data processing & scientific computing |

---

## ⚡ Core Features

### 1. 📝 Custom DSL Compiler (5-Stage Pipeline)
```
TRIAL OncologyPhase2Adaptive {
  PATIENT: age IN [25,70], diagnosis = "Infiltrating duct carcinoma, NOS"
  EXCLUDE: cardiac_history = true, insulin_dose > 40
  INCLUDE: gene_BRCA1 = 1
  DURATION: months = 8
  ARMS: treatment = "Immunotherapy", placebo = "control"
  MONITOR: safety = true
  BUDGET: amount = 2400000
  SITES: count = 3
}
```
**Pipeline:** `Lexer → Parser → AST → Semantic Analysis → FDA Compliance Check`

FDA compliance rules enforced:
- **FDA-001:** Safety monitoring plan required (ICH E6 §5.1)
- **FDA-002:** At least one site required (ICH E6 §4.1)
- **FDA-003:** Budget declaration required (FDA 21 CFR Part 312)
- **FDA-004:** Trial name must not be empty (FDA 21 CFR Part 312.23)

### 2. ⚛️ Quantum Cohort Optimizer
- **QUBO formulation** — maps cohort selection to a combinatorial optimization problem
- **Qiskit QuantumCircuit** with Hadamard + Rz + CNOT gates
- Runs on **Aer simulator** (1024 shots)
- Selects mathematically optimal patient subset under budget/eligibility constraints
- Returns: selected patients, qubits used, circuit depth, gate counts

### 3. 🧠 AI Response Predictor
- **Cox Proportional Hazards** survival analysis (via `lifelines`)
- **Concordance Index: 0.8009** (validated on held-out data)
- Predicts: 12-month response probability, median response timeline, risk classification
- Input features: age, HbA1c, BMI, BRCA1/TP53 genes, CRP, insulin resistance, HRV, SpO2

### 4. 🔗 Intelligent Trial Matcher
- Matches patients to eligible clinical trials from a pool of 8 active trials
- Criteria: age range, diagnosis, cardiac exclusion, HbA1c range, biomarkers
- Returns match scores with detailed eligibility reasons

### 5. 📡 IoT Biosensor Pipeline
- Real-time vitals processing (heart rate, SpO2)
- Risk scoring: LOW / MEDIUM / HIGH
- Designed for **ESP32 + MAX30102** wearable hardware

---

## 🖥 Application Walkthrough

### Landing Page
A full-screen hero section with an animated 3D DNA helix background. Scrolling down naturally transitions into the main workspace (Netflix-style continuous scroll).

### Dashboard
- **6 KPI cards** with weekly trend sparklines (cost saving, recruitment efficiency, cohort quality, duration reduction, feasibility, amendments)
- **30-day feasibility trend** area chart
- **Baseline vs Optimized** comparison bar chart
- **Recruitment funnel** pie chart
- Live **API connection status** banner
- **CSV export** for all metrics

### Protocol Editor
- Syntax-highlighted DSL editor with line numbers
- 3 pre-built templates (Oncology, Cardiology, Neurology)
- One-click keyword injection
- Real-time compilation with stage-by-stage logs

### Quantum Optimizer
- 4-step visual pipeline with animated progress
- Real-time metrics: qubits, shots, circuit depth
- Calls the actual Qiskit quantum backend

### Reports
- Protocol report cards with status badges
- Downloadable reports with SHA-256 hashes and FDA compliance details

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | System health check — DB status, patient/trial counts |
| `GET` | `/dashboard/metrics` | Live KPI metrics from database |
| `POST` | `/compile` | Compile DSL protocol through 5-stage pipeline |
| `POST` | `/optimize-cohort` | Run quantum cohort optimization |
| `POST` | `/predict-response` | AI treatment response prediction |
| `POST` | `/match-trials` | Match patient to eligible trials |
| `GET` | `/tcga/load` | Load TCGA-BRCA dataset into database |
| `GET` | `/tcga/stats` | TCGA dataset statistics |

**Interactive API Docs:** `http://localhost:8000/docs` (Swagger UI)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.10+ with pip
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/octane786astra-beep/clinical-trail.git
cd clinical-trail
```

### 2. Start the Backend
```bash
cd backend/clinical_platform

# Install Python dependencies
pip install -r requirements.txt

# Run the platform (tests all subsystems, seeds DB, starts server)
# On Windows:
powershell ./run.ps1

# On Linux/Mac:
bash run.sh
```
The backend starts at `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

### 3. Start the Frontend
```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```
The frontend starts at `http://localhost:5173`.

### 4. Load TCGA Data (Optional)
Once both servers are running, load real TCGA-BRCA clinical data:
```bash
curl http://localhost:8000/tcga/load
```
This populates the database with 200 breast cancer patient records from The Cancer Genome Atlas.

---

## 📁 Project Structure

```
clinical-trail/
├── frontend/                     # React + Vite + TypeScript
│   ├── src/
│   │   ├── api.ts                # Backend HTTP client
│   │   ├── App.tsx               # Main app with Netflix-style scroll
│   │   └── components/
│   │       ├── LandingView.tsx   # Hero section
│   │       ├── DashboardView.tsx # KPI dashboard (live backend data)
│   │       ├── EditorView.tsx    # DSL protocol editor
│   │       ├── OptimizeView.tsx  # Quantum optimizer UI
│   │       ├── ReportsView.tsx   # Report generation
│   │       ├── Header.tsx        # Status indicators
│   │       ├── Sidebar.tsx       # Navigation
│   │       └── DnaBackground.tsx # 3D Three.js helix
│   └── package.json
│
├── backend/
│   └── clinical_platform/
│       ├── api/main.py           # FastAPI routes & CORS
│       ├── compiler/dsl_compiler.py  # 5-stage DSL compiler
│       ├── quantum/cohort_optimizer.py # Qiskit QUBO optimizer
│       ├── ai/response_predictor.py   # Cox PH survival model
│       ├── matching/trial_matcher.py  # Patient-trial matcher
│       ├── data/tcga_loader.py   # TCGA-BRCA data loader
│       ├── database/
│       │   ├── models.py         # SQLAlchemy ORM models
│       │   ├── connection.py     # DB engine & seed data
│       │   └── crud.py           # CRUD operations
│       ├── requirements.txt
│       ├── run.ps1               # Windows startup script
│       └── run.sh                # Linux/Mac startup script
│
├── md referencefiles/            # Reference datasets
│   ├── Clinical_Trial_Platform_AI_Context.json
│   └── clinical.project-tcga-brca.2026-06-05.json
│
├── PROJECT_DOCUMENTATION.md      # Full technical documentation
├── .gitignore
└── README.md                     # ← You are here
```

---

## 📖 Documentation

For the complete technical deep-dive — including database schema, file-by-file changelog, integration details, verification results, and all AI prompts used during development — see:

📄 **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)**

---

## 👥 Team

**The Collapse Architects** — HACK4SOC 3.0

---

<p align="center">
  <sub>Built with ❤️ using React, FastAPI, Qiskit, and real TCGA clinical data</sub>
</p>
