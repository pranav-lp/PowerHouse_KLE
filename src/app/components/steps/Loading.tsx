import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useHealth } from "../../context/HealthContext";
import { motion } from "motion/react";
import { Sparkles, Brain, Heart, Activity, AlertCircle } from "lucide-react";

export function Loading() {
  const navigate = useNavigate();
  const { fetchHealthOutput } = useHealth();
  const [error, setError] = useState<string | null>(null);
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [fetchComplete, setFetchComplete] = useState(false);
  const fetchedRef = useRef(false);

  // Minimum display time so animations have time to play
  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  // POST to n8n webhook and fetch result
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetchHealthOutput()
      .then(() => setFetchComplete(true))
      .catch((err) => {
        console.error("Webhook error:", err);
        setError("Unable to connect to the health analysis service. Please try again.");
      });
  }, [fetchHealthOutput]);

  // Navigate when both conditions are met
  useEffect(() => {
    if (minTimePassed && fetchComplete) {
      navigate("/dashboard");
    }
  }, [minTimePassed, fetchComplete, navigate]);

  const loadingSteps = [
    { icon: Brain, text: "Analyzing your lifestyle patterns...", delay: 0 },
    { icon: Heart, text: "Calculating health risks...", delay: 1 },
    { icon: Activity, text: "Predicting biological age...", delay: 2 },
    { icon: Sparkles, text: "Generating personalized insights...", delay: 3 },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/70 backdrop-blur-xl rounded-3xl border border-purple-200 shadow-2xl p-12 text-center"
        >
          {/* Logo/Icon */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center"
          >
            <Sparkles className="w-12 h-12 text-white" />
          </motion.div>

          {/* Title */}
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            AI Analysis in Progress
          </h2>
          <p className="text-gray-600 mb-12">
            Our AI is processing your health data to generate personalized insights
          </p>

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-left"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">Connection Error</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setFetchComplete(false);
                    fetchedRef.current = false;
                    fetchHealthOutput()
                      .then(() => setFetchComplete(true))
                      .catch((err) => {
                        setError("Unable to connect to the health analysis service. Please try again.");
                      });
                  }}
                  className="mt-3 px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </motion.div>
          )}

          {/* Loading Steps */}
          <div className="space-y-6">
            {loadingSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: step.delay, duration: 0.5 }}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    delay: step.delay,
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                  className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <step.icon className="w-5 h-5 text-white" />
                </motion.div>
                <p className="text-left text-sm font-medium text-gray-700">{step.text}</p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: step.delay + 0.5 }}
                  className="ml-auto"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full"
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-12">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                initial={{ width: "0%" }}
                animate={{ width: fetchComplete ? "100%" : "85%" }}
                transition={{ duration: fetchComplete ? 0.3 : 4, ease: "linear" }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {fetchComplete ? "Analysis complete! Loading your results..." : "Communicating with AI health engine..."}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
