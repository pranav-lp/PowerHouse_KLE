import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useHealth } from "../../context/HealthContext";
import { ArrowRight, ArrowLeft, Wind } from "lucide-react";
import { motion } from "motion/react";

type SmokingStatus = "never" | "current" | "ex";

export function Diet() {
  const navigate = useNavigate();
  const { healthData, updateHealthData, addChatMessage } = useHealth();

  // Determine initial smoking status from stored data
  const initStatus: SmokingStatus =
    healthData.is_smoker === 1 ? "current"
    : (healthData.duration ?? 0) > 0 && (healthData.years_quit ?? 0) > 0 ? "ex"
    : "never";

  const [smokingStatus, setSmokingStatus] = useState<SmokingStatus>(initStatus);
  const [formData, setFormData] = useState({
    duration: healthData.duration ?? 0,
    years_quit: healthData.years_quit ?? 0,
    copd: healthData.copd as 0 | 1 | undefined,
    family_hx: healthData.family_hx as 0 | 1 | undefined,
  });

  useEffect(() => {
    addChatMessage({
      role: "ai",
      content: "🫁 Smoking history and lung health are critical factors for cardiovascular and pulmonary risk. Please provide accurate information — your past history matters as much as your current status.",
    });
  }, []);

  const handleNext = () => {
    const is_smoker: 0 | 1 = smokingStatus === "current" ? 1 : 0;
    const duration = smokingStatus === "never" ? 0 : formData.duration;
    const years_quit = smokingStatus === "ex" ? formData.years_quit : 0;

    updateHealthData({ is_smoker, duration, years_quit, copd: formData.copd, family_hx: formData.family_hx });

    const msgs = [];
    if (smokingStatus === "current") msgs.push(`Active smoker — ${duration} years. Highest preventable risk factor for heart, lung, and liver disease.`);
    else if (smokingStatus === "ex") msgs.push(`Ex-smoker — smoked ${duration} years, quit ${years_quit} years ago. Risk is declining but remains elevated.`);
    if (formData.copd === 1) msgs.push("COPD diagnosis noted — significant pulmonary risk factor.");
    if (formData.family_hx === 1) msgs.push("Family history of heart disease increases genetic cardiovascular risk.");

    addChatMessage({
      role: "ai",
      content: msgs.length ? msgs.join(" ") + " Let's now look at your blood and liver markers." : "✅ No significant smoking or lung risk factors noted. Moving to blood and liver markers.",
    });
    navigate("/habits");
  };

  const isValid = formData.copd !== undefined && formData.family_hx !== undefined;

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-teal-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] rounded-full flex items-center justify-center shadow-sm">
            <Wind className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1F2937]">Smoking & Lung Health</h2>
            <p className="text-sm text-[#6B7280]">Tobacco history and pulmonary status</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Smoking Status */}
        <div>
          <label className="block text-sm font-semibold text-[#1F2937] mb-3">Smoking Status</label>
          <div className="grid grid-cols-3 gap-3">
            {([
              { value: "never" as SmokingStatus, emoji: "🚫", label: "Never Smoked" },
              { value: "current" as SmokingStatus, emoji: "🚬", label: "Current Smoker" },
              { value: "ex" as SmokingStatus, emoji: "🔄", label: "Ex-Smoker" },
            ]).map((opt) => (
              <motion.button
                key={opt.value}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setSmokingStatus(opt.value);
                  if (opt.value === "never") setFormData({ ...formData, duration: 0, years_quit: 0 });
                  if (opt.value === "current") setFormData({ ...formData, years_quit: 0 });
                }}
                className={`p-5 rounded-xl border-2 transition-all ${
                  smokingStatus === opt.value
                    ? "border-[#2EC4B6] bg-gradient-to-r from-sky-50 to-teal-50 shadow-sm"
                    : "border-slate-200 hover:border-teal-200"
                }`}
              >
                <div className="text-3xl mb-2">{opt.emoji}</div>
                <div className="text-sm font-semibold">{opt.label}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Duration slider — show for current or ex smoker */}
        {(smokingStatus === "current" || smokingStatus === "ex") && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200"
          >
            <label className="block text-sm font-semibold text-[#1F2937] mb-2">
              Years Smoked <span className="text-[#6B7280] font-normal text-xs">(duration)</span>:
              <span className="text-orange-600 ml-2">{formData.duration} years</span>
            </label>
            <input
              type="range" min={1} max={55} value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full h-2 bg-gradient-to-r from-orange-200 to-red-200 rounded-full appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1"><span>1</span><span>55</span></div>
          </motion.div>
        )}

        {/* Years quit — show for ex-smoker */}
        {smokingStatus === "ex" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-gradient-to-r from-yellow-50 to-lime-50 rounded-xl border border-yellow-200"
          >
            <label className="block text-sm font-semibold text-[#1F2937] mb-2">
              Years Since Quitting <span className="text-[#6B7280] font-normal text-xs">(years_quit)</span>:
              <span className="text-lime-600 ml-2">{formData.years_quit} years</span>
            </label>
            <input
              type="range" min={1} max={50} value={formData.years_quit}
              onChange={(e) => setFormData({ ...formData, years_quit: parseInt(e.target.value) })}
              className="w-full h-2 bg-gradient-to-r from-yellow-200 to-lime-200 rounded-full appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1"><span>1</span><span>50</span></div>
          </motion.div>
        )}

        {/* COPD */}
        <div>
          <label className="block text-sm font-semibold text-[#1F2937] mb-2">
            Diagnosed with COPD? <span className="text-[#6B7280] font-normal text-xs">(copd)</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[{ value: 0 as const, label: "No", emoji: "✅" }, { value: 1 as const, label: "Yes", emoji: "🫁" }].map((opt) => (
              <motion.button
                key={opt.value}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFormData({ ...formData, copd: opt.value })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.copd === opt.value
                    ? "border-[#2EC4B6] bg-gradient-to-r from-sky-50 to-teal-50 shadow-sm"
                    : "border-slate-200 hover:border-teal-200"
                }`}
              >
                <div className="text-2xl mb-1">{opt.emoji}</div>
                <div className="text-sm font-semibold">{opt.label}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Family History of Heart Disease */}
        <div>
          <label className="block text-sm font-semibold text-[#1F2937] mb-2">
            Family History of Heart Disease? <span className="text-[#6B7280] font-normal text-xs">(family_hx)</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[{ value: 0 as const, label: "No", emoji: "✅" }, { value: 1 as const, label: "Yes", emoji: "❤️‍🩹" }].map((opt) => (
              <motion.button
                key={opt.value}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFormData({ ...formData, family_hx: opt.value })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.family_hx === opt.value
                    ? "border-[#2EC4B6] bg-gradient-to-r from-sky-50 to-teal-50 shadow-sm"
                    : "border-slate-200 hover:border-teal-200"
                }`}
              >
                <div className="text-2xl mb-1">{opt.emoji}</div>
                <div className="text-sm font-semibold">{opt.label}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/exercise")}
          className="px-8 py-3 bg-slate-100 text-[#1F2937] rounded-full font-semibold flex items-center gap-2 hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          disabled={!isValid}
          className="px-8 py-3 bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] text-white rounded-full font-semibold flex items-center gap-2 hover:shadow-[0_6px_20px_rgba(46,196,182,0.3)] transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Step
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}
