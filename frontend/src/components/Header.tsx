import { useState } from "react";
import { Bell, Cpu, Radio, ShieldCheck, RefreshCw, Layers, X, CheckCircle, Info, Sparkles } from "lucide-react";

interface HeaderProps {
  compilerStatus: "idle" | "compiling" | "success" | "error";
  simulationActive: boolean;
  onReset: () => void;
  systemMetrics: {
    runtime: string;
    feasibilityScore: number;
    costReduction: string;
  };
}

export default function Header({
  compilerStatus,
  simulationActive,
  onReset,
  systemMetrics,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeGatewayInfo, setActiveGatewayInfo] = useState<string | null>(null);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Biomarker Optimization",
      text: "Oncology Phase II protocol aligned 12 high-affinity patient groups.",
      time: "Just now",
      read: false,
    },
    {
      id: 2,
      title: "Quantum Compiler Secure",
      text: "Finished sandbox lexer evaluation on 42,000 sub-nodes.",
      time: "5m ago",
      read: true,
    },
    {
      id: 3,
      title: "FDA compliance audit locked",
      text: "Protocol key CARD-GEN-S99 loaded safely into cryptographically signed state.",
      time: "2h ago",
      read: true,
    },
  ]);

  const toggleNotificationRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Check how many are unread
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header
      id="system-top-header"
      className="h-20 glass px-8 flex items-center justify-between shrink-0 z-10 relative"
    >
      {/* Platform Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-slate-500 text-xs font-mono">WORKSPACE:</span>
          <span className="text-slate-300 text-xs font-semibold font-mono px-2 py-1 rounded bg-slate-900 border border-white/5">
            CLINICAL-TRIAL-DECISION-MATRIX
          </span>
        </div>
      </div>

      {/* Real-time Status Connection Rail */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 border-r border-white/5 pr-6 hidden md:flex">
          {/* API Gateway Status */}
          <button 
            type="button"
            onClick={() => setActiveGatewayInfo(activeGatewayInfo === "gateway" ? null : "gateway")}
            className="flex items-center gap-2 hover:bg-slate-900 px-2 py-1 rounded transition-colors text-left" 
            title="Click to view API Gateway details"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono font-medium text-slate-300">API Gateway</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </button>

          {/* Compiler Status */}
          <button 
            type="button"
            onClick={() => setActiveGatewayInfo(activeGatewayInfo === "compiler" ? null : "compiler")}
            className="flex items-center gap-2 hover:bg-slate-900 px-2 py-1 rounded transition-colors text-left" 
            title="Click to view Compiler details"
          >
            <Layers className={`w-3.5 h-3.5 ${compilerStatus === "compiling" ? "text-amber-400 animate-spin" : "text-cyan-400"}`} />
            <span className="text-[11px] font-mono font-medium text-slate-300">DSL Compiler</span>
            <span className={`w-1.5 h-1.5 rounded-full ${compilerStatus === "error" ? "bg-red-500 animate-ping" : compilerStatus === "compiling" ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
          </button>

          {/* Quantum Processing Core */}
          <button 
            type="button"
            onClick={() => setActiveGatewayInfo(activeGatewayInfo === "quantum" ? null : "quantum")}
            className="flex items-center gap-2 hover:bg-slate-900 px-2 py-1 rounded transition-colors text-left" 
            title="Click to view Quantum hardware details"
          >
            <Cpu className={`w-3.5 h-3.5 ${simulationActive ? "text-purple-400" : "text-cyan-400"}`} />
            <span className="text-[11px] font-mono font-medium text-slate-300">Quantum Link</span>
            <span className={`w-1.5 h-1.5 rounded-full ${simulationActive ? "bg-purple-400 animate-pulse" : "bg-emerald-400"}`} />
          </button>
        </div>

        {/* Global Reset Action */}
        <button
          onClick={onReset}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 w-9 h-9 flex items-center justify-center border border-white/5 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all cursor-pointer"
          title="Reset All Simulation Progress & Restats"
        >
          <RefreshCw className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Notification bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setActiveGatewayInfo(null);
            }}
            className="hover:text-cyan-400 text-slate-300 p-2.5 rounded-lg bg-slate-900 border border-white/5 cursor-pointer flex items-center justify-center"
            title="System alerts & real-time updates"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border border-slate-950 animate-pulse" />
            )}
          </button>

          {/* Floating Notifications Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-slate-950/95 border border-white/10 rounded-xl shadow-2xl p-4 z-50 animate-fade-in backdrop-blur-md">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                <span className="text-xs font-bold text-slate-200">System Notifications</span>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[10px] text-zinc-400 hover:text-cyan-300 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-0.5 text-slate-500 hover:text-slate-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No active system alerts.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => toggleNotificationRead(n.id)}
                      className={`p-2.5 rounded-lg transition-all text-left cursor-pointer border ${
                        n.read
                          ? "bg-transparent border-transparent opacity-60"
                          : "bg-cyan-950/20 border-cyan-500/10 hover:border-cyan-500/25"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <p className={`text-xs ${n.read ? "text-slate-300" : "text-white font-semibold"}`}>
                          {n.title}
                        </p>
                        <span className="text-[9px] text-slate-500 font-mono shrink-0">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                        {n.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Card (Interactive dropdown on click) */}
        <button
          type="button"
          onClick={() => alert(`Copernicus Identity Matrix Module:\n\nUser: Dr. Alex L.\nRole: Lead Research Architect\nAccess Signature: HIGH-AFFINITY-ROOT-DECISION-LOCK`)}
          className="flex items-center gap-3.5 pl-2 text-left cursor-pointer group"
          title="Click to view credentials"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-500 p-0.5 shadow-lg shadow-cyan-500/10 group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center text-xs font-semibold text-white font-mono">
              AL
            </div>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">Dr. Alex L.</p>
            <p className="text-[9px] text-slate-400 font-mono">Lead Research Architect</p>
          </div>
        </button>
      </div>

      {/* Floating Network Detail overlays */}
      {activeGatewayInfo && (
        <div className="absolute right-40 top-20 w-72 bg-slate-950/95 border border-white/10 rounded-xl p-4 shadow-2xl z-50 backdrop-blur-md animate-fade-in text-left">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              {activeGatewayInfo === "gateway" && <Radio className="w-4 h-4 text-cyan-400" />}
              {activeGatewayInfo === "compiler" && <Layers className="w-4 h-4 text-cyan-400" />}
              {activeGatewayInfo === "quantum" && <Cpu className="w-4 h-4 text-cyan-400" />}
              {activeGatewayInfo} node telemetry
            </h4>
            <button onClick={() => setActiveGatewayInfo(null)} className="p-0.5 text-zinc-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          
          {activeGatewayInfo === "gateway" && (
            <div className="space-y-2 text-xs text-slate-300 font-mono">
              <p>📍 Status: <span className="text-emerald-400">ONLINE</span></p>
              <p>⚡ Latency: <span className="text-cyan-400">14ms</span></p>
              <p>🔒 TLS Status: <span className="text-slate-400">AES-256 GCM Secure</span></p>
              <p className="text-[10px] text-slate-500 leading-relaxed pt-1">
                Proxies genetic biomarker data directly from sandboxed hospital registries without revealing patient PII.
              </p>
            </div>
          )}

          {activeGatewayInfo === "compiler" && (
            <div className="space-y-2 text-xs text-slate-300 font-mono">
              <p>⚙️ Compiler: <span className="text-cyan-400">v1.2.3-Quantum</span></p>
              <p>⚡ AST Size: <span className="text-amber-400">Ready</span></p>
              <p>💾 Optimization: <span className="text-slate-400">Matrix-annealing core</span></p>
              <p className="text-[10px] text-slate-500 leading-relaxed pt-1">
                Compiled states are evaluated against FDA regulatory rules and local therapeutic requirements on fly.
              </p>
            </div>
          )}

          {activeGatewayInfo === "quantum" && (
            <div className="space-y-2 text-xs text-slate-300 font-mono">
              <p>🔮 Physical Hardware: <span className="text-orchid text-purple-400">Active</span></p>
              <p>🌀 Core Matrix Temp: <span className="text-cyan-400">15mK (MilliKelvin)</span></p>
              <p>🎛️ Qubits Engaged: <span className="text-slate-400">3,120 Physical</span></p>
              <p className="text-[10px] text-slate-500 leading-relaxed pt-1">
                Computes high-frequency combinatorial optimization paths for randomized site selections in 120ms.
              </p>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
