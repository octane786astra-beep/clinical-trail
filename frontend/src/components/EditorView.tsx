import { useState, useEffect } from "react";
import { Terminal, ShieldCheck, Play, Layers, BadgeAlert, AlertCircle, FileCode, CheckCircle2, X, Sparkles, ChevronRight } from "lucide-react";
import { CompilerLog, ActiveConstraint } from "../types";

interface EditorViewProps {
  dslCode: string;
  onDslCodeChange: (code: string) => void;
  compilerLogs: CompilerLog[];
  onCompile: () => void;
  isCompiling: boolean;
  constraints: ActiveConstraint[];
  onUpdateConstraintScore: (id: string, score: number) => void;
}

export default function EditorView({
  dslCode,
  onDslCodeChange,
  compilerLogs,
  onCompile,
  isCompiling,
  constraints,
}: EditorViewProps) {
  // Line numbers generation helper
  const lineCount = dslCode.split("\n").length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 16) }, (_, i) => i + 1);

  const [selectedConstraintId, setSelectedConstraintId] = useState<string | null>(null);

  // Suggested keywords auto-injector helper
  const suggestions = [
    { token: "target_enrollment", type: "Parameter", value: "target_enrollment = 250;" },
    { token: "minimize_feasibility_risk", type: "Risk Engine", value: "minimize_feasibility_risk = extreme;" },
    { token: "quantum_annealing", type: "Hardware Selector", value: "quantum_annealing = active;" },
    { token: "exclusion_criteria", type: "Metadata", value: 'exclusion_criteria = ["HbA1c > 8%", "Age < 18"];' },
  ];

  const injectSuggestion = (textToInject: string) => {
    onDslCodeChange(dslCode + "\n  " + textToInject);
  };

  const constraintAuditInformation: Record<string, {
    title: string;
    description: string;
    recommendation: string;
    ruleToAppend: string;
    impact: string;
  }> = {
    "reg-compliance": {
      title: "FDA Regulatory Lock Audit",
      description: "Checks language semantics against historical FDA Title-21 guidelines. Scans for risk vectors such as enrollment deficits or exclusionary conflicts.",
      recommendation: "Inject extreme-level feasibility risk boundaries.",
      ruleToAppend: "minimize_feasibility_risk = extreme;",
      impact: "Raises overall feasibility success matrix from 64% to 95%.",
    },
    "op-feasibility": {
      title: "Operational Site Load Audit",
      description: "Validates multi-hospital coordinate schedules to make sure local clinical equipment load and staff shifts are fully balanced.",
      recommendation: "Pre-allocate high-efficiency medical centers Mayo Clinic and Stanford.",
      ruleToAppend: 'location_sites = ["Mayo Clinic,MN", "Stanford Systems,CA"];',
      impact: "Saves up to 45 days in initial site setup and operational delays.",
    },
    "cohort-exclusion": {
      title: "Dropout Risk Protection Audit",
      description: "Simulates patient genetic subsets using high-affinity matrix grouping parameters to maximize efficacy response signals.",
      recommendation: "Configure exclusionary criteria markers in the active biomarker cohort.",
      ruleToAppend: 'biomarkers = ["EGFR-mutated", "KRAS-wildtype"];',
      impact: "Maintains high patient homogeneity parameters to avoid late-stage dropouts.",
    },
    "budgetary-alloc": {
      title: "Budget Cap Allocation Limit Audit",
      description: "Controls the financial parameters matching participant enrollment metrics to local study capital caps.",
      recommendation: "Limit target enrollment to optimized pilot cohort bounds.",
      ruleToAppend: "target_enrollment = 120;",
      impact: "Protects protocol configuration from costly CapEx overhead overruns.",
    },
  };

  const handleApplyConstraintFix = (id: string, rule: string) => {
    // Inject the rule
    injectSuggestion(rule);
    setSelectedConstraintId(null);
    // Auto launch compiling
    setTimeout(() => {
      onCompile();
    }, 150);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header and metadata */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          Copernicus DSL Protocol Compiler
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Draft structured compliance rules using Copernicus-DSL. Click to parse structure, validate semantic limits, and trigger quantum solver routing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: DSL Code Editor */}
        <div className="lg:col-span-7 glass rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
          {/* Editor Header Toolbar */}
          <div className="bg-slate-900 px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-slate-400 text-xs font-mono select-none px-2">|</span>
              <span className="text-slate-300 text-xs font-mono font-medium flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-cyan-400" /> protocol_manifest.copernicus
              </span>
            </div>

            <button
              onClick={onCompile}
              disabled={isCompiling}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold font-mono rounded-xl border transition-all ${
                isCompiling
                  ? "bg-amber-950/40 border-amber-500/30 text-amber-400 cursor-not-allowed"
                  : "bg-cyan-950 hover:bg-cyan-900/80 border-cyan-500/40 text-cyan-300 hover:text-cyan-200 cursor-pointer shadow-lg shadow-cyan-950/40"
              }`}
            >
              {isCompiling ? (
                <>
                  <Layers className="w-3.5 h-3.5 animate-spin" /> COMPILING...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" /> COMPILE & OPTIMIZE
                </>
              )}
            </button>
          </div>

          <div className="flex flex-1 min-h-[460px] font-mono text-xs overflow-y-auto relative">
            {/* Gutter Line Numbers */}
            <div className="w-12 bg-slate-950/90 text-right pr-3.5 py-4 text-slate-600 border-r border-white/5 select-none text-[11px] leading-relaxed font-sans">
              {lineNumbers.map((num) => (
                <div key={num} className="h-[21px]">
                  {num}
                </div>
              ))}
            </div>

            {/* Input Text Area with Syntax simulation */}
            <textarea
              value={dslCode}
              onChange={(e) => onDslCodeChange(e.target.value)}
              className="flex-1 bg-transparent text-slate-100 p-4 outline-none resize-none font-mono text-[13px] leading-[21px] placeholder-slate-700 focus:ring-0 overflow-y-hidden"
              spellCheck="false"
              placeholder="# Type standard trial protocol definitions here..."
            />
          </div>

          {/* Suggested helper tray */}
          <div className="bg-slate-900/60 px-5 py-4 border-t border-white/5 space-y-2">
            <p className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">
              COPERNICUS AUTO-COMPLETION ASSISTANCE
            </p>
            <div className="flex flex-wrap gap-2 pt-1.5">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => injectSuggestion(sug.value)}
                  className="px-2.5 py-1 text-[10px] font-mono rounded bg-slate-950 hover:bg-slate-900 border border-white/5 text-slate-300 hover:text-cyan-400 transition-all text-left cursor-pointer flex items-center gap-1.5"
                >
                  <span className="text-slate-500 font-sans text-[8px] tracking-tight bg-slate-900 px-1 py-0.5 rounded uppercase border border-white/5">
                    {sug.type}
                  </span>
                  {sug.token}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Compiler Validation Terminal */}
        <div className="lg:col-span-5 glass rounded-2xl flex flex-col overflow-hidden shadow-xl">
          {/* Title Header */}
          <div className="bg-slate-900 px-5 py-3 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-200">Terminal Build Output Log</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-400 font-mono tracking-wider">ONLINE</span>
            </div>
          </div>

          {/* Active Logs Console screen */}
          <div className="flex-1 p-5 font-mono text-[11px] space-y-3 overflow-y-auto bg-slate-950 min-h-[240px] max-h-[350px]">
            {compilerLogs.length === 0 ? (
              <div className="text-slate-600 flex flex-col items-center justify-center h-full py-12 space-y-2">
                <FileCode className="w-8 h-8 text-slate-800 animate-bounce" />
                <p>Parser Idle. Waiting for manifest compilation trigger...</p>
              </div>
            ) : (
              compilerLogs.map((log) => {
                let colorClass = "text-slate-400";
                if (log.type === "success") colorClass = "text-emerald-400 font-semibold";
                if (log.type === "warning") colorClass = "text-amber-400";
                if (log.type === "error") colorClass = "text-red-500 font-bold";
                if (log.type === "system") colorClass = "text-cyan-400 font-mono";

                return (
                  <div key={log.id} className="leading-relaxed flex items-start gap-2.5">
                    <span className="text-[10px] text-slate-600 select-none font-sans shrink-0">
                      {log.timestamp}
                    </span>
                    <span className={`${colorClass} whitespace-pre-wrap break-all flex-1`}>
                      {log.message}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Simulated Active Constraints Board */}
          <div className="bg-slate-900/60 p-5 border-t border-white/5 space-y-4">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase font-mono">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> DSL Constraints Board
            </h4>

            <div className="grid grid-cols-2 gap-3.5 pt-1">
              {constraints.map((c) => {
                let badgeColor = "bg-slate-950 border-white/5 text-slate-400";
                if (c.status === "satisfied") badgeColor = "bg-emerald-950/55 border-emerald-500/30 text-emerald-400";
                if (c.status === "active") badgeColor = "bg-cyan-950/60 border-cyan-500/30 text-cyan-400";
                if (c.status === "violated") badgeColor = "bg-red-950/70 border-red-500/30 text-red-400 animate-pulse";

                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setSelectedConstraintId(c.id)}
                    className="p-3 bg-slate-950/80 border border-white/5 hover:border-cyan-500/40 rounded-xl space-y-2 hover:-translate-y-0.5 text-left transition-all font-mono cursor-pointer w-full group"
                    title="Audit Constraint Boundaries"
                  >
                    <div className="flex justify-between items-start gap-2 text-[10px]">
                      <span className="font-semibold text-slate-300 truncate group-hover:text-cyan-300 transition-colors">{c.name}</span>
                      <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${badgeColor} font-sans shrink-0`}>
                        {c.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] text-slate-500">
                        <span>Category: {c.category}</span>
                        <span>{c.score}% Match</span>
                      </div>
                      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${c.score}%` }}
                          className={`h-full transition-all duration-1000 ${
                            c.status === "satisfied"
                              ? "bg-emerald-400"
                              : c.status === "active"
                              ? "bg-cyan-400"
                              : "bg-red-500"
                          }`}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Constraint Modal */}
      {selectedConstraintId && constraintAuditInformation[selectedConstraintId] && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedConstraintId(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-xl">
                <ShieldCheck className="w-5 h-5 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-white">
                {constraintAuditInformation[selectedConstraintId].title}
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-mono p-3 bg-slate-950 rounded-xl border border-white/5 mb-5">
              {constraintAuditInformation[selectedConstraintId].description}
            </p>

            <div className="space-y-4 mb-6 text-xs">
              <div>
                <span className="text-slate-500 block uppercase font-mono text-[10px]">Optimizing Vector Impact</span>
                <span className="text-emerald-400 font-bold block mt-0.5">
                  {constraintAuditInformation[selectedConstraintId].impact}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-900/30 font-mono space-y-1">
                <span className="text-slate-500 text-[10px] uppercase block">Suggested Auto-Fix Code:</span>
                <code className="text-cyan-400 text-xs">
                  {constraintAuditInformation[selectedConstraintId].ruleToAppend}
                </code>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleApplyConstraintFix(
                  selectedConstraintId,
                  constraintAuditInformation[selectedConstraintId].ruleToAppend
                )}
                className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                Auto-Correct in Editor <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSelectedConstraintId(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-white/5 transition-all cursor-pointer"
              >
                Cancel Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
