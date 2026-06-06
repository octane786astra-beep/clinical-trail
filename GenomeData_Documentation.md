# v2.1.0 Release Notes: Genome Data Integration

## Overview
This update introduces the **Genome Data Integration** feature, replacing the legacy IoT Trial Simulator. The platform now supports seamless ingestion of patient genomic data and baseline biomarkers to improve AI-driven trial cohort matching and predictive stratification.

## New Features
- **Genome Data View (`GenomeDataView.tsx`)**:
  - **Manual Registration**: Clinical researchers can input individual patient demographic profiles and vital genetic biomarkers, specifically `BRCA1` and `TP53` mutations.
  - **Bulk JSON Upload**: Accelerate patient seeding by dragging and dropping `.json` arrays of patient profiles, fully validated and piped directly into the core platform database.
- **Bulk Patients API (`POST /patients/bulk`)**: Securely ingests and validates arrays of `PatientProfile` models into the backend SQLite/PostgreSQL store.

## Deprecated & Removed
- Removed the **IoT Telemetry Simulator** (`SimulatorView.tsx`).
- Deprecated legacy `POST /iot/reading` and `GET /iot/history` endpoints.
- Removed IoT Bridge metrics from the global navigation header.

## System Impact
These changes centralize the patient pipeline around real clinical trial metadata (genomics and diagnoses) rather than simulated IoT telemetry, bringing the system closer to production requirements for clinical environments.
