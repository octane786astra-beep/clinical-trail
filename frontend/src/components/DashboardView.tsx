import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ReferenceLine } from "recharts";
import { Clock, TrendingUp, DollarSign, Users, Award, ShieldAlert, Play, ArrowRight, CheckCircle, X, Sparkles, Database, ShieldCheck, Activity, Download } from "lucide-react";
import { MetricCardData, TrialReport } from "../types";

interface DashboardViewProps {
  metrics: {
    runtime: string;
    feasibilityScore: number;
    costReduction: string;
    recruitmentEfficiency: number;
    cohortQuality: number;
    amendmentReduction: number;
  };
  templates: TrialReport[];
  selectedTemplate: string;
  onSelectTemplate: (id: string) => void;
  onNavigateToOptimize: () => void;
}

export default function DashboardView({
  metrics,
  templates,
  selectedTemplate,
  onSelectTemplate,
  onNavigateToOptimize,
}: DashboardViewProps) {
  const [activeKpiDetail, setActiveKpiDetail] = useState<string | null>(null);
  const [activeGanttRow, setActiveGanttRow] = useState<number | null>(null);

  // Generate deterministic/coherent 7-day historical trends based on card ID & selectedTemplate
  const getWeeklyTrend = (cardId: string) => {
    const isCompiled = metrics.feasibilityScore > 64;

    // Use selectedTemplate and status to generate standard deviation multipliers
    let seed = 1.0;
    if (selectedTemplate === "cardio-genetic") seed = 1.15;
    if (selectedTemplate === "neuro-stratification") seed = 0.85;

    switch (cardId) {
      case "runtime": {
        const val = isCompiled ? 420 : 1200;
        return [
          { day: "Day 1", value: Math.round(val * 3.5 * seed) },
          { day: "Day 2", value: Math.round(val * 2.8 * seed) },
          { day: "Day 3", value: Math.round(val * 2.1) },
          { day: "Day 4", value: Math.round(val * 1.7 * seed) },
          { day: "Day 5", value: Math.round(val * 1.3) },
          { day: "Day 6", value: Math.round(val * 1.1 * seed) },
          { day: "Day 7", value: val }, // Today
        ];
      }
      case "feasibility": {
        const currentScore = metrics.feasibilityScore;
        const base = isCompiled ? 72 : 55;
        return [
          { day: "Day 1", value: Math.round(base * seed) },
          { day: "Day 2", value: Math.round((base + 4) * seed) },
          { day: "Day 3", value: Math.round((base + 8) * seed) },
          { day: "Day 4", value: Math.round((base + 11) * seed) },
          { day: "Day 5", value: Math.round((base + 15) * seed) },
          { day: "Day 6", value: Math.round((base + 17) * seed) },
          { day: "Day 7", value: currentScore }, // Today
        ];
      }
      case "cost": {
        const isM = metrics.costReduction.includes("M");
        const val = parseFloat(metrics.costReduction.replace(/[^0-9.]/g, "")) || 0;
        return [
          { day: "Day 1", value: Math.max(0, val - 3.2 * seed) },
          { day: "Day 2", value: Math.max(0, val - 2.5 * seed) },
          { day: "Day 3", value: Math.max(0, val - 1.8) },
          { day: "Day 4", value: Math.max(0, val - 1.2 * seed) },
          { day: "Day 5", value: Math.max(0, val - 0.7) },
          { day: "Day 6", value: Math.max(0, val - 0.2 * seed) },
          { day: "Day 7", value: val }, // Today
        ];
      }
      case "recruitment": {
        const val = metrics.recruitmentEfficiency;
        return [
          { day: "Day 1", value: Math.round(val * 0.65 * seed) },
          { day: "Day 2", value: Math.round(val * 0.72) },
          { day: "Day 3", value: Math.round(val * 0.78 * seed) },
          { day: "Day 4", value: Math.round(val * 0.83) },
          { day: "Day 5", value: Math.round(val * 0.89 * seed) },
          { day: "Day 6", value: Math.round(val * 0.95) },
          { day: "Day 7", value: val }, // Today
        ];
      }
      case "cohort": {
        const val = metrics.cohortQuality;
        return [
          { day: "Day 1", value: Math.max(10, Math.round(val - 32 * seed)) },
          { day: "Day 2", value: Math.max(15, Math.round(val - 25)) },
          { day: "Day 3", value: Math.max(20, Math.round(val - 18 * seed)) },
          { day: "Day 4", value: Math.max(30, Math.round(val - 12)) },
          { day: "Day 5", value: Math.max(40, Math.round(val - 7 * seed)) },
          { day: "Day 6", value: Math.max(45, Math.round(val - 2)) },
          { day: "Day 7", value: val }, // Today
        ];
      }
      case "amendments": {
        const val = metrics.amendmentReduction;
        return [
          { day: "Day 1", value: Math.max(0, val - 65 * seed) },
          { day: "Day 2", value: Math.max(0, val - 50) },
          { day: "Day 3", value: Math.max(0, val - 35 * seed) },
          { day: "Day 4", value: Math.max(0, val - 20) },
          { day: "Day 5", value: Math.max(0, val - 10 * seed) },
          { day: "Day 6", value: Math.max(0, val - 3) },
          { day: "Day 7", value: val }, // Today
        ];
      }
      default:
        return [
          { day: "Day 1", value: 50 },
          { day: "Day 2", value: 55 },
          { day: "Day 3", value: 60 },
          { day: "Day 4", value: 64 },
          { day: "Day 5", value: 68 },
          { day: "Day 6", value: 72 },
          { day: "Day 7", value: 75 },
        ];
    }
  };

  // Generate deterministic 30-day trend for feasibility score based on current metrics and selectedTemplate
  const getThirtyDayFeasibilityTrend = () => {
    const currentScore = metrics.feasibilityScore;
    const isCompiled = currentScore > 64;

    // Base starts off lower and progressively climbs up to the currentScore on Day 30
    let seed = 1.0;
    if (selectedTemplate === "cardio-genetic") seed = 1.1;
    if (selectedTemplate === "neuro-stratification") seed = 0.9;

    const baseStart = isCompiled ? Math.round(55 * seed) : Math.round(40 * seed);
    const trendData = [];

    // Interpolate with some nice organic simulation wobble/variance
    for (let i = 1; i <= 30; i++) {
      if (i === 30) {
        trendData.push({
          day: "Day 30",
          score: currentScore,
        });
      } else {
        const progressFraction = (i - 1) / 29; // 0 to ~1
        const idealPath = baseStart + (currentScore - baseStart) * progressFraction;
        // Add a small sine wave / noise wobble to look realistic
        const wobble = Math.sin(i * 0.8) * 2.5 + (i % 3 === 0 ? 1 : -1.5);
        const score = Math.min(100, Math.max(10, Math.round(idealPath + wobble)));
        trendData.push({
          day: `Day ${i}`,
          score: score,
        });
      }
    }
    return trendData;
  };

  const handleExportCSV = () => {
    // Find active template title
    const selectedTemplateObj = templates.find((t) => t.id === selectedTemplate);
    const templateTitle = selectedTemplateObj ? selectedTemplateObj.title : selectedTemplate;

    const csvContent: string[] = [];

    // Header metadata
    csvContent.push(`Clinical Experiment Matrix Trial Report`);
    csvContent.push(`Trial Name,${templateTitle}`);
    csvContent.push(`Exported Date,${new Date().toISOString()}`);
    csvContent.push(``); // Blank line

    // Section 1: Optimization KPI Metrics
    csvContent.push(`Optimization KPI Metrics`);
    csvContent.push(`KPI Metric,Current Value,Improvement / Status`);
    dashboardMetricCards.forEach(card => {
      const escapedTitle = `"${card.title.replace(/"/g, '""')}"`;
      const escapedValue = `"${card.value.toString().replace(/"/g, '""')}"`;
      const escapedChange = `"${card.change.replace(/"/g, '""')}"`;
      csvContent.push(`${escapedTitle},${escapedValue},${escapedChange}`);
    });
    csvContent.push(``); // Blank line

    // Section 2: Phase Milestones & Timeline
    csvContent.push(`Simulated Trial Phase Milestones`);
    csvContent.push(`Phase,Start,Duration,Progress %,Status,Insights`);
    ganttItems.forEach(item => {
      const escapedPhase = `"${item.phase.replace(/"/g, '""')}"`;
      const escapedStart = `"${item.start.replace(/"/g, '""')}"`;
      const escapedDur = `"${item.duration.replace(/"/g, '""')}"`;
      const escapedProg = `"${item.progress}%"`;
      const escapedStat = `"${item.status.replace(/"/g, '""')}"`;
      const escapedInsights = `"${item.insights.replace(/"/g, '""')}"`;
      csvContent.push(`${escapedPhase},${escapedStart},${escapedDur},${escapedProg},${escapedStat},${escapedInsights}`);
    });
    csvContent.push(``); // Blank line

    // Section 3: 7-Day Historical Calibration Trend Data
    csvContent.push(`7-Day Historical Feasibility Calibration Trend Data`);
    csvContent.push(`KPI Metric,Day 1,Day 2,Day 3,Day 4,Day 5,Day 6,Day 7 (Current)`);
    dashboardMetricCards.forEach(card => {
      const trendPoints = getWeeklyTrend(card.id);
      const row = [`"${card.title}"`];
      trendPoints.forEach(p => row.push(p.value.toString()));
      csvContent.push(row.join(","));
    });

    // Generate CSV Blob and Download
    const blob = new Blob([csvContent.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const fileSlug = templateTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    link.setAttribute("download", `clinical-experiment-report-${fileSlug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Comparative Scenarios Data
  const comparativeData = [
    {
      metric: "Cohort Setup (Days)",
      Baseline: 120,
      Optimized: 18,
    },
    {
      metric: "Dropout Rate (%)",
      Baseline: 28,
      Optimized: 5,
    },
    {
      metric: "Avg Site Load (%)",
      Baseline: 82,
      Optimized: 44,
    },
    {
      metric: "Protocol Amendments (#)",
      Baseline: 11,
      Optimized: 1,
    },
    {
      metric: "Compliance Score (%)",
      Baseline: 62,
      Optimized: 98,
    },
  ];

  // Gantt chart items of Simulated Trials
  const ganttItems = [
    {
      phase: "Phase 1: Pre-Screening Search",
      start: "Month 1",
      duration: "1.5 months",
      progress: 100,
      status: "completed",
      barLeft: "0%",
      barWidth: "15%",
      color: "bg-cyan-500",
      insights: "Completed index scans over 14 partner hospital registries. Identified 8,400 prescreen candidate patient records sharing the requested molecular biomarkers.",
    },
    {
      phase: "Phase 2: Genetic Stratification",
      start: "Month 2",
      duration: "2 months",
      progress: 95,
      status: "active",
      barLeft: "15%",
      barWidth: "20%",
      color: "bg-indigo-500",
      insights: "Executing multi-variant clustering. Aligned molecular markers including EGFR mutation subgroups to predict high-response ratios and avoid placebo dropouts.",
    },
    {
      phase: "Phase 3: Multi-site Activation",
      start: "Month 3.5",
      duration: "3 months",
      progress: 60,
      status: "active",
      barLeft: "35%",
      barWidth: "30%",
      color: "bg-indigo-400",
      insights: "Calibrating clinical equipment load across Mayo Clinic and MD Anderson. Telemetry confirms active investigators have passed HIPAA clearance credentials.",
    },
    {
      phase: "Phase 4: Simulated Cohort Run",
      start: "Month 5",
      duration: "4 months",
      progress: 10,
      status: "pending",
      barLeft: "50%",
      barWidth: "40%",
      color: "bg-purple-500",
      insights: "Awaiting final DSL Compilation. Monte Carlo logic will generate 500 potential dropout paths to prevent site allocation overruns.",
    },
    {
      phase: "Phase 5: FDA Regulatory Submission",
      start: "Month 8.5",
      duration: "1.5 months",
      progress: 0,
      status: "pending",
      barLeft: "85%",
      barWidth: "15%",
      color: "bg-violet-600",
      insights: "Final document locker submission compiling PDF hashes and cryptographically generating FDA Title-21 CFR compliance reports.",
    },
  ];

  // Individual functions for each KPI diagnostic specification
  const getRuntimeDiagnosticSpecs = () => {
    return {
      title: "Supercomputer Annealing Engine Diagnostics",
      subtitle: "DSL Parse & Multi-Agent Constraint Solving Model",
      stat: "420 Microseconds Execution (Optimal Steady-State)",
      content: [
        "Resolves NP-complete site matching algorithms instantly with sub-millisecond precision.",
        "Processes 42 high-affinity constraints in parallel through distributed GPU threads.",
        "Vastly outperforms classic linear iterative workflows (which average 14 days of manual coordination).",
        "Hardware acceleration: Enabled & Verified."
      ],
      classification: "Hardware Solver Pipeline",
      frequency: "Continual Run Loop",
      compilerVersion: "Copernicus DSL v4.12.0"
    };
  };

  const getFeasibilityDiagnosticSpecs = () => {
    return {
      title: "Automated Protocol Feasibility Diagnostics",
      subtitle: "Semantic Regulatory Parsing & NLP Validation Engine",
      stat: `${metrics.feasibilityScore}% Compliance Likelihood`,
      content: [
        "Checks language semantics against historical FDA Title-21 guidelines for pre-approvals.",
        "Scans for operational risk vectors such as complex recruitment deficits or heavy exclusion criteria.",
        "Provides cryptographic approval hash valid for Institutional Review Boards (IRB) directly.",
        "Compliance Integrity Protocol: Passed."
      ],
      classification: "Semantic Regulatory Parsing",
      frequency: "On-Demand Parsing",
      compilerVersion: "IRB Evaluator v2.4.1"
    };
  };

  const getCostDiagnosticSpecs = () => {
    return {
      title: "Calculated Budgetary Savings Diagnostics",
      subtitle: "Multi-Site Tactical Routing Financial Savings Model",
      stat: `${metrics.costReduction} Saved (Estimated CapEx Reduction)`,
      content: [
        "Optimizes multi-hospital coordinate distributions to save travel and site activation overhead.",
        "Halves average screening durations through targeted bio-signature pre-matching techniques.",
        "Drastically reduces post-execution protocol amendments, preserving precious clinical research capital.",
        "Fiscal Integrity check: Approved."
      ],
      classification: "Capital Optimizations",
      frequency: "Per-Trial Synthesis",
      compilerVersion: "Fiscal Ledger v1.0.5"
    };
  };

  const getRecruitmentDiagnosticSpecs = () => {
    return {
      title: "Recruitment Precision Velocity Diagnostics",
      subtitle: "Predictive Biomarker Exclusion & Screening Model",
      stat: `${metrics.recruitmentEfficiency}% Targeted Accuracy`,
      content: [
        "Pre-qualifies patients using automated real-time genetic markers to ensure recruitment fits criteria.",
        "Avoids the standard 45% screen-failure rate seen in traditional random enrollment trials.",
        "Maintains stable, highly reproducible enrollment criteria across all local medical trial hubs.",
        "Velocity threshold limit check: Nominal."
      ],
      classification: "Aesthetic Patient Stratification",
      frequency: "Continuous Sync",
      compilerVersion: "Cohort Matching v3.1.2"
    };
  };

  const getCohortDiagnosticSpecs = () => {
    return {
      title: "High-Affinity Cohort Homogeneity Diagnostics",
      subtitle: "Genetic Stratification Standard Deviation Analysis",
      stat: `${metrics.cohortQuality}% Stratification Purity`,
      content: [
        "Groups patients with exact genetic signature matching (e.g., APOE4, EGFR mutation subgroups).",
        "Reduces background variance to maximize molecular effect signal under trial conditions.",
        "Guarantees scientific trial validity under rigorous third-party and peer-reviewed guidelines.",
        "Cohort variance calculation: Optimal."
      ],
      classification: "Statistical Molecular Matching",
      frequency: "Epoch-Based Recalibration",
      compilerVersion: "S.D. Variance Estimator v5.0.0"
    };
  };

  const getAmendmentsDiagnosticSpecs = () => {
    return {
      title: "Amended Risk Shield Diagnostics",
      subtitle: "Proactive Protocol Error Immunity Analysis",
      stat: `${metrics.amendmentReduction}% Amendment Containment Rate`,
      content: [
        "Pre-empts operational bottlenecks before enrolling a single patient to the clinical sites.",
        "Validates criteria bounds in the Copernicus-DSL compiler upfront rather than during trial execution.",
        "Guarantees zero post-initiation delays from preventable design or logical criteria issues.",
        "Logic boundary verification check: Fully Safe."
      ],
      classification: "Logical Fault Verification",
      frequency: "Static Compiler Analysis",
      compilerVersion: "Copernicus Compiler Guard v7.1"
    };
  };

  const getDiagnosticSpecs = (cardId: string) => {
    switch (cardId) {
      case "runtime":
        return getRuntimeDiagnosticSpecs();
      case "feasibility":
        return getFeasibilityDiagnosticSpecs();
      case "cost":
        return getCostDiagnosticSpecs();
      case "recruitment":
        return getRecruitmentDiagnosticSpecs();
      case "cohort":
        return getCohortDiagnosticSpecs();
      case "amendments":
        return getAmendmentsDiagnosticSpecs();
      default:
        return getFeasibilityDiagnosticSpecs();
    }
  };

  const dashboardMetricCards: MetricCardData[] = [
    {
      id: "runtime",
      title: "Optimization Runtime",
      value: metrics.runtime,
      change: "-94.2% Time Dev",
      trend: "up",
      description: "Supercomputer CPU & Annealing runtime for full protocol constraint solver",
      iconName: "Clock",
    },
    {
      id: "feasibility",
      title: "Feasibility Score",
      value: `${metrics.feasibilityScore}%`,
      change: `+${(metrics.feasibilityScore - 64).toFixed(0)}% Lift`,
      trend: "up",
      description: "Regulatory compliance likelihood based on automated semantic check",
      iconName: "Award",
    },
    {
      id: "cost",
      title: "Estimated Cost Reduction",
      value: metrics.costReduction,
      change: "24.5% CapEx Saved",
      trend: "up",
      description: "Financial savings based on optimized multi-site routing and cohort speed",
      iconName: "DollarSign",
    },
    {
      id: "recruitment",
      title: "Recruitment Efficiency",
      value: `${metrics.recruitmentEfficiency}%`,
      change: "Optimal Patient Pool",
      trend: "up",
      description: "Target matching and predictive exclusion compliance statistics",
      iconName: "Users",
    },
    {
      id: "cohort",
      title: "Cohort Inherent Quality",
      value: `${metrics.cohortQuality}%`,
      change: "+31% Homogeneity",
      trend: "up",
      description: "Genetic stratification quality and reduced standard deviation",
      iconName: "CheckCircle",
    },
    {
      id: "amendments",
      title: "Amendment Reduction",
      value: `${metrics.amendmentReduction}%`,
      change: "0 Risk Detected",
      trend: "up",
      description: "Avoided post-initiation adjustments via robust initial DSL compiler checks",
      iconName: "ShieldAlert",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Template Chooser & Main Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass rounded-2xl">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Clinical Experiment Matrix Dashboard <span className="text-emerald-400 text-xs px-2 py-0.5 rounded-full bg-emerald-900/30 border border-emerald-800 font-normal">Active Simulation</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose a clinical trial configuration to view physical baseline parameters and AI optimization outputs in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-mono text-slate-400">SELECT TRIAL:</label>
          <select
            value={selectedTemplate}
            onChange={(e) => onSelectTemplate(e.target.value)}
            className="bg-slate-950/80 border border-slate-700 hover:border-cyan-500 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all cursor-pointer"
          >
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/20 hover:border-cyan-400/40 font-semibold px-4 py-2 text-xs rounded-xl transition-all shadow-md uppercase tracking-wider cursor-pointer"
            title="Export full evaluation telemetry & historical trends to CSV"
          >
            Export CSV <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onNavigateToOptimize}
            className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-4 py-2 text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20 uppercase tracking-wider cursor-pointer"
          >
            Launch Solver <Play className="w-3.5 h-3.5 fill-slate-950" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {dashboardMetricCards.map((card) => {
          let IconComp = Clock;
          if (card.iconName === "Clock") IconComp = Clock;
          else if (card.iconName === "Award") IconComp = Award;
          else if (card.iconName === "DollarSign") IconComp = DollarSign;
          else if (card.iconName === "Users") IconComp = Users;
          else if (card.iconName === "CheckCircle") IconComp = CheckCircle;
          else if (card.iconName === "ShieldAlert") IconComp = ShieldAlert;

          return (
            <button
              type="button"
              key={card.id}
              onClick={() => setActiveKpiDetail(card.id)}
              className={`p-5 glass rounded-2xl transition-all duration-300 relative group overflow-hidden text-left cursor-pointer hover:border-cyan-500/30 w-full hover:-translate-y-0.5 ${
                card.id === "feasibility" ? "glow-cyan border-cyan-500/20" : ""
              }`}
              title="Click to view full scientific evaluation telemetry"
            >
              {/* Subtle hover backlight */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 font-mono tracking-wider uppercase">
                  {card.title}
                </span>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5 text-cyan-400">
                  <IconComp className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl font-extrabold text-slate-50 font-mono tracking-tight">
                  {card.value}
                </span>
                <span className="text-[10px] font-semibold text-emerald-400 font-mono px-1.5 py-0.5 rounded bg-emerald-950/30 border border-emerald-800/40 flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5 text-emerald-400" /> {card.change}
                </span>
              </div>

              {/* 7-Day Sparkline trend visualization */}
              <div className="h-10 w-full mt-3.5 mb-1 bg-slate-950/25 rounded-lg border border-white/5 p-1 opacity-80 group-hover:opacity-100 group-hover:border-white/10 transition-all duration-350">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getWeeklyTrend(card.id)} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                    <defs>
                      <linearGradient id={`sparklineGrad-${card.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={card.id === 'feasibility' ? '#06b6d4' : '#6366f1'} stopOpacity={0.25}/>
                        <stop offset="100%" stopColor={card.id === 'feasibility' ? '#06b6d4' : '#6366f1'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#070a13",
                        borderColor: "rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                        color: "#f1f5f9",
                        fontSize: "9px",
                        fontFamily: "monospace",
                        padding: "3px 6px",
                      }}
                      labelStyle={{ display: "none" }}
                      itemStyle={{ color: card.id === 'feasibility' ? '#22d3ee' : '#818cf8', padding: 0 }}
                      formatter={(val: any) => [val, "Trend"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={card.id === 'feasibility' ? '#06b6d4' : '#6366f1'}
                      strokeWidth={1.5}
                      fillOpacity={1}
                      fill={`url(#sparklineGrad-${card.id})`}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <p className="text-[11px] text-slate-400 mt-2.5 font-normal leading-relaxed">
                {card.description}
              </p>

              <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-cyan-400 font-mono group-hover:text-cyan-300 transition-colors">
                <span>View Diagnostic Specs</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Comparative Chart */}
        <div className="lg:col-span-1 p-6 glass rounded-2xl flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Quantum Scenarios Analytica
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparison across core protocol operational vectors. Lower score is superior.
            </p>
          </div>

          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparativeData}
                margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="metric"
                  stroke="#94a3b8"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  contentStyle={{
                    backgroundColor: "#0b0f19",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "11px",
                    fontFamily: "monospace",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconSize={10}
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: "10px",
                    fontFamily: "monospace",
                  }}
                />
                <Bar dataKey="Baseline" fill="rgba(148, 163, 184, 0.45)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Optimized" fill="url(#cyanMagentaGrad)" radius={[4, 4, 0, 0]} />
                {/* SVG gradient definition */}
                <defs>
                  <linearGradient id="cyanMagentaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Phase Duration Timeline Gantt Tracker */}
        <div className="lg:col-span-2 p-6 glass rounded-2xl flex flex-col">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white">Quantum-Optimized Gantt Timeline</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Dynamic visualizer modeling current trial stages. Click any timeline row to audit detailed milestones.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 font-mono text-[10px] text-cyan-400 border border-cyan-800/50">
              EST. DURATION: <span className="text-slate-100 font-bold">10.5 Months</span>
            </div>
          </div>

          {/* Timeline Grid */}
          <div className="flex-1 space-y-5 flex flex-col justify-center min-h-[300px]">
            {ganttItems.map((item, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setActiveGanttRow(idx)}
                className="space-y-1.5 w-full text-left group/row relative hover:bg-white/5 p-2 rounded-xl transition-all cursor-pointer"
              >
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5 group-hover/row:text-cyan-300 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 font-bold" />
                    {item.phase}
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">
                    {item.start} &bull; <span className="text-cyan-400 font-semibold">{item.duration}</span>
                  </span>
                </div>

                <div className="relative h-6 bg-slate-950/80 rounded-lg overflow-hidden border border-white/5">
                  {/* Absolute bar */}
                  <div
                    style={{ left: item.barLeft, width: item.barWidth }}
                    className={`absolute inset-y-0 ${item.color} opacity-25 rounded-md`}
                  />

                  {/* Absolute core metrics indicator */}
                  <div
                    style={{
                      left: item.barLeft,
                      width: `${parseFloat(item.barWidth) * (item.progress / 100)}%`,
                    }}
                    className={`absolute inset-y-0 ${item.color} rounded-md border-r border-white/40 flex items-center pl-3`}
                  >
                    <span className="text-[10px] font-bold text-white font-mono drop-shadow truncate pr-2">
                      {item.progress}% Completed
                    </span>
                  </div>

                  {/* Marker overlay */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-500 uppercase">
                    {item.status}
                  </div>
                </div>
              </button>
            ))}

            {/* Scale coordinates */}
            <div className="grid grid-cols-5 pt-3 border-t border-white/5 text-[9px] font-mono text-slate-500 text-center">
              <div>Month 0</div>
              <div>Month 3</div>
              <div>Month 6</div>
              <div>Month 9</div>
              <div>Month 12</div>
            </div>
          </div>
        </div>
      </div>

      {/* 30-Day Feasibility Score Evolution Trend Analysis */}
      <div className="p-6 glass rounded-2xl flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              30-Day Feasibility Score Evolution
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Refined analysis tracking composite regulatory eligibility metrics and molecular stratification confidence levels over a rolling 30-day simulated phase.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              Feasibility Score
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-1 border-t-2 border-dashed border-red-500" />
              IRB Threshold (70%)
            </span>
            <div className="px-3 py-1 rounded bg-slate-950 text-[11px] border border-white/5 text-emerald-400 font-semibold">
              PEAK: {Math.max(...getThirtyDayFeasibilityTrend().map(d => d.score))}%
            </div>
          </div>
        </div>

        <div className="w-full h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={getThirtyDayFeasibilityTrend()}
              margin={{ top: 10, right: 15, left: -20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorFeasibilityTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="day"
                stroke="#94a3b8"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  // Only display label for Day 1, 5, 10, 15, 20, 25, 30 to prevent grid clutter
                  const num = parseInt(value.replace("Day ", ""));
                  return num === 1 || num % 5 === 0 ? value : "";
                }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={[20, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0b0f19",
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#f8fafc",
                  fontSize: "11px",
                  fontFamily: "monospace",
                }}
                formatter={(val: any) => [`${val}%`, "Feasibility Score"]}
                labelStyle={{ color: "#94a3b8" }}
              />
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '70% IRB PASS', fill: '#ef4444', fontSize: 9, position: 'insideBottomRight', fontFamily: 'monospace' }} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorFeasibilityTrend)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-white/5 font-mono text-[11px] text-slate-400">
          <div className="p-3.5 bg-slate-950/40 rounded-xl border border-white/5">
            <span className="text-cyan-400 font-bold block mb-1">Simulated Regression Analysis:</span>
            Consistent upper-quadrant trajectory models the incremental optimization of cohort exclusion bounds through compiler refinement.
          </div>
          <div className="p-3.5 bg-slate-950/40 rounded-xl border border-white/5">
            <span className="text-indigo-400 font-bold block mb-1">Risk Modeling & Outliers:</span>
            Monte Carlo solver simulations confirm 7-day steady-state convergence over the crucial 70% Institutional Review Board regulatory boundary line.
          </div>
          <div className="p-3.5 bg-slate-950/40 rounded-xl border border-white/5">
            <span className="text-purple-400 font-bold block mb-1">Stratification Velocity:</span>
            Optimal stratification homogeneity leads to zero score deceleration curves across complex multi-center trial locations.
          </div>
        </div>
      </div>

      {/* KPI Detail Interactive Modal */}
      {(() => {
        const activeSpec = activeKpiDetail ? getDiagnosticSpecs(activeKpiDetail) : null;
        if (!activeKpiDetail || !activeSpec) return null;

        return (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative">
              <button
                onClick={() => setActiveKpiDetail(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-950/40 border border-cyan-800 text-cyan-400 rounded-xl">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{activeSpec.title}</h3>
                  <p className="text-xs text-slate-400">{activeSpec.subtitle}</p>
                </div>
              </div>

              <div className="my-4 p-3 rounded-xl bg-slate-950 text-cyan-300 font-mono text-[13px] tracking-tight text-center border border-white/5">
                Current Level: <span className="text-white font-bold">{activeSpec.stat}</span>
              </div>

              {/* Enhanced rich hardware/compiler metadata */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mb-4 text-left">
                <div className="p-2 rounded bg-slate-950/80 border border-white/5">
                  <span className="text-slate-500 block uppercase">CLASSIFICATION</span>
                  <span className="text-slate-300 font-semibold">{activeSpec.classification}</span>
                </div>
                <div className="p-2 rounded bg-slate-950/80 border border-white/5">
                  <span className="text-slate-500 block uppercase">FREQUENCY</span>
                  <span className="text-slate-300 font-semibold">{activeSpec.frequency}</span>
                </div>
                <div className="p-2 rounded bg-slate-950/80 border border-white/5 col-span-2">
                  <span className="text-slate-500 block uppercase">SYSTEM RUNTIME LAYER</span>
                  <span className="text-cyan-400 font-bold">{activeSpec.compilerVersion}</span>
                </div>
              </div>

              <div className="space-y-2.5 text-left">
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-mono font-bold">Simulated Operational Guidelines:</h4>
                {activeSpec.content.map((bullet, idx) => (
                  <div key={idx} className="flex gap-2.5 text-xs text-slate-300 leading-relaxed">
                    <span className="text-cyan-400 font-bold font-mono shrink-0">✓</span>
                    <p>{bullet}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setActiveKpiDetail(null)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs mt-6 transition-all border border-white/5"
              >
                Close Diagnostic Telemetry
              </button>
            </div>
          </div>
        );
      })()}

      {/* Gantt Row Detail Interactive Modal */}
      {activeGanttRow !== null && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setActiveGanttRow(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-indigo-950/40 border border-indigo-800 text-indigo-400 rounded-xl">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{ganttItems[activeGanttRow].phase}</h3>
                <p className="text-xs text-slate-400">
                  Starts: {ganttItems[activeGanttRow].start} &bull; Expected Duration: {ganttItems[activeGanttRow].duration}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-white/5 mb-6 text-xs text-slate-300 leading-relaxed font-mono">
              <p className="font-semibold text-cyan-400 mb-1 flex items-center gap-1">
                <Database className="w-3.5 h-3.5" /> METADATA AUDIT INSIGHTS:
              </p>
              {ganttItems[activeGanttRow].insights}
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono mb-6">
              <div className="p-3 rounded-lg bg-slate-950/50 border border-white/5">
                <span className="text-slate-500 block">STATUS</span>
                <span className="text-white font-bold uppercase">{ganttItems[activeGanttRow].status}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/50 border border-white/5">
                <span className="text-slate-500 block">PROGRESS</span>
                <span className="text-cyan-400 font-bold">{ganttItems[activeGanttRow].progress}% Approved</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  alert(`Phase Fast-Forward initiated! Generating synthetic execution paths...`);
                  setActiveGanttRow(null);
                }}
                className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs transition-all uppercase tracking-wider"
              >
                Fast-Forward Verification
              </button>
              <button
                onClick={() => setActiveGanttRow(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-all border border-white/5"
              >
                Close Audit Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
