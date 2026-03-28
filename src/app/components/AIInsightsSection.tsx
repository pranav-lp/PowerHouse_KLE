import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Info,
  Target,
  FileJson,
  Plus,
  Minus,
  Brain,
  ClipboardList,
  Zap,
  Send,
  Eye,
  EyeOff,
  BadgeCheck,
} from "lucide-react";
import { useHealth } from "../context/HealthContext";
import { HealthData } from "../context/HealthContext";

// ── Verified Medical Facts ────────────────────────────────────────────────────

interface HealthFact {
  id: string;
  keywords: string[];
  source: string;
  org: string;
  url: string;
  factStatement: string;
  getReasoning: (data: HealthData) => string | null;
}

const VERIFIED_FACTS: HealthFact[] = [
  {
    id: "exercise",
    keywords: ["exercise", "physical activity", "workout", "walk", "aerobic", "activity", "steps", "sedentary", "move", "gym", "cardio", "fitness"],
    source: "WHO Physical Activity Guidelines 2020",
    org: "WHO",
    url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity",
    factStatement: "Adults should do at least 150 minutes of moderate-intensity aerobic activity per week.",
    getReasoning: (data) => {
      const parts: string[] = [];
      if ((data.bmi ?? 22) >= 30) parts.push(`Your BMI of ${(data.bmi ?? 22).toFixed(1)} indicates obesity, strongly associated with sedentary behaviour and reduced cardiorespiratory fitness.`);
      if ((data.thalach ?? 150) < 130) parts.push(`Max heart rate of ${data.thalach} bpm is lower than expected, suggesting reduced cardiovascular fitness improvable with regular aerobic exercise.`);
      if ((data.trestbps ?? 120) >= 140) parts.push("Regular aerobic exercise can lower systolic blood pressure by 5–8 mmHg in hypertensive individuals.");
      return parts.length ? parts.join(" ") : null;
    },
  },
  {
    id: "blood_pressure",
    keywords: ["blood pressure", "hypertension", "bp", "cardiovascular", "heart", "sodium", "salt", "trestbps"],
    source: "American Heart Association 2017 Guidelines",
    org: "AHA",
    url: "https://www.heart.org/en/health-topics/high-blood-pressure",
    factStatement: "Blood pressure above 130/80 mmHg is classified as hypertension and significantly raises heart disease and stroke risk.",
    getReasoning: (data) => {
      const parts: string[] = [];
      if ((data.trestbps ?? 120) >= 140) parts.push(`Your resting BP of ${data.trestbps} mmHg is Stage 2 Hypertension — significantly elevating risk of stroke, heart attack, and kidney disease.`);
      else if ((data.trestbps ?? 120) >= 130) parts.push(`Resting BP of ${data.trestbps} mmHg is Stage 1 Hypertension per AHA 2017 guidelines.`);
      if (data.family_hx === 1) parts.push("Family history of heart disease suggests genetic predisposition to hypertension and cardiovascular events.");
      if (data.is_smoker === 1) parts.push("Active smoking causes acute vasoconstriction and chronically elevates resting blood pressure.");
      if ((data.chol ?? 200) >= 240) parts.push(`Elevated cholesterol (${data.chol} mg/dL) combined with hypertension multiplies cardiovascular risk significantly.`);
      return parts.length ? parts.join(" ") : null;
    },
  },
  {
    id: "bmi",
    keywords: ["bmi", "weight", "obesity", "overweight", "body mass", "lose weight", "fat", "waist"],
    source: "NIH National Heart, Lung, and Blood Institute",
    org: "NIH",
    url: "https://www.nhlbi.nih.gov/health/educational/lose_wt/BMI/bmicalc.htm",
    factStatement: "A BMI between 18.5–24.9 is considered healthy weight. BMI ≥ 25 is overweight; ≥ 30 is obese.",
    getReasoning: (data) => {
      if (!data.bmi) return null;
      const parts: string[] = [`Your BMI is ${data.bmi.toFixed(1)}.`];
      if (data.bmi >= 30) parts.push("This falls in the obese range (≥ 30), significantly raising risk of type 2 diabetes, hypertension, heart disease, sleep apnea, and NAFLD.");
      else if (data.bmi >= 25) parts.push("This falls in the overweight range (25–29.9), raising metabolic and cardiovascular risk.");
      if ((data.triglycerides ?? 120) >= 200) parts.push(`High triglycerides (${data.triglycerides} mg/dL) combined with elevated BMI strongly indicates metabolic syndrome.`);
      return parts.join(" ");
    },
  },
  {
    id: "diabetes",
    keywords: ["blood sugar", "glucose", "diabetes", "insulin", "sugar", "a1c", "metabolic", "glycemic", "fasting"],
    source: "American Diabetes Association",
    org: "ADA",
    url: "https://www.diabetes.org/diabetes/a1c/diagnosis",
    factStatement: "Fasting blood glucose above 126 mg/dL indicates diabetes. Values 100–125 mg/dL indicate prediabetes.",
    getReasoning: (data) => {
      const parts: string[] = [];
      if ((data.glucose ?? 90) >= 126) parts.push(`Blood glucose of ${data.glucose} mg/dL meets the diagnostic threshold for diabetes (≥ 126 mg/dL).`);
      else if ((data.glucose ?? 90) >= 100) parts.push(`Blood glucose of ${data.glucose} mg/dL falls in the prediabetes range — intervention now can prevent progression.`);
      if (data.fbs === 1) parts.push("Fasting blood sugar exceeds 120 mg/dL — a significant metabolic red flag.");
      if ((data.bmi ?? 22) >= 25) parts.push(`BMI of ${(data.bmi ?? 22).toFixed(1)} increases insulin resistance risk, a precursor to type 2 diabetes.`);
      if ((data.triglycerides ?? 120) >= 200) parts.push(`Hypertriglyceridaemia (${data.triglycerides} mg/dL) is a hallmark of insulin resistance and metabolic dysfunction.`);
      return parts.length ? parts.join(" ") : null;
    },
  },
  {
    id: "diet",
    keywords: ["diet", "nutrition", "eat", "food", "vegetable", "fruit", "whole grain", "protein", "processed", "junk", "healthy eating", "meal", "triglyceride", "hdl", "cholesterol"],
    source: "USDA Dietary Guidelines 2020-2025",
    org: "USDA",
    url: "https://www.dietaryguidelines.gov",
    factStatement: "A healthy diet rich in fruits, vegetables, whole grains, and lean proteins reduces risk of heart disease, diabetes, and obesity.",
    getReasoning: (data) => {
      const parts: string[] = [];
      if ((data.hdl ?? 55) < 40) parts.push(`HDL of ${data.hdl} mg/dL is low — omega-3s, soluble fibre, and reduced refined carbohydrates can raise HDL significantly.`);
      if ((data.triglycerides ?? 120) >= 200) parts.push(`High triglycerides (${data.triglycerides} mg/dL) are directly driven by refined carbohydrates, sugar, and alcohol — all modifiable through diet.`);
      if ((data.chol ?? 200) >= 240) parts.push(`Total cholesterol of ${data.chol} mg/dL can be meaningfully reduced through a Mediterranean-style dietary pattern.`);
      return parts.length ? parts.join(" ") : null;
    },
  },
  {
    id: "sleep",
    keywords: ["sleep", "rest", "insomnia", "fatigue", "tired", "night", "hours", "bedtime", "circadian", "deep sleep", "rem", "latency"],
    source: "CDC Sleep Guidelines",
    org: "CDC",
    url: "https://www.cdc.gov/sleep/about_sleep/how_much_sleep.html",
    factStatement: "Adults need 7 or more hours of sleep per night. Chronic sleep deprivation raises risk of obesity, heart disease, diabetes, and mental health disorders.",
    getReasoning: (data) => {
      const parts: string[] = [];
      const totalSleep = data.total_sleep_minutes ?? 420;
      if (totalSleep < 360) parts.push(`Total sleep of ${(totalSleep / 60).toFixed(1)} hours is below the CDC minimum of 7 hours — chronic short sleep is associated with 20% higher all-cause mortality.`);
      if ((data.deep_sleep_pct ?? 20) < 13) parts.push(`Deep sleep of ${data.deep_sleep_pct}% is below optimal (13–23%), impairing cellular repair, glucose regulation, and immune function.`);
      if ((data.rem_sleep_pct ?? 22) < 16) parts.push(`Low REM sleep (${data.rem_sleep_pct}%) impairs emotional regulation and memory consolidation.`);
      if ((data.latency_minutes ?? 12) >= 30) parts.push(`Sleep onset latency of ${data.latency_minutes} minutes is a clinical indicator of insomnia.`);
      if ((data.consistency_variance ?? 0.3) >= 1.5) parts.push("Highly inconsistent sleep schedules disrupt circadian rhythms and amplify metabolic and cardiovascular risk.");
      return parts.length ? parts.join(" ") : null;
    },
  },
  {
    id: "smoking",
    keywords: ["smok", "cigarette", "tobacco", "nicotine", "quit", "lung", "cancer", "copd", "pulmonary"],
    source: "WHO Tobacco Fact Sheet",
    org: "WHO",
    url: "https://www.who.int/news-room/fact-sheets/detail/tobacco",
    factStatement: "Smoking increases the risk of heart disease by 2–4×, causes lung cancer, COPD, and reduces life expectancy by an average of 10 years.",
    getReasoning: (data) => {
      const parts: string[] = [];
      if (data.is_smoker === 1) {
        parts.push("You are an active smoker.");
        if ((data.duration ?? 0) > 0) parts.push(`With ${data.duration} years of smoking, cumulative carcinogen exposure significantly elevates lung cancer and COPD risk.`);
      } else if ((data.duration ?? 0) > 0 && (data.years_quit ?? 0) > 0) {
        parts.push(`As an ex-smoker (${data.duration} years smoking, quit ${data.years_quit} years ago), residual lung and cancer risk remain elevated for up to 15 years post-cessation.`);
      }
      if (data.copd === 1) parts.push("Your COPD diagnosis is the most direct consequence of tobacco exposure and requires ongoing pulmonary management.");
      return parts.length ? parts.join(" ") : null;
    },
  },
  {
    id: "liver",
    keywords: ["liver", "hepat", "fatty liver", "nafld", "cirrhosis", "ast", "alt", "transaminase", "enzyme", "platelet", "fibrosis"],
    source: "NIH National Institute of Diabetes and Digestive and Kidney Diseases",
    org: "NIH / NIDDK",
    url: "https://www.niddk.nih.gov/health-information/liver-disease",
    factStatement: "Elevated liver enzymes (AST/ALT > 40 U/L) and low platelet counts (< 150k) are clinical markers of liver inflammation, fatty liver, or early fibrosis.",
    getReasoning: (data) => {
      const parts: string[] = [];
      if ((data.ast ?? 22) >= 60) parts.push(`AST of ${data.ast} U/L is significantly above normal (< 40 U/L), indicating active liver cell damage.`);
      else if ((data.ast ?? 22) >= 40) parts.push(`AST of ${data.ast} U/L is mildly elevated, warranting monitoring.`);
      if ((data.alt ?? 22) >= 60) parts.push(`ALT of ${data.alt} U/L is significantly elevated — ALT is a specific marker of liver cell injury.`);
      if ((data.platelets ?? 260) < 150) parts.push(`Low platelet count (${data.platelets}k/µL) may indicate portal hypertension or progressive liver fibrosis.`);
      if ((data.bmi ?? 22) >= 25) parts.push(`Elevated BMI (${(data.bmi ?? 22).toFixed(1)}) combined with raised transaminases is the hallmark presentation of NAFLD.`);
      return parts.length ? parts.join(" ") : null;
    },
  },
  {
    id: "stress_mental",
    keywords: ["stress", "mental", "anxiety", "depress", "mindful", "meditat", "relax", "burnout", "psychological", "wellbeing", "phq", "depression", "social", "sentiment"],
    source: "WHO Mental Health Action Plan 2013-2030",
    org: "WHO",
    url: "https://www.who.int/publications/i/item/9789240031029",
    factStatement: "Depression (PHQ-9 ≥ 10) is associated with 2× higher cardiovascular mortality and significantly impairs immune, metabolic, and sleep function.",
    getReasoning: (data) => {
      const parts: string[] = [];
      const phq = data.phq9_score ?? 2;
      if (phq >= 20) parts.push(`PHQ-9 score of ${phq} indicates severe depression — immediate mental health intervention is required.`);
      else if (phq >= 15) parts.push(`PHQ-9 score of ${phq} indicates moderately severe depression — CBT + pharmacotherapy is strongly recommended.`);
      else if (phq >= 10) parts.push(`PHQ-9 score of ${phq} indicates moderate depression, which doubles cardiovascular mortality risk if untreated.`);
      else if (phq >= 5) parts.push(`PHQ-9 score of ${phq} indicates mild depression — early intervention prevents progression.`);
      if ((data.social_interaction_index ?? 0.8) < 0.4) parts.push("Low social interaction is an independent risk factor for cardiovascular disease and cognitive decline.");
      if ((data.negative_sentiment_score ?? 0.1) >= 0.6) parts.push("High negative sentiment is associated with elevated inflammatory markers (IL-6, CRP) and poor health outcomes.");
      if ((data.late_night_activity ?? 0.2) >= 0.6) parts.push("High late-night activity disrupts circadian rhythm and worsens sleep quality and mental health.");
      return parts.length ? parts.join(" ") : null;
    },
  },
  {
    id: "cardiac_ecg",
    keywords: ["cardiac", "ecg", "angina", "vessel", "thal", "oldpeak", "st depression", "fluoroscopy", "angiograph", "ischaemia", "heart attack", "mace"],
    source: "American College of Cardiology / AHA 2022 Chest Pain Guidelines",
    org: "ACC / AHA",
    url: "https://www.acc.org/guidelines",
    factStatement: "Exercise-induced ST depression (oldpeak > 1mm), reversible thalassemia defects, and ≥ 2 major vessels involved are strong predictors of major adverse cardiac events (MACE).",
    getReasoning: (data) => {
      const parts: string[] = [];
      if ((data.oldpeak ?? 0) >= 2) parts.push(`ST depression of ${data.oldpeak}mm indicates significant myocardial ischaemia — urgent cardiology review required.`);
      else if ((data.oldpeak ?? 0) >= 1) parts.push(`ST depression of ${data.oldpeak}mm is a moderate ischaemia indicator.`);
      if (data.thal === 3) parts.push("Reversible thalassemia defect indicates stress-induced ischaemia — the most adverse perfusion finding.");
      if ((data.ca ?? 0) >= 2) parts.push(`${data.ca} major vessels with stenosis — multi-vessel disease dramatically increases myocardial infarction risk.`);
      if (data.exang === 1) parts.push("Exercise-induced angina confirms symptomatic ischaemia triggered by physical exertion.");
      if (data.slope === 0) parts.push("Downsloping ST segment is the most unfavourable ECG pattern, strongly associated with obstructive coronary artery disease.");
      return parts.length ? parts.join(" ") : null;
    },
  },
];

// ── Reasoning Builder ─────────────────────────────────────────────────────────

interface ReasoningResult {
  factStatement: string;
  personalReasoning: string;
  source: string;
  org: string;
  url: string;
}

function buildActionReasoning(action: string, data: HealthData): ReasoningResult[] {
  const lower = action.toLowerCase();
  const results: ReasoningResult[] = [];

  for (const fact of VERIFIED_FACTS) {
    const keywordMatch = fact.keywords.some((kw) => lower.includes(kw));
    if (!keywordMatch) continue;

    const personalReasoning = fact.getReasoning(data);

    results.push({
      factStatement: fact.factStatement,
      personalReasoning: personalReasoning
        ?? "This recommendation is based on your overall health profile and the verified medical guideline below.",
      source: fact.source,
      org: fact.org,
      url: fact.url,
    });
  }

  if (results.length === 0) {
    results.push({
      factStatement: "This recommendation is based on your complete health profile submitted to the AI.",
      personalReasoning:
        "The AI analysed your combined health data — including lifestyle, habits, medical history, and biometrics — and generated this personalised action item. It reflects best-practice clinical reasoning from your full profile.",
      source: "LifeScore AI Health Intelligence Engine",
      org: "LifeScore AI",
      url: "#",
    });
  }

  return results;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const NUMERIC_FIELDS = [
  "age", "sex", "bmi", "education",
  "trestbps", "chol", "thalach", "oldpeak", "ca", "thal", "slope", "cp", "restecg", "fbs", "exang",
  "copd", "family_hx", "is_smoker", "duration", "years_quit",
  "ast", "alt", "platelets", "glucose", "triglycerides", "hdl",
  "total_sleep_minutes", "time_in_bed_minutes", "deep_sleep_pct", "rem_sleep_pct",
  "latency_minutes", "consistency_variance",
  "phq9_score", "late_night_activity", "social_interaction_index", "negative_sentiment_score",
];

function fmt(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function parseVal(key: string, value: string): any {
  if (!value.trim()) return undefined;
  if (NUMERIC_FIELDS.includes(key)) {
    const n = parseFloat(value);
    return isNaN(n) ? value : n;
  }
  return value;
}

// ── JSON Syntax Highlighter ───────────────────────────────────────────────────

function JsonHighlighter({ data }: { data: object }) {
  const lines = JSON.stringify(data, null, 2).split("\n");

  function colorLine(line: string) {
    // Key
    const keyMatch = line.match(/^(\s*)("[\w_]+")(:\s*)(.*)/);
    if (!keyMatch) {
      return <span className="text-gray-400">{line}</span>;
    }
    const [, indent, key, colon, rest] = keyMatch;
    let valueNode: React.ReactNode = <span className="text-gray-300">{rest}</span>;

    if (/^"/.test(rest)) {
      valueNode = <span className="text-emerald-400">{rest}</span>;
    } else if (/^\d/.test(rest) || /^-\d/.test(rest)) {
      valueNode = <span className="text-sky-400">{rest}</span>;
    } else if (/^(true|false)/.test(rest)) {
      valueNode = <span className="text-amber-400">{rest}</span>;
    } else if (/^null/.test(rest)) {
      valueNode = <span className="text-red-400">{rest}</span>;
    } else if (/^\[/.test(rest)) {
      valueNode = <span className="text-purple-300">{rest}</span>;
    }

    return (
      <>
        <span className="text-gray-500">{indent}</span>
        <span className="text-purple-300">{key}</span>
        <span className="text-gray-400">{colon}</span>
        {valueNode}
      </>
    );
  }

  return (
    <pre className="text-xs font-mono leading-5 overflow-auto max-h-72 whitespace-pre">
      {lines.map((line, i) => (
        <div key={i}>{colorLine(line)}</div>
      ))}
    </pre>
  );
}

// ── Section Badge ─────────────────────────────────────────────────────────────

function SectionBadge({ number, label }: { number: number; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] flex items-center justify-center flex-shrink-0 shadow-sm">
        <span className="text-white text-[10px] font-bold">{number}</span>
      </div>
      <span className="text-xs font-semibold uppercase tracking-widest text-[#2EC4B6]">{label}</span>
    </div>
  );
}

// ── Annotation Tooltip ────────────────────────────────────────────────────────

function Annotation({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow((v) => !v)}
        className="w-4 h-4 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-[#2EC4B6] hover:bg-teal-100 transition-colors flex-shrink-0"
      >
        <Info className="w-2.5 h-2.5" />
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-gray-900 text-white text-xs p-2.5 rounded-xl shadow-xl z-50 leading-relaxed pointer-events-none"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function AIInsightsSection() {
  const { healthOutput, healthData, fetchHealthOutput, addChatMessage } = useHealth();

  // ── Form State ──
  const [checkedKeys, setCheckedKeys] = useState<Record<string, boolean>>({});
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [additionalFactors, setAdditionalFactors] = useState("");
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [actionsExpanded, setActionsExpanded] = useState(true);
  const [panelExpanded, setPanelExpanded] = useState(true);
  const [openReasons, setOpenReasons] = useState<Record<number, boolean>>({});

  // ── Submission State ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitStep, setSubmitStep] = useState<"idle" | "building" | "sending" | "done">("idle");

  // Reset form when output refreshes
  useEffect(() => {
    setCheckedKeys({});
    setInputValues({});
    setAdditionalFactors("");
    setSubmitSuccess(false);
    setSubmitError(null);
    setSubmitStep("idle");
  }, [healthOutput]);

  if (!healthOutput) return null;

  const { input, biologicalAge, summary, future_risk, actions, keyvalues } = healthOutput;
  const { realAge, biologicalAge: bioAge, ageDifference } = biologicalAge;
  const isOlder = ageDifference > 0;
  const isYounger = ageDifference < 0;

  // ── Live merged JSON preview ──
  const mergedJson = useMemo(() => {
    const overrides: Record<string, any> = {};
    for (const kv of (keyvalues ?? [])) {
      if (checkedKeys[kv] && inputValues[kv]?.trim()) {
        const parsed = parseVal(kv, inputValues[kv]);
        if (parsed !== undefined) overrides[kv] = parsed;
      }
    }
    const merged: any = { ...healthData, ...overrides };
    if (additionalFactors.trim()) {
      merged.additional_factors = additionalFactors.trim();
    }
    return merged;
  }, [checkedKeys, inputValues, additionalFactors, healthData, keyvalues]);

  // ── Derived helpers ──
  const checkedCount = Object.values(checkedKeys).filter(Boolean).length;
  const anyChecked = checkedCount > 0;
  const allCheckedHaveValues = (keyvalues ?? [])
    .filter((kv) => checkedKeys[kv])
    .every((kv) => inputValues[kv]?.trim());
  const canSubmit = (anyChecked && allCheckedHaveValues) || additionalFactors.trim().length > 0;

  // ── Submit handler ──
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    setSubmitStep("building");

    const overrides: Partial<HealthData> = {};
    for (const kv of (keyvalues ?? [])) {
      if (checkedKeys[kv] && inputValues[kv]?.trim()) {
        const parsed = parseVal(kv, inputValues[kv]);
        if (parsed !== undefined) (overrides as any)[kv] = parsed;
      }
    }
    if (additionalFactors.trim()) {
      (overrides as any).additional_factors = additionalFactors.trim();
    }

    // Brief "building" pause for UX
    await new Promise((r) => setTimeout(r, 600));
    setSubmitStep("sending");

    try {
      const result = await fetchHealthOutput(overrides);

      addChatMessage({
        role: "ai",
        content: `🔄 **Re-analysis complete!**\n\nUpdated: ${
          Object.keys(overrides)
            .map((k) => `${fmt(k)} → ${(overrides as any)[k]}`)
            .join(", ")
        }\n\n📊 **New Biological Age:** ${result.biologicalAge.biologicalAge} (actual: ${result.biologicalAge.realAge}, diff: ${result.biologicalAge.ageDifference > 0 ? "+" : ""}${result.biologicalAge.ageDifference})\n\n${result.summary}`,
      });

      if (result.actions?.length > 0) {
        setTimeout(() => {
          addChatMessage({
            role: "ai",
            content: result.actions.join("\n"),
            isBulletList: true,
          });
        }, 600);
      }

      setSubmitStep("done");
      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err?.message ?? "Submission failed. Please try again.");
      setSubmitStep("idle");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Toggle all helper ──
  const toggleAll = (state: boolean) => {
    const next: Record<string, boolean> = {};
    (keyvalues ?? []).forEach((kv) => { next[kv] = state; });
    setCheckedKeys(next);
  };

  return (
    <div className="space-y-6">

      {/* ═══════════════════════════════════════════════════════
          1. BIOLOGICAL AGE HERO
      ═══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-teal-50"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#3A86FF] via-[#33A5DF] to-[#2EC4B6]" />
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/20 rounded-full blur-3xl" />

        <div className="relative p-8 text-white">
          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <SectionBadge number={1} label="Biological Age" />
              <h2 className="text-2xl font-bold tracking-tight text-white">Your Biological Age</h2>
              <p className="text-teal-50 text-sm mt-1 flex items-center gap-1.5 font-medium">
                <BadgeCheck className="w-3.5 h-3.5" />
                Values sourced directly from AI output — no local computation
              </p>
            </div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-sm">
              <Brain className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Three columns */}
          <div className="grid grid-cols-3 gap-4">
            {/* Biological Age */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.5, type: "spring" }}
              className="text-center bg-white/20 backdrop-blur-md rounded-2xl p-5 border border-white/30 shadow-sm"
            >
              <div className="text-6xl font-extrabold tracking-tight mb-1 text-white">{bioAge}</div>
              <div className="text-teal-50 text-xs uppercase tracking-widest font-semibold">
                Biological Age
              </div>
              <div className="mt-2 w-8 h-0.5 bg-white/40 mx-auto rounded-full" />
              <p className="text-teal-50 text-[10px] mt-2 leading-relaxed font-medium">
                How old your body functions
              </p>
            </motion.div>

            {/* Actual Age */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25, duration: 0.5, type: "spring" }}
              className="text-center bg-white/20 backdrop-blur-md rounded-2xl p-5 border border-white/30 shadow-sm"
            >
              <div className="text-6xl font-extrabold tracking-tight mb-1 text-white">{realAge}</div>
              <div className="text-teal-50 text-xs uppercase tracking-widest font-semibold">
                Actual Age
              </div>
              <div className="mt-2 w-8 h-0.5 bg-white/40 mx-auto rounded-full" />
              <p className="text-teal-50 text-[10px] mt-2 leading-relaxed font-medium">
                Your chronological age
              </p>
            </motion.div>

            {/* Age Difference */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.5, type: "spring" }}
              className={`text-center backdrop-blur-md rounded-2xl p-5 border shadow-sm ${
                isOlder
                  ? "bg-rose-500/20 border-rose-300/30"
                  : isYounger
                  ? "bg-emerald-500/20 border-emerald-300/30"
                  : "bg-white/20 border-white/30"
              }`}
            >
              <div
                className={`text-6xl font-extrabold tracking-tight mb-1 flex items-center justify-center gap-1 ${
                  isOlder ? "text-rose-100" : isYounger ? "text-emerald-100" : "text-white"
                }`}
              >
                {isOlder ? (
                  <TrendingUp className="w-8 h-8" />
                ) : isYounger ? (
                  <TrendingDown className="w-8 h-8" />
                ) : null}
                {isOlder ? "+" : ""}
                {ageDifference}
              </div>
              <div className="text-teal-50 text-xs uppercase tracking-widest font-semibold">
                Age Gap
              </div>
              <div className="mt-2 w-8 h-0.5 bg-white/40 mx-auto rounded-full" />
              <p
                className={`text-[10px] mt-2 leading-relaxed font-medium ${
                  isOlder ? "text-rose-100" : isYounger ? "text-emerald-100" : "text-teal-50"
                }`}
              >
                {isOlder
                  ? "Body older than years"
                  : isYounger
                  ? "Body younger than years"
                  : "Perfectly aligned"}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════
          2 & 3. SUMMARY + FUTURE RISK (side by side)
      ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white/60 backdrop-blur-xl rounded-2xl border border-teal-100/50 shadow-sm p-6 flex flex-col"
        >
          <SectionBadge number={2} label="AI Summary" />
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <ClipboardList className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-[#1F2937]">Health Summary</h3>
              <p className="text-xs text-[#6B7280]">AI-generated assessment overview</p>
            </div>
            <Annotation text="This summary is generated directly from your health data by the AI model. No manual edits are made." />
          </div>
          <div className="flex-1 p-4 bg-gradient-to-br from-white to-teal-50/30 rounded-xl border border-teal-100/50 shadow-sm">
            <p className="text-[14px] text-[#6B7280] leading-relaxed">{summary || "No summary available."}</p>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2EC4B6] animate-pulse" />
            <span className="text-[10px] text-[#2EC4B6] font-semibold uppercase tracking-wider">
              Sourced from API response · item[1].summary
            </span>
          </div>
        </motion.div>

        {/* Future Risk Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="bg-white/60 backdrop-blur-xl rounded-2xl border border-orange-100/50 shadow-sm p-6 flex flex-col"
        >
          <SectionBadge number={3} label="Future Risk" />
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 bg-gradient-to-r from-orange-400 to-rose-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <AlertTriangle className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-[#1F2937]">Future Risk Prediction</h3>
              <p className="text-xs text-[#6B7280]">Projected health trajectory</p>
            </div>
            <Annotation text="This prediction models your health trajectory based on current data. It is not a medical diagnosis." />
          </div>

          {/* Warning banner */}
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-50/50 border border-orange-100 rounded-xl mb-3 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
            <span className="text-[10px] text-orange-700 font-semibold uppercase tracking-wide">
              Predictive · Not a diagnosis
            </span>
          </div>

          <div className="flex-1 p-4 bg-gradient-to-br from-white to-orange-50/30 rounded-xl border border-orange-100/50 shadow-sm">
            <p className="text-[14px] text-[#6B7280] leading-relaxed">{future_risk || "No prediction available."}</p>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-[10px] text-orange-500 font-semibold uppercase tracking-wider">
              Sourced from API response · item[1].future_risk
            </span>
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          4. RECOMMENDED ACTIONS
      ═══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-white/60 backdrop-blur-xl rounded-2xl border border-[#2EC4B6]/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
      >
        {/* Header — collapsible */}
        <button
          onClick={() => setActionsExpanded((v) => !v)}
          className="w-full p-6 flex items-center justify-between hover:bg-teal-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-r from-[#2EC4B6] to-[#1FB3A5] rounded-xl flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <SectionBadge number={4} label="Recommended Actions" />
              </div>
              <h3 className="font-bold text-[#1F2937] -mt-3">
                Recommended Actions
              </h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {actions.length} AI-personalized health actions — directly from API
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium bg-teal-50 text-[#2EC4B6] px-3 py-1 rounded-full border border-teal-100/50">
              {actions.length} actions
            </span>
            {actionsExpanded ? (
              <ChevronUp className="w-5 h-5 text-[#6B7280]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#6B7280]" />
            )}
          </div>
        </button>

        <AnimatePresence initial={false}>
          {actionsExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 space-y-3">
                {actions.map((action, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex flex-col rounded-xl border border-teal-50 hover:border-teal-100/50 hover:shadow-sm transition-all overflow-hidden"
                  >
                    {/* Action row */}
                    <div className="group flex items-start gap-3.5 p-4 bg-gradient-to-r from-white to-teal-50/20">
                      {/* Number badge */}
                      <div className="w-7 h-7 bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform shadow-sm">
                        <span className="text-white text-[10px] font-bold">{i + 1}</span>
                      </div>
                      <p className="text-[14px] text-[#6B7280] flex-1 leading-relaxed">{action}</p>
                      {/* Source annotation */}
                      <span className="flex-shrink-0 text-[9px] font-semibold text-[#2EC4B6] bg-teal-50 px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        actions[{i}]
                      </span>
                    </div>

                    {/* Why suggested? toggle */}
                    <button
                      onClick={() => setOpenReasons((prev) => ({ ...prev, [i]: !prev[i] }))}
                      className="flex items-center gap-1.5 px-4 py-2 bg-teal-50/60 border-t border-teal-100/50 text-[#2EC4B6] hover:bg-teal-50 transition-colors w-full text-left"
                    >
                      <Info className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-[11px] font-semibold tracking-wide">
                        {openReasons[i] ? "Hide reason" : "Why is this suggested?"}
                      </span>
                      {openReasons[i] ? (
                        <ChevronUp className="w-3.5 h-3.5 ml-auto" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 ml-auto" />
                      )}
                    </button>

                    {/* Expandable reason box */}
                    <AnimatePresence initial={false}>
                      {openReasons[i] && (() => {
                        const reasons = buildActionReasoning(action, healthData);
                        return (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-teal-100/50 bg-gradient-to-br from-sky-50/50 to-teal-50/30 px-4 py-4 space-y-4">

                              {/* Header */}
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                                  <Sparkles className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-[11px] font-bold text-[#1F2937] uppercase tracking-widest">
                                  Why this is suggested for you
                                </p>
                              </div>

                              {reasons.map((r, ri) => (
                                <div key={ri} className="rounded-xl overflow-hidden border border-teal-100/60 shadow-sm">

                                  {/* Personal reasoning row */}
                                  <div className="px-4 py-3 bg-white/80">
                                    <p className="text-[11px] font-semibold text-[#3A86FF] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#3A86FF] inline-block" />
                                      Your Health Data Says
                                    </p>
                                    <p className="text-[13px] text-[#1F2937] leading-relaxed">
                                      {r.personalReasoning}
                                    </p>
                                  </div>

                                  {/* Verified fact row */}
                                  <div className="px-4 py-3 bg-teal-50/60 border-t border-teal-100/50">
                                    <p className="text-[11px] font-semibold text-[#2EC4B6] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#2EC4B6] inline-block" />
                                      Verified Medical Fact
                                    </p>
                                    <p className="text-[13px] text-[#6B7280] leading-relaxed italic">
                                      "{r.factStatement}"
                                    </p>
                                  </div>

                                  {/* Source row */}
                                  <div className="px-4 py-2.5 bg-slate-900/90 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="flex-shrink-0 text-[10px] font-bold text-white bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] px-2 py-0.5 rounded-full">
                                        {r.org}
                                      </span>
                                      <span className="text-[11px] text-slate-300 truncate">
                                        {r.source}
                                      </span>
                                    </div>
                                    {r.url !== "#" && (
                                      <a
                                        href={r.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-shrink-0 text-[10px] font-semibold text-[#2EC4B6] hover:text-teal-300 underline underline-offset-2 transition-colors"
                                      >
                                        View Source →
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        );
                      })()}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════
          5. KEY VALUES — INTERACTIVE UPDATE PANEL
      ═══════════════════════════════════════════════════════ */}
      {keyvalues && keyvalues.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white/60 backdrop-blur-xl rounded-2xl border border-teal-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
        >
          {/* Panel header */}
          <button
            onClick={() => setPanelExpanded((v) => !v)}
            className="w-full p-6 flex items-center justify-between hover:bg-teal-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] rounded-xl flex items-center justify-center shadow-sm">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <SectionBadge number={5} label="Key Values · Update &amp; Re-analyze" />
                </div>
                <h3 className="font-bold text-[#1F2937] -mt-3">Update Key Health Parameters</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {keyvalues.length} parameter{keyvalues.length !== 1 ? "s" : ""} identified by AI — check, update &amp; re-submit
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {anyChecked && (
                <span className="text-xs font-medium bg-teal-50 text-[#2EC4B6] px-3 py-1 rounded-full border border-teal-100/50">
                  {checkedCount} selected
                </span>
              )}
              {panelExpanded ? (
                <ChevronUp className="w-5 h-5 text-[#6B7280]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#6B7280]" />
              )}
            </div>
          </button>

          <AnimatePresence initial={false}>
            {panelExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 space-y-5">

                  {/* ── How it works banner ── */}
                  <div className="p-4 bg-gradient-to-r from-sky-50/50 to-teal-50/50 border border-teal-100/50 rounded-xl shadow-sm">
                    <div className="flex items-start gap-3">
                      <Info className="w-4 h-4 text-[#3A86FF] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-[#1F2937] mb-1">How this works</p>
                        <p className="text-xs text-[#6B7280] leading-relaxed">
                          The AI identified these parameters as key factors in your health profile.
                          <strong> Check</strong> each parameter you've updated, <strong>enter the new value</strong>,
                          and optionally add extra notes below. Click <strong>Submit &amp; Update</strong> to
                          merge your changes into the original JSON and re-send to the AI for a fresh analysis.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── Select All / Clear All ── */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#1F2937] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#2EC4B6]" />
                      AI-Identified Parameters
                      <Annotation text="These are the health values the AI flagged as most impactful. Selecting and updating them will refine the analysis." />
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleAll(true)}
                        className="text-xs px-3 py-1.5 bg-white border border-teal-100 text-[#2EC4B6] rounded-lg hover:bg-teal-50 transition-colors flex items-center gap-1 shadow-sm font-medium"
                      >
                        <Plus className="w-3 h-3" /> Select All
                      </button>
                      <button
                        onClick={() => toggleAll(false)}
                        className="text-xs px-3 py-1.5 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1 shadow-sm font-medium"
                      >
                        <Minus className="w-3 h-3" /> Clear All
                      </button>
                    </div>
                  </div>

                  {/* ── Checkbox rows ── */}
                  <div className="space-y-2.5">
                    {keyvalues.map((kv, index) => {
                      const currentVal = (input as any)[kv];
                      const isChecked = !!checkedKeys[kv];
                      const hasNewVal = !!inputValues[kv]?.trim();

                      return (
                        <motion.div
                          key={kv}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`relative flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 ${
                            isChecked
                              ? "bg-gradient-to-r from-white to-teal-50/30 border-teal-200 shadow-sm"
                              : "bg-white/40 border-slate-100"
                          }`}
                        >
                          {/* Updated indicator */}
                          {isChecked && hasNewVal && (
                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#2EC4B6]" title="Has new value" />
                          )}

                          {/* Checkbox */}
                          <label className="flex items-center cursor-pointer flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) =>
                                setCheckedKeys((prev) => ({ ...prev, [kv]: e.target.checked }))
                              }
                              className="w-4.5 h-4.5 rounded text-[#2EC4B6] border-slate-300 focus:ring-[#2EC4B6] cursor-pointer"
                            />
                          </label>

                          {/* Label */}
                          <div className="w-28 flex-shrink-0">
                            <span
                              className={`text-sm font-semibold leading-tight ${
                                isChecked ? "text-[#1F2937]" : "text-slate-400"
                              }`}
                            >
                              {fmt(kv)}
                            </span>
                            <div className="text-[9px] font-mono text-slate-400 mt-0.5">{kv}</div>
                          </div>

                          {/* Current value badge */}
                          <div className="flex-shrink-0">
                            {currentVal !== undefined && currentVal !== null ? (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full shadow-sm">
                                <span className="text-slate-400">now:</span>
                                <span className="font-semibold text-slate-700">
                                  {Array.isArray(currentVal)
                                    ? currentVal.join(", ")
                                    : String(currentVal)}
                                </span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">not set</span>
                            )}
                          </div>

                          {/* Arrow */}
                          {isChecked && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="text-teal-300 text-sm flex-shrink-0"
                            >
                              →
                            </motion.div>
                          )}

                          {/* New value input */}
                          <div className="flex-1 min-w-0">
                            <input
                              type={NUMERIC_FIELDS.includes(kv) ? "number" : "text"}
                              value={inputValues[kv] ?? ""}
                              onChange={(e) =>
                                setInputValues((prev) => ({ ...prev, [kv]: e.target.value }))
                              }
                              placeholder={
                                isChecked
                                  ? NUMERIC_FIELDS.includes(kv)
                                    ? "Enter number…"
                                    : "Enter new value…"
                                  : "Check to edit"
                              }
                              disabled={!isChecked}
                              className={`w-full px-3 py-2 rounded-lg border text-[14px] transition-all focus:outline-none focus:ring-2 focus:ring-[#2EC4B6]/30 ${
                                isChecked
                                  ? hasNewVal
                                    ? "border-[#2EC4B6]/50 bg-white text-[#1F2937]"
                                    : "border-teal-100 bg-white text-[#1F2937] placeholder-slate-300"
                                  : "border-slate-100 bg-slate-50/50 text-slate-400 cursor-not-allowed"
                              }`}
                            />
                          </div>

                          {/* Source tag (hover reveal) */}
                          <span className="hidden sm:flex flex-shrink-0 text-[9px] font-semibold text-teal-500 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded-full font-mono">
                            keyvalues[{index}]
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* ── Add more health factors ── */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#1F2937]">
                      <Plus className="w-4 h-4 text-[#3A86FF]" />
                      Add More Health Factors
                      <span className="text-xs font-normal text-slate-400">(optional free text)</span>
                      <Annotation text="Describe any additional health context not covered above. This will be sent as 'additional_factors' in the JSON payload." />
                    </label>
                    <textarea
                      value={additionalFactors}
                      onChange={(e) => setAdditionalFactors(e.target.value)}
                      placeholder="e.g. I have knee pain, take Vitamin D supplements, recently started intermittent fasting…"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-teal-100/50 bg-white/60 text-sm text-[#1F2937] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A86FF]/30 resize-none leading-relaxed shadow-sm transition-all"
                    />
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Stored as <code className="font-mono bg-slate-100 px-1 rounded">additional_factors</code> in the updated JSON payload
                    </p>
                  </div>

                  {/* ── JSON Preview Panel ── */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <button
                      onClick={() => setShowJsonPreview((v) => !v)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-slate-900 hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileJson className="w-4 h-4 text-teal-400" />
                        <span className="text-xs font-semibold text-slate-200">
                          Updated JSON Preview
                        </span>
                        <span className="text-[10px] bg-teal-900/60 text-teal-300 border border-teal-700/50 px-2 py-0.5 rounded-full">
                          Live — updates as you edit
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        {showJsonPreview ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" /> Hide
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" /> Show
                          </>
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {showJsonPreview && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-slate-950 p-4">
                            {/* Legend */}
                            <div className="flex flex-wrap gap-3 mb-3 pb-3 border-b border-slate-800">
                              {[
                                { color: "text-teal-300", label: "Keys" },
                                { color: "text-emerald-400", label: "Strings" },
                                { color: "text-sky-400", label: "Numbers" },
                                { color: "text-amber-400", label: "Booleans" },
                                { color: "text-rose-400", label: "Null" },
                              ].map(({ color, label }) => (
                                <div key={label} className="flex items-center gap-1">
                                  <span className={`text-xs font-mono font-bold ${color}`}>■</span>
                                  <span className="text-[10px] text-slate-400">{label}</span>
                                </div>
                              ))}
                              <div className="ml-auto text-[10px] text-slate-500">
                                {Object.keys(mergedJson).length} fields
                              </div>
                            </div>
                            <JsonHighlighter data={mergedJson} />
                          </div>

                          {/* Changed fields highlight */}
                          {(anyChecked || additionalFactors.trim()) && (
                            <div className="bg-slate-900 border-t border-slate-800 px-4 py-3">
                              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
                                Changed fields in this submission:
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {keyvalues
                                  .filter((kv) => checkedKeys[kv] && inputValues[kv]?.trim())
                                  .map((kv) => (
                                    <span
                                      key={kv}
                                      className="text-[10px] font-mono bg-teal-900/60 text-teal-300 border border-teal-700/50 px-2 py-0.5 rounded-full"
                                    >
                                      {kv}: {inputValues[kv]}
                                    </span>
                                  ))}
                                {additionalFactors.trim() && (
                                  <span className="text-[10px] font-mono bg-blue-900/60 text-blue-300 border border-blue-700/50 px-2 py-0.5 rounded-full">
                                    additional_factors: "{additionalFactors.trim().slice(0, 24)}…"
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* ── Error / Success ── */}
                  <AnimatePresence>
                    {submitError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 shadow-sm"
                      >
                        <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-rose-700">Submission Failed</p>
                          <p className="text-xs text-rose-600 mt-0.5">{submitError}</p>
                        </div>
                      </motion.div>
                    )}
                    {submitSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl shadow-sm"
                      >
                        <div className="flex items-center gap-2.5 mb-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          <p className="text-sm font-bold text-emerald-800">Re-analysis Complete!</p>
                        </div>
                        <p className="text-xs text-emerald-700 ml-7 leading-relaxed">
                          Your updated health data was submitted to the AI. The dashboard has been refreshed with new results, and a summary has been sent to the AI Health Assistant chat.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── Submit Steps indicator ── */}
                  {isSubmitting && (
                    <div className="flex items-center gap-3">
                      {[
                        { step: "building", label: "Building JSON" },
                        { step: "sending", label: "Sending to API" },
                        { step: "done", label: "Processing" },
                      ].map(({ step, label }, i) => {
                        const steps = ["idle", "building", "sending", "done"];
                        const currentIdx = steps.indexOf(submitStep);
                        const thisIdx = steps.indexOf(step);
                        const isActive = currentIdx === thisIdx;
                        const isDone = currentIdx > thisIdx;
                        return (
                          <div key={step} className="flex items-center gap-2">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isDone
                                  ? "bg-emerald-500"
                                  : isActive
                                  ? "bg-[#2EC4B6] animate-pulse"
                                  : "bg-slate-200"
                              }`}
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-3 h-3 text-white" />
                              ) : (
                                <span className="text-[8px] font-bold text-white">{i + 1}</span>
                              )}
                            </div>
                            <span
                              className={`text-xs ${
                                isActive ? "text-[#2EC4B6] font-semibold" : isDone ? "text-emerald-600" : "text-slate-400"
                              }`}
                            >
                              {label}
                            </span>
                            {i < 2 && <div className="w-4 h-px bg-slate-300 flex-shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── Submit Button ── */}
                  <motion.button
                    whileHover={canSubmit && !isSubmitting ? { scale: 1.01, y: -1 } : {}}
                    whileTap={canSubmit && !isSubmitting ? { scale: 0.98 } : {}}
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    className={`w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 transition-all ${
                      canSubmit && !isSubmitting
                        ? "bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] text-white hover:shadow-lg hover:shadow-teal-100/50 cursor-pointer shadow-md"
                        : isSubmitting
                        ? "bg-gradient-to-r from-[#3A86FF]/70 to-[#2EC4B6]/70 text-white cursor-wait shadow-sm"
                        : "bg-slate-200/50 text-slate-400 cursor-not-allowed shadow-none border border-slate-200"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-5 h-5"
                        >
                          <RefreshCw className="w-5 h-5" />
                        </motion.div>
                        <span>
                          {submitStep === "building"
                            ? "Building updated JSON…"
                            : submitStep === "sending"
                            ? "Sending to AI endpoint…"
                            : "Processing response…"}
                        </span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit &amp; Update
                        {canSubmit && (
                          <span className="ml-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                            {checkedCount} field{checkedCount !== 1 ? "s" : ""}
                            {additionalFactors.trim() ? " + notes" : ""}
                          </span>
                        )}
                      </>
                    )}
                  </motion.button>

                  {/* Helper text */}
                  {!canSubmit && !isSubmitting && (
                    <p className="text-xs text-center text-slate-400">
                      Check at least one parameter <em>and</em> enter its new value, or add notes in the text field above.
                    </p>
                  )}
                  {anyChecked && !allCheckedHaveValues && !isSubmitting && (
                    <p className="text-xs text-center text-orange-500 font-medium">
                      ⚠️ Please fill in values for all selected parameters before submitting.
                    </p>
                  )}

                  {/* API endpoint label */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2EC4B6]" />
                    <span className="text-[10px] text-slate-400 font-mono truncate">
                      POST → /webhook-test/health-intelligence
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3A86FF]" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}