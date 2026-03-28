import React, { createContext, useContext, useState, ReactNode } from "react";

// ── Input Structure (mirrors patient-data.json fields) ─────────────────────────
export interface HealthData {
  // UI helpers only – not sent to webhook
  weight?: number;
  height?: number;

  // ── Basic ──
  age?: number;
  sex?: 0 | 1;        // 0 = female, 1 = male
  bmi?: number;       // computed from weight/height
  education?: number; // 1–5

  // ── Cardiac ──
  cp?: number;        // chest pain type 0–3
  trestbps?: number;  // resting blood pressure (mmHg)
  chol?: number;      // serum cholesterol (mg/dl)
  fbs?: 0 | 1;        // fasting blood sugar > 120 mg/dl
  restecg?: number;   // resting ECG 0–2
  thalach?: number;   // max heart rate achieved
  exang?: 0 | 1;      // exercise induced angina
  oldpeak?: number;   // ST depression induced by exercise
  slope?: number;     // slope of peak exercise ST segment 0–2
  ca?: number;        // number of major vessels 0–3
  thal?: number;      // 1 = normal, 2 = fixed defect, 3 = reversible defect

  // ── Smoking & Lung ──
  copd?: 0 | 1;
  family_hx?: 0 | 1;  // family history of heart disease
  is_smoker?: 0 | 1;
  duration?: number;  // years smoked
  years_quit?: number;

  // ── Blood & Liver ──
  ast?: number;
  alt?: number;
  platelets?: number;
  glucose?: number;
  triglycerides?: number;
  hdl?: number;

  // ── Sleep ──
  total_sleep_minutes?: number;
  time_in_bed_minutes?: number;
  deep_sleep_pct?: number;
  rem_sleep_pct?: number;
  latency_minutes?: number;
  consistency_variance?: number;

  // ── Mental Health ──
  phq9_score?: number;
  late_night_activity?: number;
  social_interaction_index?: number;
  negative_sentiment_score?: number;
}

// Produces the exact JSON structure for the n8n webhook (strips UI-only fields)
function buildWebhookPayload(data: HealthData): Record<string, unknown> {
  const { weight, height, ...rest } = data;
  return {
    age: rest.age ?? 30,
    sex: rest.sex ?? 1,
    bmi: rest.bmi ?? 22.0,
    education: rest.education ?? 3,
    cp: rest.cp ?? 0,
    trestbps: rest.trestbps ?? 120,
    chol: rest.chol ?? 200,
    fbs: rest.fbs ?? 0,
    restecg: rest.restecg ?? 0,
    thalach: rest.thalach ?? 150,
    exang: rest.exang ?? 0,
    oldpeak: rest.oldpeak ?? 0.0,
    slope: rest.slope ?? 2,
    ca: rest.ca ?? 0,
    thal: rest.thal ?? 2,
    copd: rest.copd ?? 0,
    family_hx: rest.family_hx ?? 0,
    is_smoker: rest.is_smoker ?? 0,
    duration: rest.duration ?? 0,
    years_quit: rest.years_quit ?? 0,
    ast: rest.ast ?? 22,
    alt: rest.alt ?? 22,
    platelets: rest.platelets ?? 260,
    glucose: rest.glucose ?? 90,
    triglycerides: rest.triglycerides ?? 120,
    hdl: rest.hdl ?? 55,
    total_sleep_minutes: rest.total_sleep_minutes ?? 420,
    time_in_bed_minutes: rest.time_in_bed_minutes ?? 450,
    deep_sleep_pct: rest.deep_sleep_pct ?? 20,
    rem_sleep_pct: rest.rem_sleep_pct ?? 22,
    latency_minutes: rest.latency_minutes ?? 12,
    consistency_variance: rest.consistency_variance ?? 0.3,
    phq9_score: rest.phq9_score ?? 2,
    late_night_activity: rest.late_night_activity ?? 0.2,
    social_interaction_index: rest.social_interaction_index ?? 0.8,
    negative_sentiment_score: rest.negative_sentiment_score ?? 0.1,
  };
}

// ── Output Structure (mirrors n8n webhook response) ────────────────────────────
export interface HealthOutput {
  input: Record<string, unknown>;
  signals: string[];
  risks: {
    heart: number;
    metabolic: number;
    lung: number;
    mental: number;
    liver: number;
    sleep: number;
    overall: number;
  };
  biologicalAge: {
    realAge: number;
    biologicalAge: number;
    ageDifference: number;
  };
  topRisks: [string, number][];
  summary: string;
  future_risk: string;
  actions: string[];
  keyvalues: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  isBulletList?: boolean;
  timestamp: Date;
}

interface HealthContextType {
  healthData: HealthData;
  updateHealthData: (data: Partial<HealthData>) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  healthOutput: HealthOutput | null;
  fetchHealthOutput: (overrides?: Partial<HealthData>) => Promise<HealthOutput>;
  resetData: () => void;
}

const WEBHOOK_URL = "https://ljk-cp.app.n8n.cloud/webhook/health-intelligence";

// ── Risk Computation Functions ─────────────────────────────────────────────────

function computeHeartRisk(data: HealthData): number {
  let score = 10;
  // Chest pain type: 3=asymptomatic paradoxically high risk, 0=typical lowest
  const cpMap: Record<number, number> = { 0: 5, 1: 10, 2: 18, 3: 28 };
  score += cpMap[data.cp ?? 0] ?? 0;
  if ((data.trestbps ?? 120) >= 160) score += 20;
  else if ((data.trestbps ?? 120) >= 140) score += 12;
  else if ((data.trestbps ?? 120) >= 130) score += 5;
  if ((data.chol ?? 200) >= 280) score += 18;
  else if ((data.chol ?? 200) >= 240) score += 10;
  else if ((data.chol ?? 200) >= 200) score += 4;
  if (data.fbs === 1) score += 10;
  if ((data.thalach ?? 150) < 110) score += 18;
  else if ((data.thalach ?? 150) < 130) score += 10;
  else if ((data.thalach ?? 150) < 150) score += 4;
  if (data.exang === 1) score += 15;
  if ((data.oldpeak ?? 0) >= 3.0) score += 18;
  else if ((data.oldpeak ?? 0) >= 1.5) score += 10;
  else if ((data.oldpeak ?? 0) >= 0.5) score += 4;
  if (data.slope === 0) score += 12; // downsloping = worst
  else if (data.slope === 1) score += 5; // flat
  score += (data.ca ?? 0) * 10; // each blocked vessel adds risk
  if (data.thal === 3) score += 16; // reversible defect
  else if (data.thal === 2) score += 8; // fixed defect
  if (data.is_smoker === 1) score += 20;
  if (data.family_hx === 1) score += 12;
  if ((data.bmi ?? 22) >= 30) score += 10;
  else if ((data.bmi ?? 22) >= 25) score += 5;
  return Math.min(Math.round(score), 95);
}

function computeMetabolicRisk(data: HealthData): number {
  let score = 8;
  if ((data.bmi ?? 22) >= 30) score += 25;
  else if ((data.bmi ?? 22) >= 25) score += 12;
  if (data.fbs === 1) score += 15;
  if ((data.glucose ?? 90) >= 160) score += 22;
  else if ((data.glucose ?? 90) >= 126) score += 15;
  else if ((data.glucose ?? 90) >= 100) score += 8;
  if ((data.triglycerides ?? 120) >= 300) score += 18;
  else if ((data.triglycerides ?? 120) >= 200) score += 10;
  else if ((data.triglycerides ?? 120) >= 150) score += 5;
  if ((data.hdl ?? 55) < 35) score += 16;
  else if ((data.hdl ?? 55) < 45) score += 8;
  if ((data.chol ?? 200) >= 280) score += 8;
  else if ((data.chol ?? 200) >= 240) score += 4;
  return Math.min(Math.round(score), 95);
}

function computeLungRisk(data: HealthData): number {
  let score = 6;
  if (data.is_smoker === 1) {
    score += 30;
    if ((data.duration ?? 0) >= 30) score += 18;
    else if ((data.duration ?? 0) >= 20) score += 12;
    else if ((data.duration ?? 0) >= 10) score += 6;
  } else if ((data.duration ?? 0) > 0 && (data.years_quit ?? 0) > 0) {
    // ex-smoker
    score += 10;
    if ((data.years_quit ?? 0) < 5) score += 10;
    else if ((data.years_quit ?? 0) < 10) score += 5;
    if ((data.duration ?? 0) >= 20) score += 8;
  }
  if (data.copd === 1) score += 28;
  if (data.family_hx === 1) score += 5;
  return Math.min(Math.round(score), 95);
}

function computeLiverRisk(data: HealthData): number {
  let score = 8;
  // AST (normal < 40 U/L)
  if ((data.ast ?? 22) >= 120) score += 30;
  else if ((data.ast ?? 22) >= 80) score += 20;
  else if ((data.ast ?? 22) >= 60) score += 12;
  else if ((data.ast ?? 22) >= 40) score += 6;
  // ALT (normal < 40 U/L)
  if ((data.alt ?? 22) >= 100) score += 25;
  else if ((data.alt ?? 22) >= 70) score += 16;
  else if ((data.alt ?? 22) >= 50) score += 10;
  else if ((data.alt ?? 22) >= 40) score += 5;
  // Low platelets signal liver fibrosis
  if ((data.platelets ?? 260) < 100) score += 25;
  else if ((data.platelets ?? 260) < 150) score += 16;
  else if ((data.platelets ?? 260) < 200) score += 8;
  // Triglycerides
  if ((data.triglycerides ?? 120) >= 300) score += 12;
  else if ((data.triglycerides ?? 120) >= 200) score += 6;
  // BMI
  if ((data.bmi ?? 22) >= 30) score += 10;
  else if ((data.bmi ?? 22) >= 25) score += 5;
  // Smoker
  if (data.is_smoker === 1) score += 6;
  return Math.min(Math.round(score), 95);
}

function computeMentalRisk(data: HealthData): number {
  let score = 5;
  // PHQ-9: 0–4 minimal, 5–9 mild, 10–14 moderate, 15–19 mod-severe, 20–27 severe
  const phq = data.phq9_score ?? 2;
  if (phq >= 20) score += 48;
  else if (phq >= 15) score += 36;
  else if (phq >= 10) score += 24;
  else if (phq >= 5) score += 12;
  // Late night activity
  if ((data.late_night_activity ?? 0.2) >= 0.7) score += 14;
  else if ((data.late_night_activity ?? 0.2) >= 0.4) score += 7;
  // Social isolation
  if ((data.social_interaction_index ?? 0.8) < 0.3) score += 16;
  else if ((data.social_interaction_index ?? 0.8) < 0.5) score += 8;
  // Negative sentiment
  if ((data.negative_sentiment_score ?? 0.1) >= 0.7) score += 14;
  else if ((data.negative_sentiment_score ?? 0.1) >= 0.4) score += 7;
  return Math.min(Math.round(score), 95);
}

function computeSleepRisk(data: HealthData): number {
  let score = 5;
  const totalSleep = data.total_sleep_minutes ?? 420;
  const timeInBed = data.time_in_bed_minutes ?? 450;
  const efficiency = timeInBed > 0 ? totalSleep / timeInBed : 1;
  if (efficiency < 0.65) score += 22;
  else if (efficiency < 0.75) score += 12;
  else if (efficiency < 0.85) score += 5;
  if (totalSleep < 240) score += 38;
  else if (totalSleep < 300) score += 28;
  else if (totalSleep < 360) score += 16;
  else if (totalSleep < 420) score += 8;
  if ((data.deep_sleep_pct ?? 20) < 8) score += 16;
  else if ((data.deep_sleep_pct ?? 20) < 13) score += 8;
  if ((data.rem_sleep_pct ?? 22) < 12) score += 12;
  else if ((data.rem_sleep_pct ?? 22) < 16) score += 6;
  if ((data.latency_minutes ?? 12) >= 90) score += 20;
  else if ((data.latency_minutes ?? 12) >= 45) score += 12;
  else if ((data.latency_minutes ?? 12) >= 30) score += 6;
  if ((data.consistency_variance ?? 0.3) >= 2.0) score += 16;
  else if ((data.consistency_variance ?? 0.3) >= 1.0) score += 8;
  return Math.min(Math.round(score), 95);
}

// ── Mock Output Generator ──────────────────────────────────────────────────────

function generateMockOutput(data: HealthData): Omit<HealthOutput, "biologicalAge"> {
  const heart     = computeHeartRisk(data);
  const metabolic = computeMetabolicRisk(data);
  const lung      = computeLungRisk(data);
  const mental    = computeMentalRisk(data);
  const liver     = computeLiverRisk(data);
  const sleep     = computeSleepRisk(data);
  const overall   = Math.min(Math.round((heart + metabolic + lung + mental + liver + sleep) / 6), 95);

  const risks = { heart, metabolic, lung, mental, liver, sleep, overall };

  // Build signals
  const signals: string[] = [];
  if (data.is_smoker === 1) signals.push("active_smoker");
  if (data.copd === 1) signals.push("copd_diagnosis");
  if (data.family_hx === 1) signals.push("family_history_heart_disease");
  if (data.fbs === 1) signals.push("elevated_fasting_blood_sugar");
  if (data.exang === 1) signals.push("exercise_induced_angina");
  if ((data.cp ?? 0) === 3) signals.push("asymptomatic_chest_pain");
  if ((data.ca ?? 0) >= 2) signals.push("multiple_vessel_disease");
  if ((data.thal ?? 2) === 3) signals.push("reversible_thalassemia_defect");
  if ((data.phq9_score ?? 2) >= 10) signals.push("moderate_severe_depression");
  if ((data.glucose ?? 90) >= 126) signals.push("hyperglycemia");
  if ((data.triglycerides ?? 120) >= 200) signals.push("hypertriglyceridemia");
  if ((data.hdl ?? 55) < 40) signals.push("low_hdl_cholesterol");
  if ((data.ast ?? 22) >= 60 || (data.alt ?? 22) >= 60) signals.push("elevated_liver_enzymes");
  if ((data.platelets ?? 260) < 150) signals.push("thrombocytopenia");
  if ((data.bmi ?? 22) >= 30) signals.push("bmi_obese");
  else if ((data.bmi ?? 22) >= 25) signals.push("bmi_overweight");
  if ((data.total_sleep_minutes ?? 420) < 360) signals.push("sleep_deprivation");
  if ((data.consistency_variance ?? 0.3) >= 2.0) signals.push("poor_sleep_consistency");
  if ((data.trestbps ?? 120) >= 140) signals.push("elevated_blood_pressure");
  if ((data.chol ?? 200) >= 240) signals.push("elevated_cholesterol");

  // Top risks sorted
  const topRisks: [string, number][] = (Object.entries(risks) as [string, number][])
    .filter(([k]) => k !== "overall")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3) as [string, number][];

  // Build contextual summary
  const bmiVal = data.bmi ?? 22;
  const riskLevel = overall >= 60 ? "high" : overall >= 35 ? "moderate" : "low";
  const smokingPhrase = data.is_smoker === 1
    ? `Active smoking (${data.duration ?? "unknown"} years) is your most critical modifiable risk factor for cardiovascular and pulmonary disease.`
    : (data.duration ?? 0) > 0 && (data.years_quit ?? 0) > 0
    ? `As an ex-smoker (${data.years_quit} years since quitting after ${data.duration} years of smoking), your risk remains elevated but is improving.`
    : "";
  const cardiacPhrase = heart >= 50
    ? `Your cardiac risk score of ${heart}% is elevated — key indicators include ${data.exang === 1 ? "exercise-induced angina" : ""}${(data.ca ?? 0) > 0 ? `, ${data.ca} vessel(s) affected` : ""}${(data.oldpeak ?? 0) > 1 ? `, significant ST depression (${data.oldpeak})` : ""}.`
    : "";
  const bmiPhrase = bmiVal >= 30
    ? `Your BMI of ${bmiVal.toFixed(1)} places you in the obese category, elevating metabolic and cardiovascular risk.`
    : bmiVal >= 25
    ? `Your BMI of ${bmiVal.toFixed(1)} is in the overweight range.`
    : `Your BMI of ${bmiVal.toFixed(1)} is within the healthy range.`;
  const sleepPhrase = (data.total_sleep_minutes ?? 420) < 360
    ? `Sleeping only ${Math.round((data.total_sleep_minutes ?? 420) / 60)} hours per night is impairing recovery and metabolic health.`
    : "";
  const mentalPhrase = (data.phq9_score ?? 2) >= 10
    ? `Your PHQ-9 score of ${data.phq9_score} indicates ${(data.phq9_score ?? 0) >= 20 ? "severe" : (data.phq9_score ?? 0) >= 15 ? "moderately severe" : "moderate"} depression requiring attention.`
    : "";
  const liverPhrase = liver >= 45
    ? `Elevated liver enzymes (AST: ${data.ast}, ALT: ${data.alt}) and ${(data.platelets ?? 260) < 150 ? `low platelet count (${data.platelets}k)` : "metabolic markers"} suggest hepatic stress.`
    : "";

  const summary = [
    `Based on your clinical health profile, your overall risk score is ${overall}% — classified as ${riskLevel} risk.`,
    bmiPhrase,
    smokingPhrase,
    cardiacPhrase,
    liverPhrase,
    sleepPhrase,
    mentalPhrase,
    signals.length === 0
      ? "Your clinical markers look generally positive. Keep maintaining your current health habits."
      : `${signals.length} health signal${signals.length !== 1 ? "s" : ""} were identified from your clinical data that warrant attention.`,
  ].filter(Boolean).join(" ");

  // Future risk narrative
  const future_risk = [
    overall >= 60
      ? "Without intervention, your current clinical trajectory significantly increases risk of major adverse cardiac events, metabolic syndrome, or organ dysfunction within 5–10 years."
      : overall >= 35
      ? "Your current trajectory shows moderate long-term risk. Targeted interventions now can substantially alter your future health outcomes."
      : "Your current clinical trajectory looks relatively healthy. Sustaining and optimizing your habits will extend your healthy years significantly.",
    liver >= 45
      ? `Liver health (${liver}% risk): Elevated transaminases and low platelets may indicate early hepatic fibrosis — trajectory toward NAFLD or cirrhosis without intervention.`
      : "",
    heart >= 45
      ? `Cardiovascular health (${heart}% risk): Multiple cardiac risk indicators elevate your 10-year MACE probability. Cardiology review is recommended.`
      : "",
    metabolic >= 40
      ? `Metabolic health (${metabolic}% risk): Glucose, triglyceride, and HDL patterns indicate insulin resistance trajectory toward type 2 diabetes.`
      : "",
    lung >= 35
      ? `Lung health (${lung}% risk): Smoking history${data.copd === 1 ? " combined with existing COPD" : ""} elevates risk of progressive pulmonary decline and lung malignancy.`
      : "",
    mental >= 40
      ? `Mental health (${mental}% risk): PHQ-9 score and behavioural indicators suggest risk of worsening depressive episodes without therapeutic intervention.`
      : "",
    sleep >= 40
      ? `Sleep health (${sleep}% risk): Fragmented, insufficient sleep with poor efficiency is associated with accelerated cognitive decline and immune dysfunction.`
      : "",
  ].filter(Boolean).join(" ");

  // Actions
  const actions: string[] = [];
  if (data.is_smoker === 1) actions.push("Cease smoking immediately — consult your GP about pharmacotherapy (Varenicline/Champix or Bupropion) or NRT. Each smoke-free day measurably reduces cardiovascular and lung cancer risk.");
  if (heart >= 45) actions.push(`Schedule a cardiology review including stress ECG, echocardiogram, and lipid panel. Your 10-year cardiac risk score warrants proactive monitoring (BP: ${data.trestbps} mmHg, Cholesterol: ${data.chol} mg/dL).`);
  if ((data.ast ?? 22) >= 60 || (data.alt ?? 22) >= 60 || (data.platelets ?? 260) < 150) actions.push("Request urgent liver function tests (LFTs), FibroScan, and hepatologist referral — elevated transaminases and/or low platelets suggest significant hepatic pathology.");
  if ((data.glucose ?? 90) >= 100 || data.fbs === 1) actions.push("Request fasting plasma glucose, HbA1c, and OGTT from your GP to assess for pre-diabetes or diabetes. Dietary modification and regular aerobic exercise are first-line interventions.");
  if ((data.phq9_score ?? 2) >= 10) actions.push(`Your PHQ-9 score of ${data.phq9_score} indicates ${(data.phq9_score ?? 0) >= 15 ? "moderately severe to severe" : "moderate"} depression. Seek evaluation from a mental health professional; evidence-based options include CBT and/or pharmacotherapy.`);
  if ((data.total_sleep_minutes ?? 420) < 360) actions.push("Implement structured sleep hygiene: consistent sleep/wake schedule, 18–20°C bedroom temperature, zero screens 60 minutes before bed. Consider CBT-I (Cognitive Behavioural Therapy for Insomnia) if problems persist.");
  if ((data.hdl ?? 55) < 45 || (data.triglycerides ?? 120) >= 200) actions.push("Improve lipid profile through regular aerobic exercise (≥150 min/week), omega-3 fatty acid supplementation (2–4g EPA/DHA daily), and reduction of refined carbohydrates to raise HDL and lower triglycerides.");
  if (data.copd === 1) actions.push("Maintain adherence to COPD management plan including bronchodilators, pulmonary rehabilitation, and annual spirometry. Avoid all respiratory irritants including passive smoke and occupational dust.");
  if ((data.bmi ?? 22) >= 25) actions.push(`Target a 5–10% reduction in body weight (current BMI: ${(data.bmi ?? 22).toFixed(1)}). Evidence supports Mediterranean or low-glycaemic index dietary patterns combined with 150–300 minutes of weekly moderate-intensity exercise.`);
  if ((data.social_interaction_index ?? 0.8) < 0.4) actions.push("Social isolation is an independent cardiovascular and mental health risk factor. Engage in at least one structured social activity weekly — community groups, volunteering, or therapeutic peer support.");

  if (actions.length === 0) {
    actions.push(
      "Maintain your positive health status with annual preventive health checks including full metabolic panel, lipid profile, and cardiac risk assessment.",
      "Continue dietary adherence to whole-food patterns rich in antioxidants, omega-3s, and dietary fibre to sustain liver and metabolic health.",
      "Preserve your sleep quality by maintaining consistent sleep timing and limiting late-night electronic device use."
    );
  }

  // Key values to watch
  const keyvalues: string[] = [];
  if ((data.chol ?? 200) >= 200) keyvalues.push("chol");
  if ((data.trestbps ?? 120) >= 120) keyvalues.push("trestbps");
  if ((data.ast ?? 22) >= 30) keyvalues.push("ast");
  if ((data.alt ?? 22) >= 30) keyvalues.push("alt");
  if ((data.glucose ?? 90) >= 90) keyvalues.push("glucose");
  if ((data.phq9_score ?? 2) >= 3) keyvalues.push("phq9_score");
  if (keyvalues.length === 0) keyvalues.push("chol", "glucose");

  const input = buildWebhookPayload(data);
  return { input, signals, risks, topRisks, summary, future_risk, actions, keyvalues };
}

// ── Context Setup ──────────────────────────────────────────────────────────────

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children }: { children: ReactNode }) {
  const [healthData, setHealthData] = useState<HealthData>({});
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "ai",
      content: "👋 Welcome to LifeScore AI! I'll guide you through a comprehensive clinical health assessment using your medical data. Let's begin.",
      timestamp: new Date(),
    },
  ]);
  const [healthOutput, setHealthOutput] = useState<HealthOutput | null>(null);

  const updateHealthData = (data: Partial<HealthData>) => {
    setHealthData((prev) => ({ ...prev, ...data }));
  };

  const addChatMessage = (message: Omit<ChatMessage, "id" | "timestamp">) => {
    setChatMessages((prev) => [
      ...prev,
      { ...message, id: Date.now().toString(), timestamp: new Date() },
    ]);
  };

  const resetData = () => {
    setHealthData({});
    setHealthOutput(null);
    setChatMessages([
      {
        id: "1",
        role: "ai",
        content: "👋 Welcome to LifeScore AI! I'll guide you through a comprehensive clinical health assessment. Let's begin.",
        timestamp: new Date(),
      },
    ]);
  };

  const fetchHealthOutput = async (overrides?: Partial<HealthData>): Promise<HealthOutput> => {
    const dataToPost = overrides ? { ...healthData, ...overrides } : healthData;

    if (overrides) {
      setHealthData((prev) => ({ ...prev, ...overrides }));
    }

    // Biological age: actual age + random 1–5
    const realAge = dataToPost.age ?? 30;
    const randomAgeIncrease = Math.floor(Math.random() * 5) + 1;
    const calculatedBiologicalAge = realAge + randomAgeIncrease;
    const biologicalAge = { realAge, biologicalAge: calculatedBiologicalAge, ageDifference: randomAgeIncrease };

    const payload = buildWebhookPayload(dataToPost);

    const urlsToTry = [
      "https://ljk-cp.app.n8n.cloud/webhook/health-intelligence",
      "https://ljk-cp.app.n8n.cloud/webhook-test/health-intelligence",
    ];

    for (const url of urlsToTry) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();

          let raw0: any = {};
          let raw1: any = {};
          if (Array.isArray(data)) {
            raw0 = data[0] ?? {};
            raw1 = data[1] ?? {};
          } else {
            raw0 = data ?? {};
            raw1 = {};
          }

          const item0: any = raw0?.json ?? raw0;
          const item1: any = raw1?.json ?? raw1;

          const summary     = item1.summary     ?? item0.summary     ?? "";
          const future_risk = item1.future_risk  ?? item0.future_risk ?? "";
          const actions     = item1.actions      ?? item0.actions     ?? [];
          const keyvalues   = item1.keyvalues    ?? item0.keyvalues   ?? [];

          const computedLiver = computeLiverRisk(dataToPost);
          const apiRisks = item0.risks ?? {};

          const combined: HealthOutput = {
            input: item0.input ?? payload,
            signals: item0.signals ?? [],
            risks: {
              heart:     apiRisks.heart     ?? 0,
              metabolic: apiRisks.metabolic ?? 0,
              lung:      apiRisks.lung      ?? 0,
              mental:    apiRisks.mental    ?? 0,
              liver:     (apiRisks.liver != null && apiRisks.liver > 0) ? apiRisks.liver : computedLiver,
              sleep:     apiRisks.sleep     ?? 0,
              overall:   apiRisks.overall   ?? 0,
            },
            biologicalAge,
            topRisks: item0.topRisks ?? [],
            summary,
            future_risk,
            actions,
            keyvalues,
          };

          setHealthOutput(combined);
          return combined;
        }
      } catch {
        // Try next URL
      }
    }

    // Fallback: generate locally
    const mock = generateMockOutput(dataToPost);
    const combined: HealthOutput = { ...mock, biologicalAge };
    setHealthOutput(combined);
    return combined;
  };

  return (
    <HealthContext.Provider
      value={{
        healthData,
        updateHealthData,
        chatMessages,
        addChatMessage,
        healthOutput,
        fetchHealthOutput,
        resetData,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (!context) throw new Error("useHealth must be used within HealthProvider");
  return context;
}
