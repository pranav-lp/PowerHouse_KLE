import { useState, useEffect, useRef } from "react";
import { useHealth } from "../context/HealthContext";
import { Bot, Send, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const CHAT_WEBHOOK_URL = "https://ljk-cp.app.n8n.cloud/webhook-test/chat";

export function AIChatbot() {
  const { chatMessages, addChatMessage, healthData, healthOutput } = useHealth();
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recommendationsSentRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Auto-inject recommendations as bullet points when health output arrives
  useEffect(() => {
    if (healthOutput && !recommendationsSentRef.current && healthOutput.actions?.length > 0) {
      recommendationsSentRef.current = true;

      // Brief greeting first
      addChatMessage({
        role: "ai",
        content: `🎉 Your LifeScore AI analysis is complete! Here's a quick summary:\n\n📊 **Biological Age:** ${healthOutput.biologicalAge.biologicalAge} (actual: ${healthOutput.biologicalAge.realAge}) — ${healthOutput.biologicalAge.ageDifference > 0 ? `${healthOutput.biologicalAge.ageDifference} years older than your real age` : healthOutput.biologicalAge.ageDifference < 0 ? `${Math.abs(healthOutput.biologicalAge.ageDifference)} years younger than your real age` : "matches your real age"}.\n\n${healthOutput.summary}`,
      });

      // Then drop recommendations as a bullet-list message
      setTimeout(() => {
        addChatMessage({
          role: "ai",
          content: healthOutput.actions.join("\n"),
          isBulletList: true,
        });
      }, 800);
    }
  }, [healthOutput, addChatMessage]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessageText = inputMessage;
    addChatMessage({ role: "user", content: userMessageText });
    setInputMessage("");
    setIsTyping(true);

    try {
      // POST message + userId to n8n chat webhook
      const response = await fetch(CHAT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessageText,
          userId: "lifescore_user",
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat webhook failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract AI response from webhook response
      // Adapt this based on your n8n chat webhook's actual response format
      let aiResponse = "";
      if (typeof data === "string") {
        aiResponse = data;
      } else if (data?.response) {
        aiResponse = data.response;
      } else if (data?.message) {
        aiResponse = data.message;
      } else if (data?.json?.response) {
        aiResponse = data.json.response;
      } else if (data?.json?.message) {
        aiResponse = data.json.message;
      } else {
        // Fallback to local AI response if webhook doesn't return expected format
        aiResponse = generateAIResponse(userMessageText, healthData, healthOutput);
      }

      addChatMessage({ role: "ai", content: aiResponse });
    } catch (error) {
      console.error("Chat webhook error:", error);
      // Fallback to local AI response on error
      const fallbackResponse = generateAIResponse(userMessageText, healthData, healthOutput);
      addChatMessage({ role: "ai", content: fallbackResponse });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-teal-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden h-[calc(100vh-180px)] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Health Assistant</h3>
            <p className="text-xs text-teal-50">Powered by LifeScore AI</p>
          </div>
          {healthOutput && (
            <div className="ml-auto flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
              <span className="text-xs text-white font-medium">Analysis Ready</span>
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {chatMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                  message.role === "ai"
                    ? "bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6]"
                    : "bg-slate-200"
                }`}
              >
                {message.role === "ai" ? (
                  <Sparkles className="w-4 h-4 text-white" />
                ) : (
                  <span className="text-sm font-medium text-slate-500">U</span>
                )}
              </div>

              <div
                className={`flex-1 p-3.5 rounded-2xl shadow-sm ${
                  message.role === "ai"
                    ? "bg-gradient-to-br from-white to-teal-50/50 border border-teal-100/50 rounded-tl-sm"
                    : "bg-white border border-slate-100 rounded-tr-sm"
                }`}
              >
                {message.isBulletList ? (
                  <BulletListMessage actions={message.content.split("\n")} />
                ) : (
                  <FormattedMessage content={message.content} />
                )}
                <p className="text-[10px] font-medium text-slate-400 mt-2">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-white to-teal-50/50 border border-teal-100/50 rounded-tl-sm shadow-sm">
              <div className="flex gap-1.5 items-center h-full">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 bg-[#2EC4B6]/50 rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/80 backdrop-blur-md border-t border-teal-100/30">
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask anything about your health..."
            className="flex-1 px-5 py-2.5 bg-white/60 rounded-full border border-teal-100/50 focus:outline-none focus:ring-2 focus:ring-[#2EC4B6]/30 focus:border-[#2EC4B6]/50 text-[15px] shadow-sm transition-all"
          />
          <button
            onClick={handleSendMessage}
            className="w-[42px] h-[42px] rounded-full bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] flex items-center justify-center shadow-[0_4px_14px_rgba(46,196,182,0.3)] hover:shadow-[0_6px_20px_rgba(46,196,182,0.4)] transition-all hover:-translate-y-0.5"
          >
            <Send className="w-4 h-4 text-white ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Renders a bullet-list message with recommendation cards
function BulletListMessage({ actions }: { actions: string[] }) {
  return (
    <div>
      <p className="text-[15px] font-semibold text-[#1F2937] mb-3 flex items-center gap-1.5">
        <CheckCircle2 className="w-4 h-4 text-[#2EC4B6]" />
        Your Personalized Health Recommendations
      </p>
      <ul className="space-y-3">
        {actions.filter(Boolean).map((action, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12 }}
            className="flex items-start gap-3 bg-white/60 p-2.5 rounded-xl border border-teal-50 shadow-sm"
          >
            <span className="w-6 h-6 bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <span className="text-white text-[11px] font-bold">{i + 1}</span>
            </span>
            <span className="text-[14px] text-[#6B7280] leading-snug">{action}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

// Renders a regular AI message preserving newlines and bold (**text**)
function FormattedMessage({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="text-[15px] text-[#6B7280] space-y-2 leading-relaxed">
      {lines.map((line, i) => {
        if (!line.trim()) return <br key={i} className="hidden" />;
        // Simple bold rendering: **text**
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i}>
            {parts.map((part, j) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={j} className="text-[#1F2937] font-semibold">{part.slice(2, -2)}</strong>
              ) : (
                part
              )
            )}
          </p>
        );
      })}
    </div>
  );
}

// Context-aware AI response generator
function generateAIResponse(userMessage: string, healthData: any, healthOutput: any): string {
  const lowerMessage = userMessage.toLowerCase();

  if (healthOutput) {
    const { risks, biologicalAge, actions, summary } = healthOutput;
    const { realAge, biologicalAge: bioAge, ageDifference } = biologicalAge;

    if (lowerMessage.includes("risk") || lowerMessage.includes("score")) {
      return `📊 Your overall risk score is **${risks.overall}%**. Your top risks are: heart (${risks.heart}%), metabolic (${risks.metabolic}%), and lung (${risks.lung}%). Focus on the recommended actions to bring these down.`;
    }

    if (lowerMessage.includes("age") || lowerMessage.includes("biological")) {
      return `🧬 Your biological age is **${bioAge}** vs your actual age of **${realAge}**. That's a difference of **${ageDifference > 0 ? "+" : ""}${ageDifference} years**. The good news: consistent lifestyle improvements can reverse this gap.`;
    }

    if (lowerMessage.includes("action") || lowerMessage.includes("recommend") || lowerMessage.includes("what should")) {
      return `🎯 Based on your assessment, here are your top priorities:\n\n${actions.map((a: string, i: number) => `${i + 1}. ${a}`).join("\n")}`;
    }

    if (lowerMessage.includes("heart")) {
      return `❤️ Your heart health risk is **${risks.heart}%** — ${risks.heart >= 60 ? "this is high and needs urgent attention" : risks.heart >= 30 ? "moderate, with clear room for improvement" : "relatively low, keep it up!"}. Focus on exercise, diet quality, and stress reduction.`;
    }

    if (lowerMessage.includes("lung")) {
      return `🫁 Your lung health risk is **${risks.lung}%**. ${risks.lung >= 30 ? "Reducing smoking, improving air quality exposure, and aerobic exercise are key actions." : "Your lungs are in reasonable shape — keep up active habits."}`;
    }

    if (lowerMessage.includes("mental") || lowerMessage.includes("stress")) {
      return `🧠 Your mental health risk score is **${risks.mental}%**. ${healthData.stress === "high" ? "High stress was flagged — daily mindfulness, better sleep, and reduced screen time can make a significant difference." : "Your stress levels seem manageable. Keep maintaining healthy coping strategies."}`;
    }

    if (lowerMessage.includes("sleep")) {
      return `🌙 Your sleep health risk is **${risks.sleep}%**. ${(healthData.sleep || 0) < 7 ? `You reported ${healthData.sleep} hours — aim for 7-9. A consistent bedtime routine and reducing screen time before bed will help.` : "Great sleep habits! Keep the consistency for optimal recovery and cognitive function."}`;
    }
  }

  // Questionnaire-aware responses (before output is available)
  if (lowerMessage.includes("sleep")) {
    return `🌙 Adults should aim for 7-9 hours of quality sleep per night. ${healthData.sleep && healthData.sleep < 7 ? `You reported ${healthData.sleep} hours — try a consistent bedtime routine to improve this.` : "Good sleep is crucial for longevity, cognitive function, and overall health."}`;
  }

  if (lowerMessage.includes("stress")) {
    return "🧘 To reduce stress: 1) 10-minute daily meditation 2) Regular exercise 3) Limit screen time before bed 4) Practice deep breathing 5) Connect with loved ones. Chronic stress can age you faster!";
  }

  if (lowerMessage.includes("exercise") || lowerMessage.includes("workout")) {
    return "💪 Aim for at least 150 minutes of moderate exercise per week. Mix cardio with strength training and flexibility work. Consistency is the key to longevity!";
  }

  if (lowerMessage.includes("diet") || lowerMessage.includes("food") || lowerMessage.includes("eat")) {
    return "🥗 For optimal longevity: Focus on whole foods, colorful vegetables, lean proteins, healthy fats, and limit processed foods. The Mediterranean diet is strongly linked to longer, healthier lives!";
  }

  if (lowerMessage.includes("smoking") || lowerMessage.includes("quit")) {
    return "🚭 Quitting smoking is the single best action for your health. Within 1 year, heart disease risk drops by 50%! Consider nicotine replacement therapy or a quit support app.";
  }

  return "💡 I'm here to help you understand your health data! Ask me about your risks, biological age, recommended actions, sleep, exercise, diet, or stress. What would you like to explore?";
}