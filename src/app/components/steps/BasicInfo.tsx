import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useHealth } from "../../context/HealthContext";
import { ArrowRight, User } from "lucide-react";
import { motion } from "motion/react";

const educationLevels = [
  { value: 1, label: "No Schooling", desc: "No formal education" },
  { value: 2, label: "Primary", desc: "Up to grade 8" },
  { value: 3, label: "Secondary", desc: "High school" },
  { value: 4, label: "Graduate", desc: "Bachelor's degree" },
  { value: 5, label: "Postgraduate", desc: "Master's / PhD" },
];

export function BasicInfo() {
  const navigate = useNavigate();
  const { healthData, updateHealthData, addChatMessage } = useHealth();

  const [formData, setFormData] = useState({
    age: healthData.age ?? 35,
    sex: healthData.sex as 0 | 1 | undefined,
    education: healthData.education as number | undefined,
  });

  useEffect(() => {
    addChatMessage({
      role: "ai",
      content: "👋 Let's start with some basic demographic information. Age, biological sex, and education level help calibrate your health risk models.",
    });
  }, []);

  const handleNext = () => {
    updateHealthData(formData);
    addChatMessage({
      role: "ai",
      content: `Got it — ${formData.age}-year-old ${formData.sex === 1 ? "male" : "female"}, education level ${formData.education}. Now let's collect your body measurements and vital signs.`,
    });
    navigate("/body-metrics");
  };

  const isValid = formData.sex !== undefined && formData.education !== undefined;

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-teal-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] rounded-full flex items-center justify-center shadow-sm">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1F2937]">Basic Information</h2>
            <p className="text-sm text-[#6B7280]">Demographic profile</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Age */}
        <div>
          <label className="block text-sm font-semibold text-[#1F2937] mb-2">
            Age: <span className="text-[#2EC4B6]">{formData.age} years</span>
          </label>
          <input
            type="range"
            min="18"
            max="90"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
            className="w-full h-2 bg-gradient-to-r from-sky-100 to-teal-100 rounded-full appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>18</span>
            <span>90</span>
          </div>
        </div>

        {/* Sex */}
        <div>
          <label className="block text-sm font-semibold text-[#1F2937] mb-3">
            Biological Sex
          </label>
          <div className="grid grid-cols-2 gap-4">
            {([{ label: "Male", emoji: "👨", value: 1 as const }, { label: "Female", emoji: "👩", value: 0 as const }] as const).map((opt) => (
              <motion.button
                key={opt.value}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFormData({ ...formData, sex: opt.value })}
                className={`p-6 rounded-xl border-2 transition-all ${
                  formData.sex === opt.value
                    ? "border-[#2EC4B6] bg-gradient-to-r from-sky-50 to-teal-50 shadow-sm"
                    : "border-slate-200 hover:border-teal-200"
                }`}
              >
                <div className="text-4xl mb-2">{opt.emoji}</div>
                <div className="text-lg font-semibold text-[#1F2937]">{opt.label}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Education */}
        <div>
          <label className="block text-sm font-semibold text-[#1F2937] mb-3">
            Highest Education Level
            <span className="text-xs text-[#6B7280] font-normal ml-2">(used for health literacy calibration)</span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {educationLevels.map((lvl) => (
              <motion.button
                key={lvl.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFormData({ ...formData, education: lvl.value })}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  formData.education === lvl.value
                    ? "border-[#2EC4B6] bg-gradient-to-r from-sky-50 to-teal-50 shadow-sm"
                    : "border-slate-200 hover:border-teal-200"
                }`}
              >
                <div className="text-2xl font-bold text-[#2EC4B6] mb-1">{lvl.value}</div>
                <div className="text-xs font-semibold text-[#1F2937] leading-tight">{lvl.label}</div>
                <div className="text-[10px] text-[#6B7280] mt-0.5 hidden sm:block">{lvl.desc}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
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
