import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useHealth } from "../../context/HealthContext";
import { ArrowRight, ArrowLeft, Activity } from "lucide-react";
import { motion } from "motion/react";

const slopeOptions = [
  { value: 2, label: "Upsloping", desc: "Favourable — better prognosis", emoji: "📈" },
  { value: 1, label: "Flat",      desc: "Moderate risk indicator",        emoji: "➡️" },
  { value: 0, label: "Downsloping", desc: "High risk — poor prognosis",  emoji: "📉" },
];

const thalOptions = [
  { value: 2, label: "Normal",           desc: "Normal blood flow",             emoji: "✅" },
  { value: 1, label: "Fixed Defect",     desc: "Permanent perfusion defect",    emoji: "⚠️" },
  { value: 3, label: "Reversible Defect",desc: "Ischaemia on stress",           emoji: "🔴" },
];

export function Exercise() {
  const navigate = useNavigate();
  const { healthData, updateHealthData, addChatMessage } = useHealth();

  const [formData, setFormData] = useState({
    oldpeak: healthData.oldpeak ?? 0.0,
    slope: healthData.slope as number | undefined,
    ca: healthData.ca as number | undefined,
    thal: healthData.thal as number | undefined,
  });

  useEffect(() => {
    addChatMessage({
      role: "ai",
      content: "🫀 These ECG-derived metrics provide detailed insight into cardiac perfusion and ischaemia risk. Values are typically found in your stress test or angiography reports.",
    });
  }, []);

  const handleNext = () => {
    updateHealthData(formData);
    const highRisk = (formData.oldpeak ?? 0) >= 2 || formData.slope === 0 || (formData.ca ?? 0) >= 2 || formData.thal === 3;
    addChatMessage({
      role: "ai",
      content: highRisk
        ? `⚠️ Your ECG results contain high-risk indicators (oldpeak: ${formData.oldpeak}, slope: ${formData.slope === 0 ? "downsloping" : formData.slope === 1 ? "flat" : "upsloping"}, vessels: ${formData.ca}). These will be factored prominently into your cardiac risk score.`
        : `✅ ECG metrics noted. oldpeak: ${formData.oldpeak}, ${formData.ca} vessel(s) involved. Let's move on to your smoking and lung health data.`,
    });
    navigate("/diet");
  };

  const isValid = formData.slope !== undefined && formData.ca !== undefined && formData.thal !== undefined;

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-teal-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] rounded-full flex items-center justify-center shadow-sm">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1F2937]">ECG Results</h2>
            <p className="text-sm text-[#6B7280]">Stress test and angiography findings</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* ST Depression (oldpeak) */}
        <div className="p-5 bg-gradient-to-r from-sky-50 to-teal-50 rounded-xl border border-teal-100">
          <label className="block text-sm font-semibold text-[#1F2937] mb-2">
            ST Depression <span className="text-[#6B7280] font-normal text-xs">(oldpeak — induced by exercise relative to rest)</span>
          </label>
          <div className="text-center mb-3">
            <span className={`text-4xl font-bold ${(formData.oldpeak ?? 0) >= 2 ? "text-red-500" : (formData.oldpeak ?? 0) >= 1 ? "text-yellow-600" : "text-[#2EC4B6]"}`}>
              {formData.oldpeak.toFixed(1)}
            </span>
            <span className="text-lg text-[#6B7280] ml-2">mm</span>
          </div>
          <input
            type="range" min={0} max={6.2} step={0.1}
            value={formData.oldpeak}
            onChange={(e) => setFormData({ ...formData, oldpeak: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gradient-to-r from-sky-200 to-teal-200 rounded-full appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>0 (none)</span>
            <span className="text-yellow-600">≥1.0 moderate</span>
            <span>6.2</span>
          </div>
        </div>

        {/* Slope */}
        <div>
          <label className="block text-sm font-semibold text-[#1F2937] mb-3">
            Slope of Peak Exercise ST Segment <span className="text-[#6B7280] font-normal text-xs">(slope)</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {slopeOptions.map((opt) => (
              <motion.button
                key={opt.value}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFormData({ ...formData, slope: opt.value })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.slope === opt.value
                    ? "border-[#2EC4B6] bg-gradient-to-r from-sky-50 to-teal-50 shadow-sm"
                    : "border-slate-200 hover:border-teal-200"
                }`}
              >
                <div className="text-2xl mb-1">{opt.emoji}</div>
                <div className="text-xs font-semibold">{opt.label}</div>
                <div className="text-[10px] text-[#6B7280]">{opt.desc}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Number of major vessels (ca) */}
        <div>
          <label className="block text-sm font-semibold text-[#1F2937] mb-3">
            Major Vessels Coloured by Fluoroscopy <span className="text-[#6B7280] font-normal text-xs">(ca: 0–3)</span>
          </label>
          <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((v) => (
              <motion.button
                key={v}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFormData({ ...formData, ca: v })}
                className={`p-5 rounded-xl border-2 transition-all ${
                  formData.ca === v
                    ? "border-[#2EC4B6] bg-gradient-to-r from-sky-50 to-teal-50 shadow-sm"
                    : "border-slate-200 hover:border-teal-200"
                }`}
              >
                <div className={`text-3xl font-bold mb-1 ${v === 0 ? "text-[#2EC4B6]" : v === 1 ? "text-yellow-500" : v === 2 ? "text-orange-500" : "text-red-500"}`}>{v}</div>
                <div className="text-xs text-[#6B7280]">{v === 0 ? "None" : `${v} vessel${v > 1 ? "s" : ""}`}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Thalassemia (thal) */}
        <div>
          <label className="block text-sm font-semibold text-[#1F2937] mb-3">
            Thalassemia Result <span className="text-[#6B7280] font-normal text-xs">(thal)</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {thalOptions.map((opt) => (
              <motion.button
                key={opt.value}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFormData({ ...formData, thal: opt.value })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.thal === opt.value
                    ? "border-[#2EC4B6] bg-gradient-to-r from-sky-50 to-teal-50 shadow-sm"
                    : "border-slate-200 hover:border-teal-200"
                }`}
              >
                <div className="text-2xl mb-1">{opt.emoji}</div>
                <div className="text-xs font-semibold">{opt.label}</div>
                <div className="text-[10px] text-[#6B7280]">{opt.desc}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/lifestyle")}
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
