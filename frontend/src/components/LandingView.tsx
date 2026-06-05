import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, FileText, CheckCircle2, ShieldCheck, Activity, BrainCircuit, Database, Network, Globe } from "lucide-react";

function AnimatedCounter({ end, suffix = "", duration = 2 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const increment = end / (duration * 60);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.ceil(start));
        }
      }, 1000 / 60);
      return () => clearInterval(timer);
    }
  }, [end, duration, isInView]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function LandingView({ onEnterApp }: { onEnterApp: () => void }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0, y: -50 }}
      className="w-full min-h-screen text-slate-900 bg-transparent relative z-10 font-sans pb-32"
    >
      
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center px-8 sm:px-16 lg:px-32 relative pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold mb-6 tracking-wide uppercase border border-blue-200 shadow-sm">
            AI-Powered Enterprise Platform
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif text-[#0F4C81] leading-tight mb-8">
            Optimize Clinical Trials.<br />
            Accelerate Breakthroughs.
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed font-light">
            CTO leverages artificial intelligence, quantum-inspired solvers, and secure semantic data grids to design smarter protocols, discover exact genetic patients, and drastically reduce trial durations.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={onEnterApp}
              className="px-8 py-4 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 group"
            >
              Enter Workspace
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white hover:bg-slate-50 text-[#0F4C81] border border-slate-200 rounded-lg font-medium transition-all shadow-sm flex items-center gap-2 hover:-translate-y-0.5">
              <Activity className="w-5 h-5" />
              View Architecture
            </button>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center text-slate-400"
        >
          <span className="text-xs uppercase tracking-widest mb-2 font-bold font-mono">Scroll to Platform</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-[#2563EB] to-transparent animate-pulse" />
        </motion.div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-8 sm:px-16 lg:px-32 border-y border-slate-200 bg-white/60 backdrop-blur-md">
        <p className="text-xs text-slate-500 font-bold font-mono mb-8 tracking-widest uppercase">Trusted by Global Research Institutes</p>
        <div className="flex flex-wrap items-center gap-12 lg:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="text-2xl font-serif font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-[#0F4C81]" /> Mayo Clinic
          </div>
          <div className="text-2xl font-sans font-bold text-slate-800 tracking-tighter">IQVIA</div>
          <div className="text-2xl font-sans font-bold text-slate-800 tracking-tight">Medidata</div>
          <div className="text-2xl font-serif font-bold text-slate-800 flex items-center gap-2">
            Stanford <span className="font-light">Medicine</span>
          </div>
          <div className="text-2xl font-serif font-bold text-slate-800 flex items-center gap-2">
            Dana-Farber
          </div>
        </div>
      </section>

      {/* Comprehensive Services Section */}
      <section className="py-32 px-8 sm:px-16 lg:px-32 bg-slate-50/50">
        <div className="max-w-4xl mb-20">
          <h2 className="text-4xl lg:text-5xl font-serif text-[#0F4C81] mb-6 leading-tight">
            Comprehensive <span className="font-light text-slate-500">End-to-End Trial Strategy</span>
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            From the initial DSL protocol drafting to the final Institutional Review Board (IRB) submission, CTO provides a vertically integrated suite of services designed to eliminate bottlenecks before a single patient is enrolled.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              title: "Protocol Compiler (DSL)", 
              desc: "Draft clinical criteria using our domain-specific language. We instantly parse your document against historical FDA rules to catch exclusion conflicts and feasibility risks before trial initiation.", 
              icon: FileText, 
              color: "text-blue-600", bg: "bg-blue-50" 
            },
            { 
              title: "Quantum Cohort Stratification", 
              desc: "Traditional trials suffer a 45% dropout rate. Our solver uses high-affinity genetic matrix algorithms (like EGFR, APOE4 clustering) to select perfect-fit candidates from federated health networks.", 
              icon: BrainCircuit, 
              color: "text-teal-600", bg: "bg-teal-50" 
            },
            { 
              title: "Multi-Site Resource Routing", 
              desc: "Automatically route cohorts to the optimal physical medical sites. Our solver balances active hospital equipment load, investigator availability, and geographic genetic density.", 
              icon: Network, 
              color: "text-purple-600", bg: "bg-purple-50" 
            },
            { 
              title: "Predictive Monte Carlo Simulator", 
              desc: "Run thousands of synthetic execution paths to forecast trial duration, cap-ex burn rate, and protocol amendment risk, enabling guaranteed outcomes.", 
              icon: Activity, 
              color: "text-amber-600", bg: "bg-amber-50" 
            },
            { 
              title: "Federated Secure Data Grid", 
              desc: "Direct integration with global medical registries utilizing SHA-256 cryptographic hashes to preserve patient PII while allowing metadata-level alignment.", 
              icon: Database, 
              color: "text-indigo-600", bg: "bg-indigo-50" 
            },
            { 
              title: "FDA Regulatory Vault", 
              desc: "Generate Title-21 CFR Part 11 compliant audit documents instantly. Our locked hashes ensure institutional review boards have a tamper-proof guarantee of feasibility.", 
              icon: ShieldCheck, 
              color: "text-emerald-600", bg: "bg-emerald-50" 
            }
          ].map((feat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              key={feat.title} 
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#2563EB]/30 transition-all duration-300 group"
            >
              <div className={`w-14 h-14 rounded-2xl ${feat.bg} flex items-center justify-center mb-6 group-hover:-translate-y-1 transition-transform`}>
                <feat.icon className={`w-7 h-7 ${feat.color}`} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feat.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* KPI Section */}
      <section className="py-24 px-8 sm:px-16 lg:px-32">
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0F4C81] via-[#2563EB] to-[#10B981]" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {[
              { value: 32, suffix: "%", label: "CapEx Cost Savings", color: "text-[#2563EB]" },
              { value: 58, suffix: "%", label: "Recruitment Speed", color: "text-[#10B981]" },
              { value: 98, suffix: "%", label: "Cohort Homogeneity", color: "text-[#14B8A6]" },
              { value: 2.4, suffix: "", label: "Months Faster", color: "text-purple-600" }
            ].map((kpi, i) => (
              <div key={kpi.label} className={`flex flex-col items-center justify-center text-center ${i !== 0 ? 'pt-8 md:pt-0' : ''}`}>
                <div className={`text-5xl font-mono font-bold mb-3 ${kpi.color}`}>
                  <AnimatedCounter end={kpi.value} suffix={kpi.suffix} />
                </div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest font-mono">{kpi.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scroll Transition Trigger Padding */}
      <div className="h-[25vh] flex flex-col items-center justify-center opacity-50">
        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-4 text-slate-400"
        >
          <span className="text-xs font-bold font-mono tracking-widest uppercase">Scrolling to Workspace...</span>
          <div className="w-8 h-12 border-2 border-slate-300 rounded-full flex justify-center p-1">
            <div className="w-1.5 h-3 bg-slate-300 rounded-full" />
          </div>
        </motion.div>
        <div ref={bottomRef} className="h-4 w-full mt-10" />
      </div>
    </motion.div>
  );
}
