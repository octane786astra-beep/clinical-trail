import { useState } from "react";
import { TrialReport } from "../types";
import { Download, FileText, CheckCircle2, ShieldAlert, Award, FileSpreadsheet, Search, RefreshCw } from "lucide-react";

interface ReportsViewProps {
  reports: TrialReport[];
  onTriggerDownload: (report: TrialReport) => void;
  selectedTemplateId: string;
}

export default function ReportsView({ reports, onTriggerDownload, selectedTemplateId }: ReportsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterArea, setFilterArea] = useState("all");

  const filteredReports = reports.filter((rep) => {
    const matchesSearch =
      rep.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.phase.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.therapeuticArea.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesArea = filterArea === "all" || rep.therapeuticArea.toLowerCase() === filterArea.toLowerCase();

    return matchesSearch && matchesArea;
  });

  const therapeuticAreas = Array.from(new Set(reports.map((r) => r.therapeuticArea)));

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Summary info */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          FDA-Compliant Clinical Trial Safety Vault & Reports
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Access verified, locked-down clinical trial optimization parameters suitable for direct institutional review board (IRB) or FDA submissions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 glass rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search report guidelines, therapeutic areas..."
            className="w-full bg-slate-950/80 hover:bg-slate-950 border border-white/5 focus:border-cyan-500/50 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
          />
        </div>

        {/* Dropdowns filters */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-[10px] font-mono text-slate-500 uppercase">AREA:</span>
          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className="bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none cursor-pointer hover:border-cyan-500/35 transition-all"
          >
            <option value="all">ALL THERAPEUTIC AREAS</option>
            {therapeuticAreas.map((area) => (
              <option key={area} value={area}>
                {area.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary Data Grid table */}
      <div className="glass rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans font-normal text-xs text-slate-300">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 font-mono text-[10px] tracking-wider border-b border-white/5">
                <th className="py-4.5 px-6 font-bold uppercase">Clinical Protocol Title</th>
                <th className="py-4.5 px-4 font-bold uppercase">Therapeutic Area</th>
                <th className="py-4.5 px-4 font-bold uppercase">Phase</th>
                <th className="py-4.5 px-4 font-bold uppercase">Enrollment Limit</th>
                <th className="py-4.5 px-4 font-bold uppercase text-center">Optimized Feasibility</th>
                <th className="py-4.5 px-4 font-bold uppercase text-center">Cost Saved</th>
                <th className="py-4.5 px-4 font-bold uppercase text-center">Audited Status</th>
                <th className="py-4.5 px-6 font-bold uppercase text-right">Archived Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-mono text-xs">
                    No verified trial audits conform to search settings. Click compile inside the DSL Editor to register new reports.
                  </td>
                </tr>
              ) : (
                filteredReports.map((rep) => {
                  const isCurrent = rep.id === selectedTemplateId;

                  let statusBadge = "bg-slate-900 border-white/5 text-slate-400";
                  if (rep.status === "Approved") statusBadge = "bg-emerald-950/60 border-emerald-500/40 text-emerald-400";
                  if (rep.status === "Audited") statusBadge = "bg-cyan-950/60 border-cyan-500/40 text-cyan-400";
                  if (rep.status === "Draft") statusBadge = "bg-amber-950/60 border-amber-500/40 text-amber-400";
                  if (rep.status === "Action Required") statusBadge = "bg-red-950/60 border-red-500/40 text-red-400 animate-pulse";

                  return (
                    <tr
                      key={rep.id}
                      className={`hover:bg-slate-900/30 transition-all font-sans ${isCurrent ? "bg-cyan-500/[0.03]" : ""}`}
                    >
                      {/* Title */}
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-slate-100 flex items-center gap-1.5">
                            {rep.title}{" "}
                            {isCurrent && (
                              <span className="text-[9px] bg-cyan-950/80 text-cyan-400 font-mono border border-cyan-800/40 px-1.5 py-0.5 rounded font-normal shrink-0">
                                SELECTED
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono mt-1">
                            MD5 Hash: SHA-256/{rep.protocolKey}
                          </p>
                        </div>
                      </td>

                      {/* Area */}
                      <td className="py-4 px-4 font-mono font-medium text-slate-300">
                        {rep.therapeuticArea}
                      </td>

                      {/* Phase */}
                      <td className="py-4 px-4 font-mono">
                        {rep.phase}
                      </td>

                      {/* Enrollment */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-100">
                        {rep.targetEnrollment.toLocaleString()} Patients
                      </td>

                      {/* Feasibility score */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-white/5">
                          <Award className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="font-mono text-cyan-400 font-bold">{rep.optimizedFeasibility}%</span>
                        </div>
                      </td>

                      {/* Cost saved */}
                      <td className="py-4 px-4 text-center text-slate-100 font-mono font-bold">
                        {rep.expectedCostSaving}
                      </td>

                      {/* Audited Status */}
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono rounded border uppercase font-bold tracking-tight ${statusBadge}`}>
                          {rep.status === "Approved" && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          {rep.status}
                        </span>
                      </td>

                      {/* Action trigger */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => onTriggerDownload(rep)}
                          className="inline-flex items-center gap-1.5 bg-slate-900 border border-white/10 hover:border-cyan-500/40 px-3.5 py-2 text-xs rounded-xl text-slate-300 hover:text-cyan-400 select-none font-mono cursor-pointer transition-all"
                          title="Generate FDA Submission Report Document"
                        >
                          <Download className="w-3.5 h-3.5 text-cyan-400" /> DOWNLOAD PDF
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety Compliance Disclaimers */}
      <div className="p-5 bg-blue-950/15 border border-cyan-800/20 rounded-2xl flex items-start gap-4">
        <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-100 font-sans">Institutional Security Notice (21 CFR Part 11)</p>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-normal">
            Every exported optimization file includes standard cryptographical hashes of the AST schema, system parameters, compiler seed state, and target site exclusions. These signatures verify protocol compliance locks under federal electronic records codes.
          </p>
        </div>
      </div>
    </div>
  );
}
