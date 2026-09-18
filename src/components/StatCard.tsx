"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  className?: string;
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "#0aa63f",
  className = "",
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`group relative overflow-hidden rounded-[22px] border border-hairline bg-white p-5 shadow-card ${className}`}
    >
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: color }}
      />
      <div className="flex items-start justify-between">
        <div
          className="grid h-10 w-10 place-items-center rounded-xl"
          style={{ background: `${color}15` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        <span className="rounded-full bg-paper px-2.5 py-1 text-[11px] font-bold text-muted">
          {label}
        </span>
      </div>
      <p className="mt-3 text-[32px] font-black tracking-tight tabular-nums">
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 text-[13px] text-muted font-medium">{sub}</p>
      )}
    </motion.div>
  );
}
