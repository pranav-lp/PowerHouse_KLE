import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useHealth } from "../../context/HealthContext";
import { ArrowRight, ArrowLeft, Heart } from "lucide-react";
import { motion } from "motion/react";

const chestPainOptions = [
  { value: 0, label: "Typical Angina", desc: "Classic chest pain on exertion relieved by rest", emoji: "💔" },
  { value: 1, label: "Atypical Angina", desc: "Chest discomfort, not classic presentation", emoji: "😮‍💨" },
  { value: 2, label: "Non-Anginal", desc: "Chest pain not related to heart", emoji: "🫁" },
  { value: 3, label: "Asymptomatic", desc: "No chest pain / pain-free", emoji: "✅" },
];

const restecgOptions = [
  { value: 0, label: "Normal", desc: "Normal ECG", emoji: "✅" },
  { value: 1, label: "ST-T Abnormality", desc: "ST-T wave changes", emoji: "⚠️" },
  { value: 2, label: "LV Hypertrophy", desc: "Left ventricular hypertrophy", emoji: "🔴" },
];

export function Lifestyle() {
  const navigate = useNavigate();
  const { healthData, updateHealthData, addChatMessage } = useHealth();

  const [formData, setFormData] = useState({
    cp: healthData.cp as number | undefined,
    chol: healthData.chol ?? 200,
    fbs: healthData.fbs as 0 | 1 | undefined,
    restecg: healthData.restecg as number | undefined,
    exang: healthData.exang as 0 | 1 | undefined,
  });

  useEffect(() => {
    addChatMessage({
      role: "ai",
      content: "❤️ Now let's review your cardiac panel. These clinical indicators are key inputs for your cardiovascular risk model. Please enter values from your most recent health records.",
    });
  }, []);

  const handleNext = () => {
    updateHealthData(formData);
    const flags = [];
    if ((formData.chol ?? 200) >= 240) flags.push(`elevated cholesterol (${formData.chol} mg/dL)`);
    if (formData.fbs === 1) flags.push("fasting blood sugar > 120 mg/dL");
    if (formData.exang === 1) flags.push("exercise-induced angina");
    if (formData.restecg === 2) flags.push("LV hypertrophy on ECG");
    addChatMessage({
      role: "ai",
      content: flags.length
        ? `⚠️ Cardiac flags noted: ${flags.join(", ")}. These are important inputs for your heart risk assessment. Let's collect your ECG result details next.`
        : "✅ Cardiac panel looks generally within range. Let's continue with your ECG results.",
    });
    navigate("/exercise");
  };

  const isValid = formData.cp !== undefined && formData.fbs !== undefined && formData.restecg !== undefined && formData.exang !== undefined;

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-teal-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] rounded-full flex items-center justify-center shadow-sm">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1F2937]">Cardiac Panel</h2>
            <p className="text-sm text-[#6B7280]">Heart-related clinical indicators</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Chest Pain Type */}
        <div>
          <label className="block text-sm font-semibold text-[#1F2937] mb-3">
            Chest Pain Type <span className="text-[#6B7280] font-normal text-xs">(cp)</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {chestPainOptions.map((opt) => (
              <motion.button
                key={opt.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFormData({ ...formData, cp: opt.value })}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  formData.cp === opt.value
                    ? "border-[#2EC4B6] bg-gradient-to-r from-sky-50 to-teal-50 shadow-sm"
                    : "border-slate-200 hover:border-teal-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{opt.emoji}</span>
                  <span className="text-sm font-semibold text-[#1F2937]">{opt.label}</span>
                </div>
                <p className="text-xs text-[#6B7280]">{opt.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Cholesterol */}
        <div className="p-5 bg-gradient-to-r from-sky-50 to-teal-50 rounded-xl border border-teal-100">
          <label className="block text-sm font-semibold text-[#1F2937] mb-2">
            Serum Cholesterol <span className="text-[#6B7280] font-normal text-xs">(chol)</span>
          </label>
          <div className="text-center mb-3">
            <span className={`text-4xl font-bold ${formData.chol >= 240 ? "text-red-500" : formData.chol >= 200 ? "text-yellow-600" : "text-[#2EC4B6]"}`}>
              {formData.chol}
            </span>
            <span className="text-lg text-[#6B7280] ml-2">mg/dL</span>
          </div>
          <input
            type="range" min={100} max={400} value={formData.chol}
            onChange={(e) => setFormData({ ...formData, chol: parseInt(e.target.value) })}
            className="w-full h-2 bg-gradient-to-r from-sky-200 to-teal-200 rounded-full appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>100</span>
            <span className="text-green-600">✓ &lt;200 optimal</span>
            <span>400</span>
          </div>
        </div>

        {/* Fasting Blood Sugar */}
        <div>
          <label className="block text-sm font-semibold text-[#1F2937] mb-2">
            Fasting Blood Sugar &gt; 120 mg/dL? <span className="text-[#6B7280] font-normal text-xs">(fbs)</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[{ value: 0 as const, label: "No", emoji: "✅", desc: "FBS ≤ 120 mg/dL" }, { value: 1 as const, label: "Yes", emoji: "🔴", desc: "FBS > 120 mg/dL" }].map((opt) => (
              <motion.button
                key={opt.value}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFormData({ ...formData, fbs: opt.value })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.fbs === opt.value
                    ? "border-[#2EC4B6] bg-gradient-to-r from-sky-50 to-teal-50 shadow-sm"
                    : "border-slate-200 hover:border-teal-200"
                }`}
              >
                <div className="text-2xl mb-1">{opt.emoji}</div>
                <div className="text-sm font-semibold">{opt.label}</div>
                <div className="text-xs text-[#6B7280]">{opt.desc}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Resting ECG */}
        <div>
          <label className="block text-sm font-semibold text-[#1F2937] mb-3">
            Resting ECG Result <span className="text-[#6B7280] font-normal text-xs">(restecg)</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {restecgOptions.map((opt) => (
              <motion.button
                key={opt.value}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFormData({ ...formData, restecg: opt.value })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.restecg === opt.value
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

        {/* Exercise Induced Angina */}
        <div>
          <label className="block text-sm font-semibold text-[#1F2937] mb-2">
            Exercise Induced Angina? <span className="text-[#6B7280] font-normal text-xs">(exang)</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[{ value: 0 as const, label: "No", emoji: "✅", desc: "No angina on exertion" }, { value: 1 as const, label: "Yes", emoji: "⚠️", desc: "Chest pain during exercise" }].map((opt) => (
              <motion.button
                key={opt.value}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFormData({ ...formData, exang: opt.value })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.exang === opt.value
                    ? "border-[#2EC4B6] bg-gradient-to-r from-sky-50 to-teal-50 shadow-sm"
                    : "border-slate-200 hover:border-teal-200"
                }`}
              >
                <div className="text-2xl mb-1">{opt.emoji}</div>
                <div className="text-sm font-semibold">{opt.label}</div>
                <div className="text-xs text-[#6B7280]">{opt.desc}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/body-metrics")}
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
