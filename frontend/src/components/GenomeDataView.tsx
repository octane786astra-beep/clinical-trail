import React, { useState } from "react";
import { UploadCloud, FileJson, CheckCircle, AlertTriangle, UserPlus, Dna } from "lucide-react";
import { addPatientsBulk } from "../api";

export default function GenomeDataView() {
  const [dragActive, setDragActive] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  
  const [manualForm, setManualForm] = useState({
    id: "",
    age: 50,
    gender: "F",
    diagnosis: "Infiltrating duct carcinoma, NOS",
    hba1c: 5.5,
    gene_BRCA1: 0,
    gene_TP53: 0,
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processPatients = async (patients: any[]) => {
    try {
      setUploadStatus("uploading");
      setStatusMessage("Uploading patient genome data...");
      const res = await addPatientsBulk(patients);
      setUploadStatus("success");
      setStatusMessage(`Successfully added ${res.inserted_count} patients to the database.`);
      setJsonInput("");
    } catch (err: any) {
      setUploadStatus("error");
      setStatusMessage(`Upload failed: ${err.message || "Unknown error"}`);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const data = JSON.parse(content);
          if (Array.isArray(data)) {
            processPatients(data);
          } else {
            processPatients([data]);
          }
        } catch (err) {
          setUploadStatus("error");
          setStatusMessage("Invalid JSON file format.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleJsonSubmit = () => {
    try {
      const data = JSON.parse(jsonInput);
      if (Array.isArray(data)) {
        processPatients(data);
      } else {
        processPatients([data]);
      }
    } catch (err) {
      setUploadStatus("error");
      setStatusMessage("Invalid JSON text format.");
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.id) {
      setUploadStatus("error");
      setStatusMessage("Patient Code (ID) is required.");
      return;
    }
    processPatients([{
      id: manualForm.id,
      age: Number(manualForm.age),
      gender: manualForm.gender,
      diagnosis: manualForm.diagnosis,
      hba1c: Number(manualForm.hba1c),
      gene_BRCA1: Number(manualForm.gene_BRCA1),
      gene_TP53: Number(manualForm.gene_TP53),
    }]);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-[#0F4C81] flex items-center gap-3">
            <Dna className="w-6 h-6 text-indigo-600" />
            Patient Genome Data Integration
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Securely upload or enter genetic and biosensor baselines for trial cohort matching.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bulk Upload Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm p-6 flex flex-col relative overflow-hidden">
          <h2 className="text-lg font-medium text-slate-800 flex items-center gap-2 mb-4">
            <FileJson className="w-5 h-5 text-emerald-600" />
            Bulk JSON Ingestion
          </h2>
          
          <div 
            className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-colors ${
              dragActive ? "border-emerald-500 bg-emerald-50/50" : "border-slate-300 hover:border-slate-400 bg-slate-50/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <UploadCloud className={`w-12 h-12 mb-4 ${dragActive ? "text-emerald-500" : "text-slate-400"}`} />
            <p className="text-slate-600 font-medium mb-1">Drag and drop your JSON file here</p>
            <p className="text-sm text-slate-400">Array of PatientProfile objects</p>
            <div className="my-4 flex items-center gap-4 w-full px-8">
              <div className="h-px bg-slate-200 flex-1"></div>
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">or paste JSON</span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>
            
            <textarea
              className="w-full h-32 text-sm font-mono p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
              placeholder="[{\n  &quot;id&quot;: &quot;TCGA-A1-A0SB&quot;,\n  &quot;age&quot;: 70,\n  &quot;gene_BRCA1&quot;: 1,\n  &quot;gene_TP53&quot;: 0\n}]"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
            
            <button 
              className="mt-4 px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors w-full disabled:opacity-50"
              disabled={!jsonInput || uploadStatus === "uploading"}
              onClick={handleJsonSubmit}
            >
              Parse & Ingest JSON
            </button>
          </div>
        </div>

        {/* Manual Entry Form */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm p-6">
          <h2 className="text-lg font-medium text-slate-800 flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            Manual Registration
          </h2>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient Code (ID)</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. TCGA-XX-YYYY"
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={manualForm.id}
                  onChange={e => setManualForm({...manualForm, id: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Age</label>
                <input 
                  type="number" 
                  required
                  min={1} max={120}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={manualForm.age}
                  onChange={e => setManualForm({...manualForm, age: Number(e.target.value)})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gender</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={manualForm.gender}
                  onChange={e => setManualForm({...manualForm, gender: e.target.value})}
                >
                  <option value="F">Female</option>
                  <option value="M">Male</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">HbA1c</label>
                <input 
                  type="number" 
                  step="0.1"
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={manualForm.hba1c}
                  onChange={e => setManualForm({...manualForm, hba1c: Number(e.target.value)})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Primary Diagnosis</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={manualForm.diagnosis}
                onChange={e => setManualForm({...manualForm, diagnosis: e.target.value})}
              />
            </div>

            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-4 mt-2">
              <h3 className="text-sm font-semibold text-indigo-900 mb-2">Genetic Biomarkers</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">BRCA1 Mutation</p>
                  <p className="text-xs text-slate-500">Pathogenic variant detected</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={manualForm.gene_BRCA1 === 1} onChange={e => setManualForm({...manualForm, gene_BRCA1: e.target.checked ? 1 : 0})} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">TP53 Mutation</p>
                  <p className="text-xs text-slate-500">Tumor suppressor variant</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={manualForm.gene_TP53 === 1} onChange={e => setManualForm({...manualForm, gene_TP53: e.target.checked ? 1 : 0})} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>

            <button 
              type="submit"
              disabled={uploadStatus === "uploading"}
              className="mt-4 px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors w-full disabled:opacity-50"
            >
              Register Patient Profile
            </button>
          </form>
        </div>
      </div>

      {/* Status Alert */}
      {uploadStatus !== "idle" && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 animate-fade-in ${
          uploadStatus === "success" ? "bg-emerald-50 border-emerald-200" :
          uploadStatus === "error" ? "bg-red-50 border-red-200" :
          "bg-blue-50 border-blue-200"
        }`}>
          {uploadStatus === "success" && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
          {uploadStatus === "error" && <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
          {uploadStatus === "uploading" && (
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0 mt-0.5" />
          )}
          
          <div>
            <h3 className={`text-sm font-medium ${
              uploadStatus === "success" ? "text-emerald-900" :
              uploadStatus === "error" ? "text-red-900" :
              "text-blue-900"
            }`}>
              {uploadStatus === "success" ? "Ingestion Complete" :
               uploadStatus === "error" ? "Ingestion Failed" :
               "Processing Request..."}
            </h3>
            <p className={`text-sm mt-1 ${
              uploadStatus === "success" ? "text-emerald-700" :
              uploadStatus === "error" ? "text-red-700" :
              "text-blue-700"
            }`}>
              {statusMessage}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
