import { ViewType } from "../types";
import { LayoutDashboard, FileCode, Sliders, FileText, Dna, Sparkles } from "lucide-react";

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: ViewType.DASHBOARD, label: "Dashboard", icon: LayoutDashboard, desc: "Trial KPIs & Timelines" },
    { id: ViewType.EDITOR, label: "Protocol Editor", icon: FileCode, desc: "DSL Compiler & Lexer" },
    { id: ViewType.OPTIMIZE, label: "Optimization Engine", icon: Sliders, desc: "Stratification Solver" },
    { id: ViewType.REPORTS, label: "Audit Reports", icon: FileText, desc: "PDF Compliance Archives" },
  ];

  return (
    <aside
      id="side-nav-rail"
      className="w-72 glass p-6 flex flex-col h-screen shrink-0 z-10"
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/5">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20">
          <Dna className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
            CTO <span className="text-cyan-400 text-xs font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-[10px] border border-cyan-800/50">V3.5</span>
          </h1>
          <p className="text-[10px] text-slate-400 tracking-wider uppercase font-mono mt-0.5">Clinical Trial Optimizer</p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 space-y-2 select-none">
        <p className="px-3 text-[10px] font-mono tracking-wider text-slate-500 uppercase mb-3">Simulation Controls</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-link-${item.id}`}
              onClick={() => onViewChange(item.id)}
              className={`w-full group relative flex items-start gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 text-left ${
                isActive
                  ? "bg-slate-900/60 border border-cyan-500/30 text-white shadow-inner"
                  : "text-slate-400 hover:bg-slate-900/30 hover:text-slate-200 border border-transparent"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-transform duration-300 group-hover:scale-105 ${
                  isActive ? "bg-cyan-500/10 text-cyan-400" : "bg-slate-900/40 text-slate-400 group-hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">{item.label}</p>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">{item.desc}</p>
              </div>
              
              {isActive && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status Foot */}
      <div className="pt-6 border-t border-white/5 space-y-3.5">
        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse relative">
            <span className="absolute inset-0 bg-cyan-400 opacity-75 animate-ping rounded-full" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-300 font-mono">Quantum Simulation Engine</p>
            <p className="text-[9px] text-slate-500 font-mono">Running on Sol-3 Cluster</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-1">
          <span>COPERNICUS API KEY</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-emerald-400 animate-bounce" /> ACTIVE
          </span>
        </div>
      </div>
    </aside>
  );
}
