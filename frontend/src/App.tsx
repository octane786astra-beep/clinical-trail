import { useState, useEffect } from "react";
import { ViewType, TrialReport, CompilerLog, ActiveConstraint, OptimizationCore } from "./types";
import DnaBackground from "./components/DnaBackground";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import EditorView from "./components/EditorView";
import OptimizeView from "./components/OptimizeView";
import ReportsView from "./components/ReportsView";

export default function App() {
  // Navigation states
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);

  // Active templates state database
  const [templates, setTemplates] = useState<TrialReport[]>([
    {
      id: "oncology-phase-ii",
      title: "Oncology Phase II Adaptive Trial",
      protocolKey: "ONCO-ADAP-P2-X78",
      phase: "Phase II",
      therapeuticArea: "Oncology",
      targetEnrollment: 120,
      optimizedFeasibility: 94,
      expectedCostSaving: "$2.4M Saved",
      status: "Approved",
      createdAt: "2026-05-12",
      author: "Dr. Alex L.",
    },
    {
      id: "cardio-genetic",
      title: "Cardiovascular Genetic Stratification",
      protocolKey: "CARD-GEN-S99-R41",
      phase: "Phase III",
      therapeuticArea: "Cardiology",
      targetEnrollment: 450,
      optimizedFeasibility: 91,
      expectedCostSaving: "$5.1M Saved",
      status: "Audited",
      createdAt: "2026-05-28",
      author: "Dr. Alex L.",
    },
    {
      id: "neuro-stratification",
      title: "Neurodegenerative Cohort Optimizer",
      protocolKey: "NEUR-STR-O42-M12",
      phase: "Phase I-II",
      therapeuticArea: "Neurology",
      targetEnrollment: 85,
      optimizedFeasibility: 89,
      expectedCostSaving: "$1.2M Saved",
      status: "Draft",
      createdAt: "2026-06-03",
      author: "Dr. Alex L.",
    },
  ]);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("oncology-phase-ii");

  // DSL template codes matching each ID
  const dslTemplates: Record<string, string> = {
    "oncology-phase-ii": `trial Phase2OncologyAdaptive {
  target_enrollment = 120;
  therapeutic_area = "Oncology";
  phases = [Phase2_Adaptive];

  # Precision bio-marker alignment
  biomarkers = ["EGFR-mutated", "KRAS-wildtype"];

  location_sites = [
    "Mayo Clinic,MN", 
    "MD Anderson,TX", 
    "Dana-Farber,MA"
  ];

  # Performance and safety solvers
  quantum_annealing = active;
  minimize_feasibility_risk = high;
  recruitment_velocity_target = max;
}`,
    "cardio-genetic": `trial Phase3CardioGenetic {
  target_enrollment = 450;
  therapeutic_area = "Cardiology";
  phases = [Phase3_Randomized];

  biomarkers = ["ACE2-expressed", "KCNQ1-variant"];

  location_sites = [
    "MD Anderson,TX",
    "Stanford Systems,CA",
    "Mayo Clinic,MN"
  ];

  quantum_annealing = active;
  minimize_feasibility_risk = normal;
  recruitment_velocity_target = balanced;
}`,
    "neuro-stratification": `trial Phase1NeuroStratified {
  target_enrollment = 85;
  therapeutic_area = "Neurology";
  phases = [Phase1_DoseEscalation];

  biomarkers = ["APOE4-carrier", "Amyloid-Beta-positive"];

  location_sites = [
    "Stanford Systems,CA", 
    "Mayo Clinic,MN", 
    "Dana-Farber,MA"
  ];

  quantum_annealing = active;
  minimize_feasibility_risk = extreme;
  recruitment_velocity_target = quick;
}`,
  };

  // State mapping active DSL codes
  const [dslCode, setDslCode] = useState<string>(dslTemplates["oncology-phase-ii"]);

  // Set code when template changes
  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    setDslCode(dslTemplates[id]);
    // Clear out old states or reset logs slightly to indicate context shift
    setCompilerLogs([]);
    setIsCompiledSuccessfully(false);
    // Reset optimizer ring progress
    setOptimizationSteps((prev) =>
      prev.map((step) => ({
        ...step,
        progress: 0,
        status: "idle",
        eta: "N/A",
      }))
    );
  };

  // Live Metric multipliers modifying values dynamically based on compile state
  const [isCompiledSuccessfully, setIsCompiledSuccessfully] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilerLogs, setCompilerLogs] = useState<CompilerLog[]>([]);

  // Constraints representation
  const [constraints, setConstraints] = useState<ActiveConstraint[]>([
    { id: "reg-compliance", name: "FDA Regulatory Lock", status: "satisfied", category: "Regulatory", score: 95 },
    { id: "op-feasibility", name: "Operational Site Load", status: "active", category: "Feasibility", score: 70 },
    { id: "cohort-exclusion", name: "Dropout Risk Protection", status: "active", category: "Feasibility", score: 64 },
    { id: "budgetary-alloc", name: "Budget Cap Allocation Limit", status: "satisfied", category: "Budgetary", score: 90 },
  ]);

  // Optimization steps representing rings and concentric solver logs
  const [optimizationSteps, setOptimizationSteps] = useState<OptimizationCore[]>([
    {
      id: "cohort-stratification",
      name: "Cohort Stratification Finder",
      progress: 0,
      status: "idle",
      eta: "N/A",
      details: "Simulating patient genetic subsets via high-affinity matrix grouping protocols.",
      metrics: [
        { label: "Patient Match Count", value: "0 Candidates" },
        { label: "Cohort Heterogeneity", value: "N/A" },
      ],
    },
    {
      id: "site-selection",
      name: "Site Location Optimizer",
      progress: 0,
      status: "idle",
      eta: "N/A",
      details: "Configuring multi-hospital coordinates with localized genetic biomarker pools.",
      metrics: [
        { label: "Target Site Count", value: "0 Sites Selected" },
        { label: "Average Site Score", value: "0.0" },
      ],
    },
    {
      id: "trial-simulation",
      name: "Trial Performance Predictor",
      progress: 0,
      status: "idle",
      eta: "N/A",
      details: "Predicting dropout indices and amendment frequencies before site activation.",
      metrics: [
        { label: "Expected Dropout Risk", value: "N/A" },
        { label: "Amendment Protection", value: "0%" },
      ],
    },
  ]);

  const [isOptimizing, setIsOptimizing] = useState(false);

  // Trigger dynamic step-by-step compiler logging
  const handleCompile = () => {
    if (isCompiling) return;
    setIsCompiling(true);
    setIsCompiledSuccessfully(false);
    setCompilerLogs([]);

    const logSteps = [
      { msg: "» INITIALIZING COPERNICUS PARSER PARALLEL SYSTEM...", type: "system" as const },
      { msg: "» PARSING PROTOCOL MANIFEST INPUT STREAM...", type: "info" as const },
      { msg: "» LEXER GENERATING TOKENS FOR: " + selectedTemplateId, type: "info" as const },
      { msg: "» TOKEN VALIDATION PASS: 37 key tokens parsed cleanly.", type: "success" as const },
      { msg: "» COMPRESSING AST OBJECT NODES (Abstract Syntax Tree)...", type: "info" as const },
      { msg: "» SEMANTIC AUDIT: Checking eligibility restrictions vs FDA Title-21 CFR regulations...", type: "info" as const },
      { msg: "» CHECK: Biomarkers exclusion rules found. Genetic cohort matching triggered.", type: "success" as const },
      { msg: "» WARNING: Low-frequency exclusion parameter detected. Expanding recruitment search depth.", type: "warning" as const },
      { msg: "» OPTIMIZING TARGET SITE COORDINATES... Mayo Clinic, MD Anderson, Stanford, Boston.", type: "info" as const },
      { msg: "» GENERATING OPTIMAL QUANTUM COMPILERS FOR ADAPTIVE TRIAL DESIGN...", type: "info" as const },
      { msg: "» COMPILATION SECURE. AST SIGNATURE: Hash/md5-256x9011a8b.", type: "system" as const },
      { msg: "» SUCCESS: COPERNICUS DSL BUILT SUCCESSFULLY. PROTOCOL UNLOCKED ON HARDWARE CLUSTERS.", type: "success" as const },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < logSteps.length) {
        const item = logSteps[currentStep];
        setCompilerLogs((prev) => [
          ...prev,
          {
            id: String(Math.random()),
            timestamp: new Date().toLocaleTimeString(),
            type: item.type,
            message: item.msg,
          },
        ]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsCompiling(false);
        setIsCompiledSuccessfully(true);

        // Mutate constraints scores to reflect compiled optimizations!
        setConstraints((prev) =>
          prev.map((c) => ({
            ...c,
            status: "satisfied",
            score: c.id === "cohort-exclusion" ? 95 : c.id === "op-feasibility" ? 98 : c.score + 5,
          }))
        );

        // Auto move to visual optimizer step
        setCurrentView(ViewType.OPTIMIZE);
        // Automatically start the optimization solver
        triggerQuantumSimulation();
      }
    }, 450);
  };

  // Concentric Optimization Rings mathematical simulation
  const triggerQuantumSimulation = () => {
    if (isOptimizing) return;
    setIsOptimizing(true);

    // Initial reset
    setOptimizationSteps((prev) =>
      prev.map((step) => ({
        ...step,
        progress: 0,
        status: "running",
        eta: "Calculating...",
      }))
    );

    // Simulated progress tick loops for each step sequentially
    let activeStepIdx = 0;
    const totalSteps = 3;

    const timer = setInterval(() => {
      setOptimizationSteps((prev) => {
        const next = [...prev];
        const step = { ...next[activeStepIdx] };

        if (step.progress < 100) {
          step.progress += 20;
          if (step.progress >= 100) {
            step.progress = 100;
            step.status = "completed";
            step.eta = "Done";

            // Inject optimized metrics inside steps!
            if (step.id === "cohort-stratification") {
              step.metrics = [
                { label: "Patient Match Count", value: "2,480 Candidates" },
                { label: "Cohort Heterogeneity", value: "0.08 S.D. (Optimal)" },
              ];
            } else if (step.id === "site-selection") {
              step.metrics = [
                { label: "Target Site Count", value: "4 Medical Hubs" },
                { label: "Average Site Score", value: "97.6 / 100" },
              ];
            } else if (step.id === "trial-simulation") {
              step.metrics = [
                { label: "Expected Dropout Risk", value: "4.8% (Minimum)" },
                { label: "Amendment Protection", value: "98% Reduction" },
              ];
            }

            activeStepIdx++;
          } else {
            step.status = "running";
            step.eta = `${Math.ceil((100 - step.progress) / 20 * 0.5)}s`;
          }
          next[activeStepIdx] = step;
        }

        if (activeStepIdx >= totalSteps) {
          clearInterval(timer);
          setIsOptimizing(false);
          // Transition template values to their fully optimized states in metadata list!
          setTemplates((prev) =>
            prev.map((repr) => {
              if (repr.id === selectedTemplateId) {
                return {
                  ...repr,
                  optimizedFeasibility: 98,
                  expectedCostSaving: "$4.8M Saved",
                  status: "Approved",
                };
              }
              return repr;
            })
          );
        }

        return next;
      });
    }, 300);
  };

  // Reset simulator action
  const handleResetSimulator = () => {
    setIsCompiledSuccessfully(false);
    setIsCompiling(false);
    setIsOptimizing(false);
    setCompilerLogs([]);
    
    // Restore default baseline stats
    setConstraints([
      { id: "reg-compliance", name: "FDA Regulatory Lock", status: "satisfied", category: "Regulatory", score: 95 },
      { id: "op-feasibility", name: "Operational Site Load", status: "active", category: "Feasibility", score: 70 },
      { id: "cohort-exclusion", name: "Dropout Risk Protection", status: "active", category: "Feasibility", score: 64 },
      { id: "budgetary-alloc", name: "Budget Cap Allocation Limit", status: "satisfied", category: "Budgetary", score: 90 },
    ]);

    setOptimizationSteps((prev) =>
      prev.map((step) => ({
        ...step,
        progress: 0,
        status: "idle",
        eta: "N/A",
        metrics: [
          { label: "Status Metric", value: "N/A" },
          { label: "Efficiency", value: "0%" },
        ],
      }))
    );
  };

  // Interactive Actual PDF/Technical Protocol Downloader using Blob Object
  const handleDownloadReport = (report: TrialReport) => {
    const reportText = `========================================================================
CLINICAL TRIAL DECISION MATRIX - COPERNICUS PROTOCOL REPORT
========================================================================
Document Unique Key : SHA-256/${report.protocolKey}
Archived Stamp      : ${report.createdAt}
Audit Status        : ${report.status}
Lead Investigator   : ${report.author}

------------------------------------------------------------------------
PROTOCOL ARCHITECTURAL SPECIFICATION & CLINICAL PARAMS
------------------------------------------------------------------------
Trial Registry Name : ${report.title}
Therapeutic Sector  : ${report.therapeuticArea}
Required Phase      : ${report.phase}
Subject Cohort Cap  : ${report.targetEnrollment} Patients
Expected Feasibility: ${report.optimizedFeasibility}%
Estimated CapEx Saved: ${report.expectedCostSaving}

------------------------------------------------------------------------
OPTIMIZED QUANTUM PATIENT CRITERIA (COPERNICUS-DSL)
------------------------------------------------------------------------
- Genetic Biomarkers Matched: Expression-mutant alignments enabled.
- Mapped Target Multi-Site Hubs:
  * Minnesota Mayo Clinic Healthcare Facility
  * Houston MD Anderson Strategic Medical Vault
  * Palo Alto Stanford Hospital Clusters
  * Boston Dana-Farber Oncology Research Clinics

------------------------------------------------------------------------
Institutional Compliance Lock (FDA 21 CFR Part 11 Audit File)
------------------------------------------------------------------------
The digital hash verified below certifies that the abstract rules lexed 
under the Copernicus-DSL compiler conform strictly to institutional review board
feasibility criteria, HIPAA metadata isolation, and automated patient safety caps.

REPRESENTATIVE DIGITAL CODE: [MD5-COPERNICUS-SOU-Z982181]
========================================================================
`;

    // Package to download file
    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.id}-safety-audit-report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get active template attributes to feed metric cards
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const dynamicMetrics = {
    runtime: isCompiledSuccessfully ? "420 Microseconds" : "Calculating...",
    feasibilityScore: isCompiledSuccessfully ? selectedTemplate.optimizedFeasibility : 64,
    costReduction: isCompiledSuccessfully ? selectedTemplate.expectedCostSaving : "$0.0",
    recruitmentEfficiency: isCompiledSuccessfully ? 97 : 58,
    cohortQuality: isCompiledSuccessfully ? 91 : 48,
    amendmentReduction: isCompiledSuccessfully ? 90 : 0,
  };

  return (
    <div className="relative min-h-screen text-slate-100 font-sans flex overflow-hidden selection:bg-cyan-500/30 selection:text-white">
      {/* 3D Animated Projection DNA background helix */}
      <DnaBackground />

      {/* Persistent global layout container */}
      <div className="flex w-full h-screen overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />

        {/* Primary right side main body area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
          {/* Header Panel */}
          <Header
            compilerStatus={isCompiling ? "compiling" : isCompiledSuccessfully ? "success" : "idle"}
            simulationActive={isOptimizing}
            onReset={handleResetSimulator}
            systemMetrics={dynamicMetrics}
          />

          {/* Scrollable screen view port router */}
          <main className="flex-1 overflow-y-auto px-8 py-8">
            {currentView === ViewType.DASHBOARD && (
              <DashboardView
                metrics={dynamicMetrics}
                templates={templates}
                selectedTemplate={selectedTemplateId}
                onSelectTemplate={handleSelectTemplate}
                onNavigateToOptimize={() => setCurrentView(ViewType.EDITOR)}
              />
            )}

            {currentView === ViewType.EDITOR && (
              <EditorView
                dslCode={dslCode}
                onDslCodeChange={setDslCode}
                compilerLogs={compilerLogs}
                onCompile={handleCompile}
                isCompiling={isCompiling}
                constraints={constraints}
                onUpdateConstraintScore={() => {}}
              />
            )}

            {currentView === ViewType.OPTIMIZE && (
              <OptimizeView
                optimizationSteps={optimizationSteps}
                onTriggerOptimization={triggerQuantumSimulation}
                isOptimizing={isOptimizing}
                selectedTemplateTitle={selectedTemplate.title}
              />
            )}

            {currentView === ViewType.REPORTS && (
              <ReportsView
                reports={templates}
                onTriggerDownload={handleDownloadReport}
                selectedTemplateId={selectedTemplateId}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
