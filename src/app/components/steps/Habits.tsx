import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useHealth } from "../../context/HealthContext";
import { ArrowRight, ArrowLeft, Droplets } from "lucide-react";
import { motion } from "motion/react";

interface LabSliderProps {
  label: string;
  fieldKey: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  normalRange: string;
  isAbnormal: boolean;
  onChange: (v: number) => void;
}

function LabSlider({ label, unit, value, min, max, step = 1, normalRange, isAbnormal, onChange }: LabSliderProps) {
  return (
    <div className="p-4 bg-gradient-to-r from-sky-50 to-teal-50 rounded-xl border border-teal-100">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-[#1F2937]">{label}</label>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isAbnormal ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
          {isAbnormal ? "⚠️ Abnormal" : "✅ Normal"}
        </span>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className={`text-3xl font-bold ${isAbnormal ? "text-red-500" : "text-[#2EC4B6]"}`}>{value}</span>
        <span className="text-sm text-[#6B7280]">{unit}</span>
        <span className="text-xs text-slate-400 ml-auto">Normal: {normalRange}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
        className="w-full h-2 bg-gradient-to-r from-sky-200 to-teal-200 rounded-full appearance-none cursor-pointer"
      />
    </div>
  );
}

export function Habits() {
  const navigate = useNavigate();
  const { healthData, updateHealthData, addChatMessage } = useHealth();

  const [formData, setFormData] = useState({
    ast: healthData.ast ?? 22,
    alt: healthData.alt ?? 22,
    platelets: healthData.platelets ?? 260,
    glucose: healthData.glucose ?? 90,
    triglycerides: healthData.triglycerides ?? 120,
    hdl: healthData.hdl ?? 55,
  });

  useEffect(() => {
    addChatMessage({
      role: "ai",
      content: "🩸 Blood and liver panel values reveal metabolic health, liver function, and diabetes risk. Please use your most recent lab results. Normal ranges are displayed beside each marker.",
    });
  }, []);

  const handleNext = () => {
    updateHealthData(formData);
    const flags: string[] = [];
    if (formData.ast >= 60 || formData.alt >= 60) flags.push(`elevated liver enzymes (AST ${formData.ast}, ALT ${formData.alt})`);
    if (formData.platelets < 150) flags.push(`low platelets (${formData.platelets}k — possible fibrosis indicator)`);
    if (formData.glucose >= 100) flags.push(`elevated glucose (${formData.glucose} mg/dL)`);
    if (formData.triglycerides >= 200) flags.push(`high triglycerides (${formData.triglycerides} mg/dL)`);
    if (formData.hdl < 40) flags.push(`low HDL (${formData.hdl} mg/dL — protective cholesterol low)`);
    addChatMessage({
      role: "ai",
      content: flags.length
        ? `⚠️ Lab flags: ${flags.join("; ")}. These are important for liver and metabolic risk scoring. Moving to your sleep data now.`
        : "✅ Your blood and liver markers are within normal ranges. Let's continue with your sleep analysis.",
    });
    navigate("/work-mental-health");
  };

  const labFields = [
    { key: "ast", label: "AST (Aspartate Aminotransferase)", unit: "U/L", min: 5, max: 200, normal: "10–40 U/L", abnormal: formData.ast > 40 },
    { key: "alt", label: "ALT (Alanine Aminotransferase)", unit: "U/L", min: 5, max: 200, normal: "7–40 U/L", abnormal: formData.alt > 40 },
    { key: "platelets", label: "Platelet Count", unit: "K/µL", min: 50, max: 500, normal: "150–400 K/µL", abnormal: formData.platelets < 150 || formData.platelets > 400 },
    { key: "glucose", label: "Blood Glucose", unit: "mg/dL", min: 60, max: 300, normal: "70–99 mg/dL", abnormal: formData.glucose >= 100 },
    { key: "triglycerides", label: "Triglycerides", unit: "mg/dL", min: 50, max: 500, normal: "<150 mg/dL", abnormal: formData.triglycerides >= 150 },
    { key: "hdl", label: "HDL Cholesterol", unit: "mg/dL", min: 20, max: 100, normal: ">40 mg/dL", abnormal: formData.hdl < 40 },
  ] as const;

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-teal-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] rounded-full flex items-center justify-center shadow-sm">
            <Droplets className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1F2937]">Blood & Liver Lab</h2>
            <p className="text-sm text-[#6B7280]">Metabolic panel and liver function tests</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {labFields.map((field) => (
          <LabSlider
            key={field.key}
            label={field.label}
            fieldKey={field.key}
            unit={field.unit}
            value={formData[field.key]}
            min={field.min}
            max={field.max}
            normalRange={field.normal}
            isAbnormal={field.abnormal}
            onChange={(v) => setFormData({ ...formData, [field.key]: v })}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/diet")}
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
