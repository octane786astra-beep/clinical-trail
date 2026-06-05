import { useState } from "react";
import { Sliders, Cpu, Activity, Play, Zap, Compass, CheckCircle2, MapPin, Globe, X, Server, CheckCircle } from "lucide-react";
import { OptimizationCore } from "../types";

interface OptimizeViewProps {
  optimizationSteps: OptimizationCore[];
  onTriggerOptimization: () => void;
  isOptimizing: boolean;
  selectedTemplateTitle: string;
}

export default function OptimizeView({
  optimizationSteps,
  onTriggerOptimization,
  isOptimizing,
  selectedTemplateTitle,
}: OptimizeViewProps) {
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);

  // Mock optimized medical sites computed on site-selection module
  const optimizedSites = [
    {
      id: 0,
      name: "Mayo Clinic Center for Medicine",
      location: "Rochester, MN",
      geneticMatch: 99.4,
      cap: 280,
      efficiency: "Extreme",
      chief: "Dr. Catherine Vance",
      queueCapacity: "14% Load",
      equipmentStatus: "Active Calibration Checked",
    },
    {
      id: 1,
      name: "MD Anderson Strategic Cohort Vault",
      location: "Houston, TX",
      geneticMatch: 98.1,
      cap: 420,
      efficiency: "Optimal",
      chief: "Dr. Marcus Thorne",
      queueCapacity: "28% Load",
      equipmentStatus: "Active Calibration Checked",
    },
    {
      id: 2,
      name: "Stanford Healthcare Systems Core",
      location: "Palo Alto, CA",
      geneticMatch: 97.5,
      cap: 190,
      efficiency: "Optimal",
      chief: "Dr. Helena Vance",
      queueCapacity: "41% Load",
      equipmentStatus: "Active Calibration Checked",
    },
    {
      id: 3,
      name: "Dana-Farber Cancer Clinical Trials",
      location: "Boston, MA",
      geneticMatch: 95.8,
      cap: 310,
      efficiency: "Stable",
      chief: "Dr. Lawrence Sterling",
      queueCapacity: "24% Load",
      equipmentStatus: "Active Calibration Checked",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass rounded-2xl">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Quantum Multi-Agent Stratification & Site Optimization
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Running optimization solver matrices for: <span className="text-cyan-400 font-bold font-mono">{selectedTemplateTitle}</span>
          </p>
        </div>

        <button
          onClick={onTriggerOptimization}
          disabled={isOptimizing}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold font-mono tracking-wider rounded-xl uppercase transition-all ${
            isOptimizing
              ? "bg-purple-950/40 border border-purple-500/30 text-purple-300 cursor-not-allowed"
              : "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white cursor-pointer shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 hover:scale-[1.02]"
          }`}
        >
          {isOptimizing ? (
            <>
              <Cpu className="w-4 h-4 animate-spin text-purple-400" /> SOLVERS SOLVING...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-white text-white" /> TRIGGER OPTIMIZER SOLVER
            </>
          )}
        </button>
      </div>

      {/* Progress Circles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {optimizationSteps.map((step) => {
          // Circular progress svg configuration
          const radius = 54;
          const circumference = 2 * Math.PI * radius;
          const offset = circumference - (step.progress / 100) * circumference;

          let ringColor = "stroke-cyan-500";
          let textColor = "text-cyan-400";
          if (step.id === "site-selection") {
            ringColor = "stroke-indigo-500";
            textColor = "text-indigo-400";
          } else if (step.id === "trial-simulation") {
            ringColor = "stroke-purple-500";
            textColor = "text-purple-400";
          }

          return (
            <div
              key={step.id}
              className={`p-6 glass rounded-2xl flex flex-col items-center text-center relative overflow-hidden group hover:border-cyan-500/25 duration-300 transition-all ${
                step.progress > 0 && step.progress < 100 ? "glow-cyan" : ""
              }`}
            >
              {/* Backlight flare glow */}
              {isOptimizing && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/2 rounded-full blur-3xl animate-pulse" />
              )}

              {/* Step Label Badge */}
              <span className="text-[10px] font-mono tracking-wider font-semibold text-slate-500 uppercase">
                SOLVER INSTANCE: {step.id}
              </span>

              {/* High-Precision SVG Progress Ring */}
              <div className="relative my-7 select-none">
                <svg className="w-32 h-32 transform -rotate-90">
                  {/* Underlay rail */}
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    className="stroke-slate-950"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Active gradient border */}
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    className={`${ringColor} transition-all duration-300`}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Centered progress percentage */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-slate-100 font-mono tracking-tighter">
                    {step.progress}%
                  </span>
                  <span className="text-[8px] font-bold text-slate-400 font-mono uppercase">
                    {step.status}
                  </span>
                </div>
              </div>

              {/* Details text descriptors */}
              <div className="space-y-1.5 w-full">
                <h3 className="text-sm font-bold text-slate-200">{step.name}</h3>
                <p className="text-[11px] text-slate-400 leading-normal min-h-[32px]">
                  {step.details}
                </p>
              </div>

              {/* ETA Display footer */}
              <div className="mt-5 w-full border-t border-white/5 pt-4 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">REMAINING ETA</span>
                <span className={`font-semibold ${textColor}`}>{step.eta}</span>
              </div>

              {/* Mini variables log table */}
              <div className="mt-4 w-full bg-slate-950/80 rounded-xl p-3 border border-white/5 space-y-1.5">
                {step.metrics.map((met, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-500">{met.label}</span>
                    <span className="text-slate-300 font-medium">{met.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Geospatial Site Selection Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 p-6 glass rounded-2xl flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" /> Geographic Optimization Map Mesh
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Visualizing physical site clusters selected by the AI constraint solver for genetic stratification pools.
              </p>
            </div>
          </div>

          {/* Map Mesh simulator canvas box */}
          <div className="flex-1 bg-slate-950 text-slate-600 rounded-xl border border-white/5 p-4 flex flex-col justify-between min-h-[220px] relative overflow-hidden select-none">
            {/* Ambient visual mesh lines */}
            <div className="absolute inset-0 opacity-10 flex flex-col justify-between py-4 pointer-events-none">
              <hr className="border-slate-400" />
              <hr className="border-slate-400" />
              <hr className="border-slate-400" />
              <hr className="border-slate-400" />
            </div>
            
            <div className="absolute inset-0 opacity-10 flex justify-between px-4 pointer-events-none">
              <div className="border-l border-slate-400 h-full" />
              <div className="border-l border-slate-400 h-full" />
              <div className="border-l border-slate-400 h-full" />
              <div className="border-l border-slate-400 h-full" />
            </div>

            {/* Custom high-tech nodes to represent sites on a grid */}
            <div className="relative flex-1 flex items-center justify-center p-8 min-h-[160px]">
              {/* Mayo Clinic Node */}
              <button
                type="button"
                onClick={() => setSelectedSiteId(0)}
                className="absolute top-[20%] left-[50%] flex flex-col items-center cursor-pointer group"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 absolute animate-ping opacity-60" />
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 relative border border-white flex items-center justify-center" />
                <span className="text-[10px] font-mono text-cyan-400 bg-slate-950/90 border border-cyan-800/50 px-1.5 py-0.5 mt-1 rounded font-bold uppercase group-hover:border-cyan-400 group-hover:text-white transition-all">
                  MN-MAYO
                </span>
              </button>

              {/* MD Anderson Node */}
              <button
                type="button"
                onClick={() => setSelectedSiteId(1)}
                className="absolute bottom-[25%] left-[45%] flex flex-col items-center cursor-pointer group"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 absolute animate-custom-ping opacity-60" />
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 relative border border-white" />
                <span className="text-[10px] font-mono text-indigo-400 bg-slate-950/90 border border-indigo-800/50 px-1.5 py-0.5 mt-1 rounded font-bold uppercase group-hover:border-indigo-400 group-hover:text-white transition-all">
                  TX-MD_AND
                </span>
              </button>

              {/* Stanford health node */}
              <button
                type="button"
                onClick={() => setSelectedSiteId(2)}
                className="absolute top-[40%] left-[15%] flex flex-col items-center cursor-pointer group"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-purple-500 absolute animate-ping opacity-60" />
                <div className="w-2.5 h-2.5 rounded-full bg-purple-400 relative border border-white" />
                <span className="text-[10px] font-mono text-purple-400 bg-slate-950/90 border border-purple-800/20 px-1.5 py-0.5 mt-1 rounded font-bold uppercase group-hover:border-purple-400 group-hover:text-white transition-all">
                  CA-STAN
                </span>
              </button>

              {/* Boston Harvard Node */}
              <button
                type="button"
                onClick={() => setSelectedSiteId(3)}
                className="absolute top-[18%] right-[15%] flex flex-col items-center cursor-pointer group"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 absolute animate-ping opacity-60" />
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 relative border border-white" />
                <span className="text-[10px] font-mono text-cyan-400 bg-slate-950/90 border border-cyan-800/20 px-1.5 py-0.5 mt-1 rounded font-bold uppercase group-hover:border-cyan-400 group-hover:text-white transition-all">
                  MA-HARV
                </span>
              </button>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-3 border-t border-white/5 relative z-10">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-cyan-400" /> MULTI-SITE RESOLUTION: SATISFIED
              </span>
              <span>GPS SYNC ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Selected Clinical Trial Sites Information */}
        <div className="lg:col-span-2 p-6 glass rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-200">Stratification Site Targets</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Specific, highly compliant cluster healthcare locations mapped to this protocol. Click cards for diagnostic audits.
            </p>
          </div>

          <div className="mt-4 space-y-3.5 flex-1 overflow-y-auto">
            {optimizedSites.map((site) => (
              <button
                type="button"
                key={site.id}
                onClick={() => setSelectedSiteId(site.id)}
                className="p-3 bg-slate-950/80 rounded-xl border border-white/5 hover:border-cyan-500/20 hover:-translate-y-0.5 transition-all w-full text-left cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 leading-none group-hover:text-cyan-400 transition-colors">{site.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-slate-500" /> {site.location}
                    </p>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-800/30 px-2 py-0.5 rounded-full capitalize">
                    {site.efficiency}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-slate-400">
                  <div>
                    <span className="text-slate-500">GENETIC MATCH</span>
                    <p className="text-white font-bold">{site.geneticMatch}%</p>
                  </div>
                  <div>
                    <span className="text-slate-500">ACTIVE POOL CAP</span>
                    <p className="text-white font-bold">{site.cap} Candidates</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Site Calibration Audit Modal */}
      {selectedSiteId !== null && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedSiteId(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-950 border border-indigo-800 text-indigo-400 rounded-xl">
                <Server className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {optimizedSites[selectedSiteId].name}
                </h3>
                <span className="text-xs text-slate-400">{optimizedSites[selectedSiteId].location}</span>
              </div>
            </div>

            <div className="space-y-4 mb-6 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">LEAD PRACTITIONER</span>
                  <span className="text-white font-bold">{optimizedSites[selectedSiteId].chief}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">MRI/GENETIC WORKLOAD</span>
                  <span className="text-cyan-400 font-bold">{optimizedSites[selectedSiteId].queueCapacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">DEVICE VERIFICATION</span>
                  <span className="text-emerald-400 font-semibold">{optimizedSites[selectedSiteId].equipmentStatus}</span>
                </div>
              </div>

              <div className="p-3.5 bg-cyan-950/20 rounded-xl border border-cyan-800/20 text-slate-300 leading-relaxed text-[11px]">
                <p className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> SECURE DECRYPTION KEY OK:
                </p>
                Successfully logged real-time biomarker patient tracking with mayo/md security matrix systems under full HIPAA exclusion hashes.
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  alert(`Direct connection verified! Successfully tested continuous calibration loop.`);
                  setSelectedSiteId(null);
                }}
                className="flex-1 py-2.5 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
              >
                Execute Remote Diagnostics
              </button>
              <button
                onClick={() => setSelectedSiteId(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-white/5 cursor-pointer"
              >
                Close Connection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
