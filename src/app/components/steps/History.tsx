import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useHealth } from "../../context/HealthContext";
import { ArrowRight, ArrowLeft, Brain } from "lucide-react";
import { motion } from "motion/react";

const phq9Labels = [
  { range: [0, 4],  label: "Minimal", color: "text-green-600", bg: "bg-green-100" },
  { range: [5, 9],  label: "Mild",    color: "text-yellow-600", bg: "bg-yellow-100" },
  { range: [10, 14],label: "Moderate",color: "text-orange-600", bg: "bg-orange-100" },
  { range: [15, 19],label: "Mod-Severe",color:"text-red-500",  bg: "bg-red-100" },
  { range: [20, 27],label: "Severe",  color: "text-red-700",   bg: "bg-red-200" },
];

function getPHQ9Label(score: number) {
  return phq9Labels.find(l => score >= l.range[0] && score <= l.range[1]) ?? phq9Labels[0];
}

interface IndexSliderProps {
  label: string;
  fieldNote: string;
  value: number;
  onChange: (v: number) => void;
  lowLabel: string;
  highLabel: string;
  lowIsGood?: boolean;
}

function IndexSlider({ label, fieldNote, value, onChange, lowLabel, highLabel, lowIsGood = true }: IndexSliderProps) {
  const isGood = lowIsGood ? value < 0.4 : value > 0.6;
  return (
    <div className="p-4 bg-gradient-to-r from-sky-50 to-teal-50 rounded-xl border border-teal-100">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-[#1F2937]">
          {label} <span className="text-[#6B7280] font-normal text-xs">({fieldNote})</span>
        </label>
        <span className="text-xl font-bold text-[#2EC4B6]">{value.toFixed(2)}</span>
      </div>
      <input
        type="range" min={0} max={1} step={0.01} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gradient-to-r from-sky-200 to-teal-200 rounded-full appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

export function History() {
  const navigate = useNavigate();
  const { healthData, updateHealthData, addChatMessage, fetchHealthOutput } = useHealth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    phq9_score: healthData.phq9_score ?? 2,
    late_night_activity: healthData.late_night_activity ?? 0.2,
    social_interaction_index: healthData.social_interaction_index ?? 0.75,
    negative_sentiment_score: healthData.negative_sentiment_score ?? 0.1,
  });

  useEffect(() => {
    addChatMessage({
      role: "ai",
      content: "🧠 The final step: mental health and behavioural indicators. The PHQ-9 is a validated depression screening tool (0–27). Social and behavioural scores reflect lifestyle patterns that affect overall health.",
    });
  }, []);

  const phqMeta = getPHQ9Label(formData.phq9_score);

  const handleSubmit = () => {
    setIsSubmitting(true);
    updateHealthData(formData);
    addChatMessage({
      role: "ai",
      content: `🎯 PHQ-9: ${formData.phq9_score} (${phqMeta.label}). All data collected. Sending your clinical profile to the AI health engine for analysis...`,
    });
    navigate("/loading");
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-teal-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] rounded-full flex items-center justify-center shadow-sm">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1F2937]">Mental Health</h2>
            <p className="text-sm text-[#6B7280]">Psychological and behavioural indicators</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* PHQ-9 Score */}
        <div className="p-5 bg-gradient-to-r from-sky-50 to-teal-50 rounded-xl border border-teal-100">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-[#1F2937]">
              PHQ-9 Depression Score <span className="text-[#6B7280] font-normal text-xs">(phq9_score)</span>
            </label>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${phqMeta.bg} ${phqMeta.color}`}>
              {phqMeta.label}
            </span>
          </div>
          <div className="text-center mb-3">
            <span className={`text-5xl font-bold ${phqMeta.color}`}>{formData.phq9_score}</span>
            <span className="text-lg text-[#6B7280] ml-2">/ 27</span>
          </div>
          <input
            type="range" min={0} max={27} value={formData.phq9_score}
            onChange={(e) => setFormData({ ...formData, phq9_score: parseInt(e.target.value) })}
            className="w-full h-2 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-full appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs mt-2">
            <span className="text-green-600">0 – Minimal</span>
            <span className="text-yellow-600">5–9 Mild</span>
            <span className="text-orange-500">10–14 Mod</span>
            <span className="text-red-500">20+ Severe</span>
          </div>
        </div>

        {/* Late Night Activity */}
        <IndexSlider
          label="Late Night Activity Level"
          fieldNote="late_night_activity"
          value={formData.late_night_activity}
          onChange={(v) => setFormData({ ...formData, late_night_activity: v })}
          lowLabel="0.0 – Rarely active at night"
          highLabel="1.0 – Very active at night"
          lowIsGood={true}
        />

        {/* Social Interaction Index */}
        <IndexSlider
          label="Social Interaction Index"
          fieldNote="social_interaction_index"
          value={formData.social_interaction_index}
          onChange={(v) => setFormData({ ...formData, social_interaction_index: v })}
          lowLabel="0.0 – Socially isolated"
          highLabel="1.0 – Highly social"
          lowIsGood={false}
        />

        {/* Negative Sentiment Score */}
        <IndexSlider
          label="Negative Sentiment Score"
          fieldNote="negative_sentiment_score"
          value={formData.negative_sentiment_score}
          onChange={(v) => setFormData({ ...formData, negative_sentiment_score: v })}
          lowLabel="0.0 – Positive outlook"
          highLabel="1.0 – Highly negative"
          lowIsGood={true}
        />

        {/* Info card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-[#6B7280]">
            💡 These behavioural indices may reflect patterns from wearables, journaling, or personal assessment. They complement clinical data to provide a holistic mental wellbeing profile.
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/work-mental-health")}
          disabled={isSubmitting}
          className="px-8 py-3 bg-slate-100 text-[#1F2937] rounded-full font-semibold flex items-center gap-2 hover:bg-slate-200 transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-8 py-3 bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] text-white rounded-full font-semibold flex items-center gap-2 hover:shadow-[0_6px_20px_rgba(46,196,182,0.3)] transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              Submitting...
            </>
          ) : (
            <>
              Generate Analysis
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
