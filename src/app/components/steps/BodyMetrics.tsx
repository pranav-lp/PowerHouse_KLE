import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useHealth } from "../../context/HealthContext";
import { ArrowRight, ArrowLeft, Activity } from "lucide-react";
import { motion } from "motion/react";

function SliderField({
  label,
  unit,
  value,
  min,
  max,
  step = 1,
  onChange,
  hint,
  color = "teal",
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  hint?: string;
  color?: string;
}) {
  return (
    <div className="p-5 bg-gradient-to-r from-sky-50 to-teal-50 rounded-xl border border-teal-100">
      <label className="block text-sm font-semibold text-[#1F2937] mb-2">{label}</label>
      <div className="text-center mb-3">
        <span className="text-4xl font-bold text-[#2EC4B6]">{typeof value === "number" ? value : "—"}</span>
        <span className="text-lg text-[#6B7280] ml-2">{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
        className="w-full h-2 bg-gradient-to-r from-sky-200 to-teal-200 rounded-full appearance-none cursor-pointer"
      />
      {hint && <p className="text-xs text-[#6B7280] mt-2 text-center">{hint}</p>}
    </div>
  );
}

export function BodyMetrics() {
  const navigate = useNavigate();
  const { healthData, updateHealthData, addChatMessage } = useHealth();

  const [formData, setFormData] = useState({
    weight: healthData.weight ?? 70,
    height: healthData.height ?? 170,
    trestbps: healthData.trestbps ?? 120,
    thalach: healthData.thalach ?? 150,
  });

  const bmi = (formData.weight / Math.pow(formData.height / 100, 2));
  const bmiLabel = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy" : bmi < 30 ? "Overweight" : "Obese";
  const bmiColor = bmi < 25 ? "text-green-600" : bmi < 30 ? "text-yellow-600" : "text-red-500";

  useEffect(() => {
    addChatMessage({
      role: "ai",
      content: "📏 Body measurements and vital signs form the foundation of cardiovascular risk assessment. I'll compute your BMI from your weight and height.",
    });
  }, []);

  const handleNext = () => {
    const computedBmi = parseFloat(bmi.toFixed(1));
    updateHealthData({ ...formData, bmi: computedBmi });

    let msg = `BMI: ${computedBmi} (${bmiLabel}). Resting BP: ${formData.trestbps} mmHg. Max HR: ${formData.thalach} bpm. `;
    if (formData.trestbps >= 140) msg += "Elevated blood pressure — a key cardiovascular risk factor. ";
    if (formData.thalach < 130) msg += "Lower max heart rate may reflect reduced cardiac fitness. ";
    msg += "Now let's review your cardiac panel data.";

    addChatMessage({ role: "ai", content: msg });
    navigate("/lifestyle");
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-teal-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] rounded-full flex items-center justify-center shadow-sm">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1F2937]">Body & Vital Signs</h2>
            <p className="text-sm text-[#6B7280]">Physical measurements and cardiovascular vitals</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* Weight & Height side by side */}
        <div className="grid grid-cols-2 gap-4">
          <SliderField
            label="Weight"
            unit="kg"
            value={formData.weight}
            min={40}
            max={200}
            onChange={(v) => setFormData({ ...formData, weight: v })}
          />
          <SliderField
            label="Height"
            unit="cm"
            value={formData.height}
            min={140}
            max={220}
            onChange={(v) => setFormData({ ...formData, height: v })}
          />
        </div>

        {/* Computed BMI display */}
        <div className="p-4 bg-white/80 rounded-xl border border-teal-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#1F2937]">Computed BMI</p>
            <p className="text-xs text-[#6B7280]">weight(kg) ÷ height(m)²</p>
          </div>
          <div className="text-right">
            <span className={`text-3xl font-bold ${bmiColor}`}>{bmi.toFixed(1)}</span>
            <p className={`text-xs font-semibold ${bmiColor}`}>{bmiLabel}</p>
          </div>
        </div>

        {/* Resting Blood Pressure */}
        <SliderField
          label="Resting Blood Pressure (trestbps)"
          unit="mmHg"
          value={formData.trestbps}
          min={80}
          max={200}
          onChange={(v) => setFormData({ ...formData, trestbps: v })}
          hint={`${formData.trestbps < 120 ? "✅ Normal" : formData.trestbps < 130 ? "⚠️ Elevated" : formData.trestbps < 140 ? "⚠️ Stage 1 Hypertension" : "🔴 Stage 2 Hypertension"} — Systolic blood pressure at rest`}
        />

        {/* Max Heart Rate */}
        <SliderField
          label="Max Heart Rate Achieved (thalach)"
          unit="bpm"
          value={formData.thalach}
          min={60}
          max={220}
          onChange={(v) => setFormData({ ...formData, thalach: v })}
          hint={`${formData.thalach >= 150 ? "✅ Good cardiac capacity" : formData.thalach >= 130 ? "⚠️ Reduced capacity" : "🔴 Significantly reduced"} — Max HR from exercise test or estimation`}
        />
      </div>

      <div className="mt-8 flex justify-between">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/")}
          className="px-8 py-3 bg-slate-100 text-[#1F2937] rounded-full font-semibold flex items-center gap-2 hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className="px-8 py-3 bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] text-white rounded-full font-semibold flex items-center gap-2 hover:shadow-[0_6px_20px_rgba(46,196,182,0.3)] transition-shadow"
        >
          Next Step
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}
