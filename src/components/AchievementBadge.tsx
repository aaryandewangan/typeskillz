"use client";

import { motion } from "framer-motion";
import { Lock, Check } from "lucide-react";
import type { Achievement } from "@/lib/achievements";

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  index?: number;
}

export default function AchievementBadge({
  achievement,
  unlocked,
  index = 0,
}: AchievementBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 300 }}
      whileHover={{ scale: 1.05 }}
      className={`relative overflow-hidden rounded-2xl border p-4 text-center transition-all ${
        unlocked
          ? "border-ink bg-ink text-cream shadow-card"
          : "border-hairline bg-paper opacity-55"
      }`}
    >
      {unlocked && (
        <div className="absolute -right-3 -top-3 grid h-7 w-7 place-items-center rounded-full bg-brand-bright text-ink">
          <Check size={14} strokeWidth={3} />
        </div>
      )}
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-white/10">
        {unlocked ? (
          <span className="text-xl">{achievement.icon}</span>
        ) : (
          <Lock size={16} className="text-muted" />
        )}
      </div>
      <p className="mt-2 text-[13px] font-extrabold">{achievement.name}</p>
      <p
        className={`mt-0.5 text-[11.5px] ${
          unlocked ? "text-cream/60" : "text-muted"
        }`}
      >
        {achievement.blurb}
      </p>
    </motion.div>
  );
}
