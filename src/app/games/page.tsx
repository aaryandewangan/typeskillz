"use client";

import Link from "next/link";
import { Zap, Flame, BookOpen, ArrowRight, Trophy } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import SignInGate from "@/components/SignInGate";
import Leaderboard from "@/components/Leaderboard";

const GAMES = [
  {
    href: "/games/race",
    title: "Race",
    blurb: "Race against bots or challenge a friend in real-time.",
    icon: Zap,
    color: "#0aa63f",
    soft: "#dfffd1",
  },
  {
    href: "/games/word-fall",
    title: "Word Fall",
    blurb: "Type the highlighted word before it disappears. Solo or multiplayer.",
    icon: Flame,
    color: "#ff8709",
    soft: "#fff0dc",
  },
  {
    href: "/games/marathon",
    title: "Paragraph Marathon",
    blurb: "1,050 paragraphs of pure typing endurance. Head-to-head available.",
    icon: BookOpen,
    color: "#008fb8",
    soft: "#dcf5fc",
  },
];

export default function GamesPage() {
  const { user, loading } = useAuth();

  const content = (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 pb-10">
      <p className="eyebrow">{"{ arcade }"}</p>
      <h1 className="display-giant mt-2 text-5xl sm:text-7xl">
        GAMES<span className="text-muted">.</span>
      </h1>
      <p className="mt-3 max-w-2xl text-[16px] text-ink-soft">
        Every game has its own page, its own rooms, and its own leaderboard.
        Pick a game to start.
      </p>

      {/* game cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((g) => {
          const Icon = g.icon;
          return (
            <Link
              key={g.href}
              href={g.href}
              className="group rounded-[24px] border border-hairline bg-white p-6 shadow-card hover:shadow-float transition-all"
            >
              <div className="flex items-start justify-between">
                <div
                  className="grid h-12 w-12 place-items-center rounded-2xl transition-transform group-hover:scale-105"
                  style={{ background: g.soft }}
                >
                  <Icon size={22} strokeWidth={2.2} style={{ color: g.color }} />
                </div>
              </div>
              <h3 className="mt-4 text-[18px] font-extrabold group-hover:underline">
                {g.title}
              </h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
                {g.blurb}
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[13px] font-bold text-ink-soft group-hover:text-ink transition-colors">
                Open <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* leaderboard + endurance */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Leaderboard />
        <div className="rounded-[24px] border border-hairline bg-white p-6 shadow-card">
          <h3 className="text-xl font-extrabold flex items-center gap-2">
            <Trophy size={18} className="text-tang" /> Quick stats
          </h3>
          <p className="mt-1 text-[14px] text-muted">
            Your best WPM, total sessions, and streak — all synced to your account.
          </p>
          <Link
            href="/stats"
            className="pill-btn mt-4 inline-flex items-center gap-2 bg-ink text-cream px-5 py-2.5 text-[13.5px] font-bold"
          >
            View stats <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </main>
  );

  if (!user) return <SignInGate loading={loading}>{content}</SignInGate>;
  return content;
}
