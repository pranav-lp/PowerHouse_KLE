import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useHealth } from "../../context/HealthContext";
import { motion } from "motion/react";
import {
  Heart,
  Activity,
  Brain,
  Droplet,
  Zap,
  Moon,
  AlertTriangle,
  Sparkles,
  Download,
  Share2,
  RotateCcw,
  User,
} from "lucide-react";
import { AIInsightsSection } from "../AIInsightsSection";

// ── Risk metadata ─────────────────────────────────────────────────────────────

const RISK_META: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  heart:     { label: "Heart Health",     icon: Heart,     color: "from-rose-500 to-pink-500",      bg: "from-rose-50 to-pink-50"      },
  metabolic: { label: "Metabolic Health", icon: Droplet,   color: "from-orange-400 to-amber-400",  bg: "from-orange-50 to-amber-50"  },
  lung:      { label: "Lung Health",      icon: Activity,  color: "from-sky-500 to-cyan-500",     bg: "from-sky-50 to-cyan-50"     },
  mental:    { label: "Mental Health",    icon: Brain,     color: "from-teal-400 to-emerald-400", bg: "from-teal-50 to-emerald-50" },
  liver:     { label: "Liver Health",     icon: Zap,       color: "from-amber-400 to-yellow-400",   bg: "from-amber-50 to-yellow-50"   },
  sleep:     { label: "Sleep Health",     icon: Moon,      color: "from-indigo-400 to-blue-400", bg: "from-indigo-50 to-blue-50" },
};

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function Dashboard() {
  const navigate = useNavigate();
  const { healthOutput, resetData } = useHealth();

  useEffect(() => {
    if (!healthOutput) navigate("/");
  }, [healthOutput, navigate]);

  if (!healthOutput) return null;

  const { input, signals, risks, topRisks } = healthOutput;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 backdrop-blur-xl rounded-2xl border border-teal-100/50 shadow-sm p-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] bg-clip-text text-transparent">
                LifeScore AI Dashboard
              </h1>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                Patient Profile: <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-slate-600">Age {(input as any).age ?? "—"} · {(input as any).sex === 1 ? "Male" : "Female"} · BMI {(input as any).bmi ?? "—"}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-teal-100 transition-shadow shadow-sm"
              >
                <Download className="w-4 h-4" />
                Download Report
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-white border border-slate-200 text-[#1F2937] rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Share2 className="w-4 h-4 text-slate-400" />
                Share
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Top Risks + Overall Risk ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {topRisks && topRisks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/60 backdrop-blur-xl rounded-2xl border border-teal-100/50 shadow-sm p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Top Risk Areas
              </h3>
              <div className="space-y-4">
                {topRisks.map(([riskKey, riskValue], index) => {
                  const meta = RISK_META[riskKey] ?? {
                    label: riskKey, icon: Activity,
                    color: "from-gray-500 to-gray-400", bg: "from-gray-50 to-gray-100",
                  };
                  const Icon = meta.icon;
                  return (
                    <motion.div
                      key={riskKey}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className={`p-4 bg-gradient-to-r ${meta.bg} rounded-xl border border-orange-100 flex items-center gap-4`}
                    >
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${meta.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-semibold text-gray-800">{meta.label}</span>
                          <span className="font-bold text-gray-800">{riskValue}%</span>
                        </div>
                        <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full bg-gradient-to-r ${meta.color} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${riskValue}%` }}
                            transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                          />
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${riskValue >= 60 ? "bg-red-100 text-red-700" : riskValue >= 30 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                        {riskValue >= 60 ? "High" : riskValue >= 30 ? "Moderate" : "Low"}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Overall Risk Score */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/70 backdrop-blur-xl rounded-2xl border border-purple-200 shadow-xl p-6 flex flex-col items-center justify-center"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6 w-full">Overall Risk Score</h3>
            <div className="relative w-44 h-44">
              <svg className="transform -rotate-90 w-44 h-44">
                <circle cx="88" cy="88" r="76" stroke="#e5e7eb" strokeWidth="14" fill="none" />
                <motion.circle
                  cx="88" cy="88" r="76"
                  stroke="url(#overallGradient)"
                  strokeWidth="14" fill="none" strokeLinecap="round"
                  initial={{ strokeDasharray: "0 478" }}
                  animate={{ strokeDasharray: `${(risks.overall / 100) * 478} 478` }}
                  transition={{ duration: 1.5, delay: 0.4 }}
                />
                <defs>
                  <linearGradient id="overallGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7B61FF" />
                    <stop offset="100%" stopColor="#5B8CFF" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {risks.overall}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Overall Risk</div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <span className={`text-sm font-semibold px-4 py-1.5 rounded-full ${risks.overall >= 60 ? "bg-red-100 text-red-700" : risks.overall >= 30 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                {risks.overall >= 60 ? "High Risk" : risks.overall >= 30 ? "Moderate Risk" : "Low Risk"}
              </span>
            </div>
          </motion.div>
        </div>

        {/* ── Signals Detected ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl border border-purple-200 shadow-xl p-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Health Signals Detected
          </h3>
          {signals.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {signals.map((signal, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + index * 0.06 }}
                  className="px-4 py-2 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-full text-sm font-semibold text-orange-700"
                >
                  {signal.replace(/_/g, " ")}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <p className="text-sm text-green-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                No concerning signals detected! Great health habits!
              </p>
            </div>
          )}
        </motion.div>

        {/* ── Detailed Risk Analysis ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl border border-purple-200 shadow-xl p-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Detailed Risk Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(["heart", "metabolic", "lung", "mental", "liver", "sleep"] as const).map((key, i) => (
              <RiskBar
                key={key}
                icon={RISK_META[key].icon}
                label={RISK_META[key].label}
                value={risks[key]}
                color={RISK_META[key].color}
                delay={0.3 + i * 0.08}
              />
            ))}
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            AI-GENERATED INSIGHTS (full interactive section)
        ══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          {/* Section divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
            <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-bold text-white">AI-Generated Insights</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
          </div>

          <AIInsightsSection />
        </motion.div>

        {/* ── Reset Button ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center pb-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { resetData(); navigate("/"); }}
            className="px-8 py-3 bg-gray-200 text-gray-700 rounded-full font-semibold flex items-center gap-2 hover:bg-gray-300 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Start New Assessment
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

// ── RiskBar sub-component ─────────────────────────────────────────────────────

interface RiskBarProps {
  icon: any;
  label: string;
  value: number;
  color: string;
  delay?: number;
}

function RiskBar({ icon: Icon, label, value, color, delay = 0 }: RiskBarProps) {
  const risk =
    value < 30
      ? { text: "Low", className: "text-green-600" }
      : value < 60
      ? { text: "Moderate", className: "text-yellow-600" }
      : { text: "High", className: "text-red-600" };

  return (
    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-purple-600" />
          <span className="font-semibold text-gray-800">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${risk.className}`}>{risk.text}</span>
          <span className="text-sm font-bold text-gray-800">{value}%</span>
        </div>
      </div>
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`absolute top-0 left-0 h-full bg-gradient-to-r ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay }}
        />
      </div>
    </div>
  );
}