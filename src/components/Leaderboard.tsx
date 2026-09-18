"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, Medal, Zap } from "lucide-react";
import { useUserData } from "@/lib/useUserData";

const BOTS = [
  { name: "Blaze", wpm: 82, color: "#ff8709" },
  { name: "Dash", wpm: 58, color: "#5f58e8" },
  { name: "Tappy", wpm: 31, color: "#0aa63f" },
  { name: "Pip", wpm: 44, color: "#008fb8" },
  { name: "Nova", wpm: 67, color: "#c026b8" },
];

const RANK_ICONS = [Trophy, Medal, Zap];

export default function Leaderboard() {
  const { stats } = useUserData();
  const best = stats.bestWpm;

  const rows = [
    ...BOTS.map((b) => ({ ...b, you: false })),
    ...(best > 0 ? [{ name: "You", wpm: best, color: "#0aa63f", you: true }] : []),
  ].sort((a, b) => b.wpm - a.wpm);

  const maxWpm = Math.max(...rows.map((r) => r.wpm), 1);

  return (
    <div className="rounded-[24px] border border-hairline bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold flex items-center gap-2">
          <Trophy size={18} className="text-tang" /> Weekly leaderboard
        </h3>
        <span className="rounded-full bg-paper px-3 py-1 font-mono text-[12px] font-bold text-muted">
          resets Monday
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {rows.map((r, i) => {
          const RankIcon = RANK_ICONS[i] ?? null;
          const barWidth = (r.wpm / maxWpm) * 100;
          return (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`relative overflow-hidden rounded-2xl px-4 py-3 ${
                r.you
                  ? "border-2 border-brand-bright bg-brand-soft text-ink"
                  : "bg-paper"
              }`}
            >
              {/* background bar */}
              <div
                className="absolute inset-y-0 left-0 rounded-2xl opacity-10"
                style={{ width: `${barWidth}%`, background: r.color }}
              />
              <div className="relative flex items-center gap-3">
                <span className="w-7 text-center font-black text-[14px]">
                  {RankIcon ? (
                    <RankIcon
                      size={16}
                      style={{ color: r.color }}
                      className="mx-auto"
                    />
                  ) : (
                    <span className="text-muted">{i + 1}</span>
                  )}
                </span>
                <div
                  className="grid h-8 w-8 place-items-center rounded-full text-[12px] font-bold text-white"
                  style={{ background: r.color }}
                >
                  {r.name[0]}
                </div>
                <span className="flex-1 font-bold text-[14px]">
                  {r.name}
                  {r.you && (
                    <span className="ml-1.5 rounded-full bg-brand px-2 py-0.5 text-[10px] font-extrabold text-white">
                      YOU
                    </span>
                  )}
                </span>
                <span className="font-mono font-bold tabular-nums text-[14px]">
                  {r.wpm} <span className="text-muted text-[12px]">wpm</span>
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {best === 0 ? (
        <p className="mt-3 text-[13.5px] text-muted">
          Finish any{" "}
          <Link href="/lesson/home-row-1" className="underline font-bold text-brand">
            lesson
          </Link>{" "}
          to enter the board.
        </p>
      ) : (
        <p className="mt-3 text-[13.5px] text-muted">
          Your PB: {best} wpm.{" "}
          <Link href="/learn/speed-builders" className="underline font-bold text-brand">
            Train to climb
          </Link>
        </p>
      )}
    </div>
  );
}
