import { useState } from "react";
import { ViewType, TrialReport, CompilerLog, ActiveConstraint, OptimizationCore } from "./types";
import DnaBackground from "./components/DnaBackground";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import EditorView from "./components/EditorView";
import OptimizeView from "./components/OptimizeView";
import ReportsView from "./components/ReportsView";
import LandingView from "./components/LandingView";

export default function App() {
  // Navigation states (now defaulting to DASHBOARD since landing is always rendered on top)
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
    "oncology-phase-ii": `trial Phase2OncologyAdaptive {\n  target_enrollment = 120;\n  therapeutic_area = "Oncology";\n  phases = [Phase2_Adaptive];\n\n  # Precision bio-marker alignment\n  biomarkers = ["EGFR-mutated", "KRAS-wildtype"];\n\n  location_sites = [\n    "Mayo Clinic,MN", \n    "MD Anderson,TX", \n    "Dana-Farber,MA"\n  ];\n\n  # Performance and safety solvers\n  quantum_annealing = active;\n  minimize_feasibility_risk = high;\n  recruitment_velocity_target = max;\n}`,
    "cardio-genetic": `trial Phase3CardioGenetic {\n  target_enrollment = 450;\n  therapeutic_area = "Cardiology";\n  phases = [Phase3_Randomized];\n\n  biomarkers = ["ACE2-expressed", "KCNQ1-variant"];\n\n  location_sites = [\n    "MD Anderson,TX",\n    "Stanford Systems,CA",\n    "Mayo Clinic,MN"\n  ];\n\n  quantum_annealing = active;\n  minimize_feasibility_risk = normal;\n  recruitment_velocity_target = balanced;\n}`,
    "neuro-stratification": `trial Phase1NeuroStratified {\n  target_enrollment = 85;\n  therapeutic_area = "Neurology";\n  phases = [Phase1_DoseEscalation];\n\n  biomarkers = ["APOE4-carrier", "Amyloid-Beta-positive"];\n\n  location_sites = [\n    "Stanford Systems,CA", \n    "Mayo Clinic,MN", \n    "Dana-Farber,MA"\n  ];\n\n  quantum_annealing = active;\n  minimize_feasibility_risk = extreme;\n  recruitment_velocity_target = quick;\n}`,
  };

  const [dslCode, setDslCode] = useState<string>(dslTemplates["oncology-phase-ii"]);

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    setDslCode(dslTemplates[id]);
    setCompilerLogs([]);
    setIsCompiledSuccessfully(false);
    setOptimizationSteps((prev) =>
      prev.map((step) => ({
        ...step,
        progress: 0,
        status: "idle",
        eta: "N/A",
      }))
    );
  };

  const [isCompiledSuccessfully, setIsCompiledSuccessfully] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilerLogs, setCompilerLogs] = useState<CompilerLog[]>([]);

  const [constraints, setConstraints] = useState<ActiveConstraint[]>([
    { id: "reg-compliance", name: "FDA Regulatory Lock", status: "satisfied", category: "Regulatory", score: 95 },
    { id: "op-feasibility", name: "Operational Site Load", status: "active", category: "Feasibility", score: 70 },
    { id: "cohort-exclusion", name: "Dropout Risk Protection", status: "active", category: "Feasibility", score: 64 },
    { id: "budgetary-alloc", name: "Budget Cap Allocation Limit", status: "satisfied", category: "Budgetary", score: 90 },
  ]);

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
      { msg: "» SEMANTIC AUDIT: Checking eligibility vs FDA Title-21 CFR...", type: "info" as const },
      { msg: "» CHECK: Biomarkers exclusion rules found. Genetic cohort matching triggered.", type: "success" as const },
      { msg: "» WARNING: Low-frequency exclusion parameter detected. Expanding search depth.", type: "warning" as const },
      { msg: "» OPTIMIZING TARGET SITE COORDINATES... Mayo Clinic, MD Anderson...", type: "info" as const },
      { msg: "» GENERATING OPTIMAL QUANTUM COMPILERS FOR ADAPTIVE TRIAL DESIGN...", type: "info" as const },
      { msg: "» COMPILATION SECURE. AST SIGNATURE: Hash/md5-256x9011a8b.", type: "system" as const },
      { msg: "» SUCCESS: COPERNICUS DSL BUILT SUCCESSFULLY.", type: "success" as const },
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

        setConstraints((prev) =>
          prev.map((c) => ({
            ...c,
            status: "satisfied",
            score: c.id === "cohort-exclusion" ? 95 : c.id === "op-feasibility" ? 98 : c.score + 5,
          }))
        );

        setCurrentView(ViewType.OPTIMIZE);
        triggerQuantumSimulation();
      }
    }, 450);
  };

  const triggerQuantumSimulation = () => {
    if (isOptimizing) return;
    setIsOptimizing(true);

    setOptimizationSteps((prev) =>
      prev.map((step) => ({
        ...step,
        progress: 0,
        status: "running",
        eta: "Calculating...",
      }))
    );

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

  const handleResetSimulator = () => {
    setIsCompiledSuccessfully(false);
    setIsCompiling(false);
    setIsOptimizing(false);
    setCompilerLogs([]);
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

  const handleDownloadReport = (report: TrialReport) => {
    const reportText = `========================================================================\nCLINICAL TRIAL DECISION MATRIX - COPERNICUS PROTOCOL REPORT\n========================================================================\nDocument Unique Key : SHA-256/${report.protocolKey}\nArchived Stamp      : ${report.createdAt}\nAudit Status        : ${report.status}\nLead Investigator   : ${report.author}\n\n------------------------------------------------------------------------\nPROTOCOL ARCHITECTURAL SPECIFICATION & CLINICAL PARAMS\n------------------------------------------------------------------------\nTrial Registry Name : ${report.title}\nTherapeutic Sector  : ${report.therapeuticArea}\nRequired Phase      : ${report.phase}\nSubject Cohort Cap  : ${report.targetEnrollment} Patients\nExpected Feasibility: ${report.optimizedFeasibility}%\nEstimated CapEx Saved: ${report.expectedCostSaving}\n\n------------------------------------------------------------------------\nOPTIMIZED QUANTUM PATIENT CRITERIA (COPERNICUS-DSL)\n------------------------------------------------------------------------\n- Genetic Biomarkers Matched: Expression-mutant alignments enabled.\n- Mapped Target Multi-Site Hubs:\n  * Minnesota Mayo Clinic Healthcare Facility\n  * Houston MD Anderson Strategic Medical Vault\n  * Palo Alto Stanford Hospital Clusters\n  * Boston Dana-Farber Oncology Research Clinics\n\n------------------------------------------------------------------------\nInstitutional Compliance Lock (FDA 21 CFR Part 11 Audit File)\n------------------------------------------------------------------------\nThe digital hash verified below certifies that the abstract rules lexed \nunder the Copernicus-DSL compiler conform strictly to institutional review board\nfeasibility criteria, HIPAA metadata isolation, and automated patient safety caps.\n\nREPRESENTATIVE DIGITAL CODE: [MD5-COPERNICUS-SOU-Z982181]\n========================================================================\n`;
    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.id}-safety-audit-report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedTemplateAttr = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const dynamicMetrics = {
    runtime: isCompiledSuccessfully ? "420 Microseconds" : "Calculating...",
    feasibilityScore: isCompiledSuccessfully ? selectedTemplateAttr.optimizedFeasibility : 64,
    costReduction: isCompiledSuccessfully ? selectedTemplateAttr.expectedCostSaving : "$0.0",
    recruitmentEfficiency: isCompiledSuccessfully ? 97 : 58,
    cohortQuality: isCompiledSuccessfully ? 91 : 48,
    amendmentReduction: isCompiledSuccessfully ? 90 : 0,
  };

  return (
    <div className="relative min-h-screen font-sans flex flex-col bg-[#F8FAFC]">
      {/* Interactive 3D DNA Background */}
      <DnaBackground />

      {/* Hero / Landing Section */}
      <div id="landing-section" className="w-full relative z-10">
        <LandingView onEnterApp={() => document.getElementById('app-workspace')?.scrollIntoView({ behavior: 'smooth' })} />
      </div>

      {/* Main App Workspace */}
      <div id="app-workspace" className="flex w-full min-h-screen relative z-10 bg-[#F8FAFC] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="sticky top-0 h-screen shrink-0 z-30">
          <Sidebar currentView={currentView} onViewChange={setCurrentView} onLogoClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
        </div>

        <div className="flex-1 flex flex-col min-h-screen relative z-20">
          <div className="sticky top-0 z-20 bg-[#F8FAFC]/90 backdrop-blur-md">
            <Header
              compilerStatus={isCompiling ? "compiling" : isCompiledSuccessfully ? "success" : "idle"}
              simulationActive={isOptimizing}
              onReset={handleResetSimulator}
              systemMetrics={dynamicMetrics}
            />
          </div>

          <main className="flex-1 px-8 py-8 bg-[#F8FAFC]">
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
                  selectedTemplateTitle={selectedTemplateAttr.title}
                />
              )}

              {currentView === ViewType.REPORTS && (
                <ReportsView
                  reports={templates}
                  onTriggerDownload={handleDownloadReport}
                  selectedTemplateId={selectedTemplateId}
                />
              )}

              {/* Placeholders for new menu items */}
              {[ViewType.COHORT, ViewType.SIMULATOR, ViewType.AUDIT, ViewType.DOCUMENTS, ViewType.SETTINGS].includes(currentView) && (
                <div className="flex items-center justify-center h-full">
                  <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm max-w-md">
                    <h2 className="text-xl font-serif text-[#0F4C81] mb-2">{currentView.charAt(0).toUpperCase() + currentView.slice(1)} Module</h2>
                    <p className="text-sm text-slate-500">This module is part of the Enterprise Suite and is currently locked or under active development.</p>
                    <button onClick={() => setCurrentView(ViewType.DASHBOARD)} className="mt-6 text-sm text-[#2563EB] hover:underline">
                      Return to Dashboard
                    </button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
    </div>
  );
}
