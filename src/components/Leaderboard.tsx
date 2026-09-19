"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Zap, Users } from "lucide-react";
import { useUserData } from "@/lib/useUserData";
import { listenLeaderboard, type LeaderboardEntry } from "@/lib/firebase-store";

const RANK_ICONS = [Trophy, Medal, Zap];
const RANK_COLORS = ["#ff8709", "#5f58e8", "#0aa63f"];

export default function Leaderboard() {
  const { stats, user } = useUserData();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = listenLeaderboard(20, (data) => {
      setEntries(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const best = stats.bestWpm;
  const myUid = user?.uid;

  const rows = entries.map((e) => ({
    ...e,
    you: e.uid === myUid,
  }));

  const maxWpm = Math.max(...rows.map((r) => r.bestWpm), 1);

  return (
    <div className="rounded-[24px] border border-hairline bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold flex items-center gap-2">
          <Trophy size={18} className="text-tang" /> Global leaderboard
        </h3>
        <span className="flex items-center gap-1 rounded-full bg-paper px-3 py-1 font-mono text-[12px] font-bold text-muted">
          <Users size={12} /> {entries.length} ranked
        </span>
      </div>

      {loading ? (
        <div className="mt-6 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 rounded-2xl bg-paper animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-6 text-center py-8">
          <p className="text-[14px] text-muted">
            No one on the board yet. Be the first!
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {rows.map((r, i) => {
            const RankIcon = i < 3 ? RANK_ICONS[i] : null;
            const barWidth = (r.bestWpm / maxWpm) * 100;
            return (
              <motion.div
                key={r.uid}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`relative overflow-hidden rounded-2xl px-4 py-3 ${
                  r.you
                    ? "border-2 border-brand-bright bg-brand-soft text-ink"
                    : "bg-paper"
                }`}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-2xl opacity-10"
                  style={{ width: `${barWidth}%`, background: i < 3 ? RANK_COLORS[i] : "#666" }}
                />
                <div className="relative flex items-center gap-3">
                  <span className="w-7 text-center font-black text-[14px]">
                    {RankIcon ? (
                      <RankIcon
                        size={16}
                        style={{ color: RANK_COLORS[i] }}
                        className="mx-auto"
                      />
                    ) : (
                      <span className="text-muted">{i + 1}</span>
                    )}
                  </span>
                  <div
                    className="grid h-8 w-8 place-items-center rounded-full text-[12px] font-bold text-white"
                    style={{ background: i < 3 ? RANK_COLORS[i] : "#999" }}
                  >
                    {r.displayName[0].toUpperCase()}
                  </div>
                  <span className="flex-1 font-bold text-[14px]">
                    {r.displayName}
                    {r.you && (
                      <span className="ml-1.5 rounded-full bg-brand px-2 py-0.5 text-[10px] font-extrabold text-white">
                        YOU
                      </span>
                    )}
                  </span>
                  <span className="font-mono font-bold tabular-nums text-[14px]">
                    {r.bestWpm} <span className="text-muted text-[12px]">wpm</span>
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

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
