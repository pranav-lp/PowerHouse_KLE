import { motion } from "motion/react";

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="mt-4">
      <div className="relative h-2 bg-slate-200/50 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] rounded-full shadow-sm"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <p className="text-xs text-gray-500 font-medium mt-1.5 text-right">{Math.round(progress)}% Complete</p>
    </div>
  );
}
