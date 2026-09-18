"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3,
  Target,
  CheckCircle2,
  Timer,
  Zap,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { useUserData } from "@/lib/useUserData";
import { useAuth } from "@/components/AuthProvider";
import StatCard from "@/components/StatCard";
import SignInGate from "@/components/SignInGate";

function Bars({ data }: { data: number[] }) {
  const max = Math.max(10, ...data);
  return (
    <div className="flex h-32 items-end gap-1.5">
      {data.length === 0 && (
        <p className="text-muted text-[14px]">
          No runs yet —{" "}
          <Link className="underline" href="/lesson/home-row-1">
            type your first lesson
          </Link>
          .
        </p>
      )}
      {data.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${Math.max(6, (v / max) * 100)}%` }}
          transition={{ delay: i * 0.03, duration: 0.4 }}
          className="flex-1 rounded-t-lg bg-ink/90"
          title={`${v} wpm`}
        />
      ))}
    </div>
  );
}

export default function StatsPage() {
  const { user, loading: authLoading } = useAuth();
  const { results, stats, streak, level, loading: dataLoading } = useUserData();

  const loading = authLoading || dataLoading;
  const mounted = !loading;

  if (!mounted)
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">Loading stats...</main>
    );

  const weak = (() => {
    const map = new Map<string, number>();
    for (const r of results.slice(-120)) {
      for (const k of r.weakKeys) map.set(k, (map.get(k) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([key, misses]) => ({ key, misses }))
      .sort((a, b) => b.misses - a.misses)
      .slice(0, 12);
  })();

  const hist = results.slice(-30).map((r) => r.wpm);
  const recent = [...results].reverse().slice(0, 8);

  const content = (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 pb-10">
      <p className="eyebrow">{"{ analytics }"}</p>
      <h1 className="display-giant mt-2 text-5xl sm:text-7xl">
        STATS<span className="text-muted">.</span>
      </h1>
      <p className="mt-3 text-[16px] text-ink-soft">
        Finger-level insight TypingClub never gave you. All synced to your account — private by default.
      </p>

      <div className="mt-6 grid gap-3 grid-cols-2 lg:grid-cols-5">
        <StatCard icon={BarChart3} label="AVG WPM" value={stats.avgWpm.toFixed(0)} color="#0aa63f" />
        <StatCard icon={Zap} label="BEST WPM" value={String(stats.bestWpm)} color="#ff8709" />
        <StatCard icon={Target} label="ACCURACY" value={`${stats.avgAcc.toFixed(1)}%`} color="#c026b8" />
        <StatCard icon={CheckCircle2} label="SESSIONS" value={String(stats.sessions)} color="#5f58e8" />
        <StatCard icon={TrendingUp} label="XP" value={stats.xp.toLocaleString()} color="#008fb8" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[24px] border border-hairline bg-white p-6 shadow-card">
          <h2 className="font-extrabold text-[18px] flex items-center gap-2">
            <TrendingUp size={18} className="text-brand" /> WPM curve{" "}
            <span className="text-muted font-medium text-[13px]">
              — last {hist.length} runs
            </span>
          </h2>
          <div className="mt-4">
            <Bars data={hist} />
          </div>
        </div>
        <div className="rounded-[24px] border border-hairline bg-white p-6 shadow-card">
          <h2 className="font-extrabold text-[18px] flex items-center gap-2">
            <Target size={18} className="text-rose" /> Weak keys heatmap
          </h2>
          {weak.length === 0 ? (
            <p className="mt-2 text-[14px] text-muted">
              Finish a few lessons and your troublemakers appear here with
              targeted drills.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {weak.map((w) => (
                <Link
                  key={w.key}
                  href="/learn/accuracy-lab"
                  className="rounded-2xl border border-hairline bg-paper px-4 py-2.5 font-mono font-bold hover:bg-rose-soft transition-colors"
                  title={`${w.misses} misses`}
                >
                  {w.key === " " ? "space" : w.key}{" "}
                  <span className="text-rose">x{w.misses}</span>
                </Link>
              ))}
            </div>
          )}
          <Link
            href="/learn/accuracy-lab"
            className="pill-btn mt-4 inline-flex items-center gap-2 bg-ink text-cream px-5 py-2.5 text-[13.5px] font-bold"
          >
            Drill weak keys <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="mt-4 rounded-[24px] border border-hairline bg-white p-6 shadow-card">
        <h2 className="font-extrabold text-[18px] flex items-center gap-2">
          <Timer size={18} className="text-muted" /> Recent runs
        </h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-[14px] text-muted">
            Nothing yet. Your history, ghosts, and PBs will live here.
          </p>
        ) : (
          <div className="mt-3 grid gap-2">
            {recent.map((r, i) => (
              <div
                key={`${r.at}-${i}`}
                className="flex items-center justify-between rounded-2xl border border-hairline bg-paper px-4 py-3 text-[14px]"
              >
                <Link
                  href={`/lesson/${r.lessonId}`}
                  className="font-bold hover:underline"
                >
                  {r.lessonId}
                </Link>
                <span className="font-mono">
                  {r.wpm} wpm · {r.accuracy}% · {r.durationSec}s
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );

  if (!user) {
    return <SignInGate loading={loading}>{content}</SignInGate>;
  }

  return content;
}
