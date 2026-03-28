import { Outlet, useLocation } from "react-router";
import { AIChatbot } from "./AIChatbot";
import { ProgressBar } from "./ProgressBar";
import { motion } from "motion/react";

const steps = [
  { path: "/", label: "Basic Info" },
  { path: "/body-metrics", label: "Body & Vitals" },
  { path: "/lifestyle", label: "Cardiac Panel" },
  { path: "/exercise", label: "ECG Results" },
  { path: "/diet", label: "Smoking & Lung" },
  { path: "/habits", label: "Blood & Liver" },
  { path: "/work-mental-health", label: "Sleep Analysis" },
  { path: "/history", label: "Mental Health" },
];

export function QuestionnaireLayout() {
  const location = useLocation();
  const currentStepIndex = steps.findIndex((step) => step.path === location.pathname);
  const progress = currentStepIndex >= 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0;

  const isLoading = location.pathname === "/loading";
  const isDashboard = location.pathname === "/dashboard";

  // Loading page: full-screen, no layout chrome
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50/50 to-teal-50">
        <Outlet />
      </div>
    );
  }

  // Dashboard: split layout — results left (2/3), chatbot right (1/3)
  if (isDashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50/50 to-teal-50">
        {/* Minimal header for dashboard */}
        <header className="bg-white/60 backdrop-blur-xl border-b border-teal-100/50 sticky top-0 z-10 shadow-sm shadow-teal-100/20">
          <div className="max-w-screen-2xl mx-auto px-6 py-4 flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] bg-clip-text text-transparent">
                LifeScore AI
              </h1>
              <span className="text-xs text-gray-400">|</span>
              <span className="text-sm text-gray-600 font-medium">Your Health Dashboard</span>
            </div>
            <p className="text-[15px] font-medium text-gray-500">
              Just 10 minutes today can predict your health for the next 10 years.
            </p>
          </div>
        </header>

        <div className="max-w-screen-2xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left / Centre — Dashboard content (scrollable) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-2"
            >
              <Outlet />
            </motion.div>

            {/* Right — AI Chatbot with recommendations */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <AIChatbot />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Questionnaire steps: split layout with form and chatbot
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50/50 to-teal-50">
      {/* Header */}
      <header className="bg-white/60 backdrop-blur-xl border-b border-teal-100/50 sticky top-0 z-10 shadow-sm shadow-teal-100/20">
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] bg-clip-text text-transparent">
                LifeScore AI
              </h1>
              <p className="text-[15px] font-medium text-gray-500">
                Just 10 minutes today can predict your health for the next 10 years.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">
                Step {currentStepIndex + 1} of {steps.length}
              </p>
              <p className="text-xs text-gray-500">{steps[currentStepIndex]?.label}</p>
            </div>
          </div>
          <ProgressBar progress={progress} />
        </div>
      </header>

      {/* Main Content - Split Layout */}
      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Form (2/3) */}
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-2"
          >
            <Outlet />
          </motion.div>

          {/* Right Side - AI Chatbot (1/3) */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <AIChatbot />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}