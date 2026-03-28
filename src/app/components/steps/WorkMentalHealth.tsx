import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useHealth } from "../../context/HealthContext";
import { ArrowRight, ArrowLeft, Moon } from "lucide-react";
import { motion } from "motion/react";

interface SleepSliderProps {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  hint?: string;
  onChange: (v: number) => void;
  displayValue?: string;
}

function SleepSlider({ label, unit, value, min, max, step = 1, hint, onChange, displayValue }: SleepSliderProps) {
  return (
    <div className="p-4 bg-gradient-to-r from-sky-50 to-teal-50 rounded-xl border border-teal-100">
      <label className="block text-sm font-semibold text-[#1F2937] mb-2">{label}</label>
      <div className="text-center mb-2">
        <span className="text-3xl font-bold text-[#2EC4B6]">{displayValue ?? value}</span>
        <span className="text-sm text-[#6B7280] ml-2">{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
        className="w-full h-2 bg-gradient-to-r from-sky-200 to-teal-200 rounded-full appearance-none cursor-pointer"
      />
      {hint && <p className="text-xs text-[#6B7280] mt-1.5 text-center">{hint}</p>}
    </div>
  );
}

function minutesToHM(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export function WorkMentalHealth() {
  const navigate = useNavigate();
  const { healthData, updateHealthData, addChatMessage } = useHealth();

  const [formData, setFormData] = useState({
    total_sleep_minutes: healthData.total_sleep_minutes ?? 420,
    time_in_bed_minutes: healthData.time_in_bed_minutes ?? 450,
    deep_sleep_pct: healthData.deep_sleep_pct ?? 20,
    rem_sleep_pct: healthData.rem_sleep_pct ?? 22,
    latency_minutes: healthData.latency_minutes ?? 12,
    consistency_variance: healthData.consistency_variance ?? 0.3,
  });

  const sleepEfficiency = formData.time_in_bed_minutes > 0
    ? Math.round((formData.total_sleep_minutes / formData.time_in_bed_minutes) * 100)
    : 0;

  useEffect(() => {
    addChatMessage({
      role: "ai",
      content: "😴 Sleep architecture is a powerful predictor of metabolic, cardiovascular, and mental health. These values can be obtained from a sleep tracker or polysomnography report. Estimates are acceptable.",
    });
  }, []);

  const handleNext = () => {
    updateHealthData(formData);
    const flags: string[] = [];
    if (formData.total_sleep_minutes < 360) flags.push(`short sleep (${minutesToHM(formData.total_sleep_minutes)} total)`);
    if (sleepEfficiency < 75) flags.push(`low sleep efficiency (${sleepEfficiency}%)`);
    if (formData.deep_sleep_pct < 13) flags.push("insufficient deep sleep");
    if (formData.latency_minutes >= 30) flags.push(`prolonged sleep onset (${formData.latency_minutes} min)`);
    if (formData.consistency_variance >= 1) flags.push("inconsistent sleep schedule");

    addChatMessage({
      role: "ai",
      content: flags.length
        ? `⚠️ Sleep concerns: ${flags.join(", ")}. This will increase your sleep and metabolic risk scores. Last step — mental health indicators.`
        : `✅ Sleep profile looks healthy (efficiency: ${sleepEfficiency}%). Let's complete the final step — mental health assessment.`,
    });
    navigate("/history");
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-teal-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] rounded-full flex items-center justify-center shadow-sm">
            <Moon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1F2937]">Sleep Analysis</h2>
            <p className="text-sm text-[#6B7280]">Sleep architecture and quality metrics</p>
          </div>
        </div>
      </div>

      {/* Sleep Efficiency Badge */}
      <div className="mb-5 p-3 rounded-xl border flex items-center justify-between bg-white/80 border-teal-200">
        <span className="text-sm font-semibold text-[#1F2937]">Sleep Efficiency</span>
        <span className={`text-2xl font-bold ${sleepEfficiency >= 85 ? "text-green-600" : sleepEfficiency >= 75 ? "text-yellow-600" : "text-red-500"}`}>
          {sleepEfficiency}%
          <span className="text-xs font-normal text-[#6B7280] ml-1">(sleep ÷ time-in-bed)</span>
        </span>
      </div>

      <div className="space-y-4">
        <SleepSlider
          label="Total Sleep Duration (total_sleep_minutes)"
          unit=""
          value={formData.total_sleep_minutes}
          min={120}
          max={600}
          step={10}
          onChange={(v) => setFormData({ ...formData, total_sleep_minutes: v })}
          displayValue={minutesToHM(formData.total_sleep_minutes)}
          hint={`${formData.total_sleep_minutes < 360 ? "🔴 < 6h — significant risk" : formData.total_sleep_minutes < 420 ? "⚠️ 6–7h — below optimal" : "✅ 7–10h optimal range"}`}
        />
        <SleepSlider
          label="Time Spent In Bed (time_in_bed_minutes)"
          unit=""
          value={formData.time_in_bed_minutes}
          min={180}
          max={720}
          step={10}
          onChange={(v) => setFormData({ ...formData, time_in_bed_minutes: v })}
          displayValue={minutesToHM(formData.time_in_bed_minutes)}
        />
        <div className="grid grid-cols-2 gap-4">
          <SleepSlider
            label="Deep Sleep %"
            unit="%"
            value={formData.deep_sleep_pct}
            min={0}
            max={40}
            onChange={(v) => setFormData({ ...formData, deep_sleep_pct: v })}
            hint="Optimal: 13–23%"
          />
          <SleepSlider
            label="REM Sleep %"
            unit="%"
            value={formData.rem_sleep_pct}
            min={0}
            max={40}
            onChange={(v) => setFormData({ ...formData, rem_sleep_pct: v })}
            hint="Optimal: 20–25%"
          />
        </div>
        <SleepSlider
          label="Sleep Onset Latency (latency_minutes)"
          unit="min"
          value={formData.latency_minutes}
          min={0}
          max={120}
          onChange={(v) => setFormData({ ...formData, latency_minutes: v })}
          hint={`${formData.latency_minutes < 20 ? "✅ Normal" : formData.latency_minutes < 45 ? "⚠️ Slightly delayed" : "🔴 Insomnia indicator"}`}
        />
        <SleepSlider
          label="Schedule Consistency Variance (consistency_variance)"
          unit=""
          value={formData.consistency_variance}
          min={0}
          max={3}
          step={0.1}
          onChange={(v) => setFormData({ ...formData, consistency_variance: parseFloat(v.toFixed(1)) })}
          displayValue={formData.consistency_variance.toFixed(1)}
          hint={`${formData.consistency_variance < 0.5 ? "✅ Very consistent" : formData.consistency_variance < 1 ? "⚠️ Some variability" : "🔴 Highly irregular schedule"}`}
        />
      </div>

      <div className="mt-8 flex justify-between">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/habits")}
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
