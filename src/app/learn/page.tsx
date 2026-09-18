"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, ArrowRight, Zap } from "lucide-react";
import { TRACK_DEFS, TOTAL_LESSONS, searchLessons } from "@/lib/lessons";
import { completedLessonIds } from "@/lib/stats";
import TrackCard from "@/components/TrackCard";

export default function LearnPage() {
  const [q, setQ] = useState("");
  const done = useMemo(() => {
    try {
      return completedLessonIds();
    } catch {
      return new Set<string>();
    }
  }, []);
  const results = useMemo(() => searchLessons(q, 12), [q]);

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 pb-10">
      <p className="eyebrow">{"{ curriculum }"}</p>
      <h1 className="display-giant mt-2 text-5xl sm:text-7xl">
        LEARN<span className="text-muted">.</span>
      </h1>
      <p className="mt-3 max-w-2xl text-[16.5px] text-ink-soft">
        {TOTAL_LESSONS.toLocaleString()} lessons across {TRACK_DEFS.length}{" "}
        tracks — nearly 4x TypingClub. Search anything, or follow a path from
        home row to 100 WPM.
      </p>

      <div className="mt-6 flex gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search lessons: code, dvorak, spanish, sprint, paragraph..."
            className="w-full rounded-full border border-hairline bg-white pl-11 pr-5 py-3.5 text-[15px] outline-none focus:border-ink shadow-card"
          />
        </div>
        <Link
          href="/practice"
          className="pill-btn hidden sm:inline-flex shrink-0 items-center bg-ink text-cream px-6 font-bold"
        >
          Custom text
        </Link>
      </div>

      {q.trim() !== "" && (
        <section className="mt-6 rounded-[24px] border border-hairline bg-white p-5 shadow-card">
          <p className="text-[13px] font-bold tracking-widest text-muted">
            SEARCH RESULTS
          </p>
          <div className="mt-3 grid gap-1.5">
            {results.map((l) => (
              <Link
                key={l.id}
                href={`/lesson/${l.id}`}
                className="group flex items-center justify-between rounded-xl border border-transparent bg-paper px-4 py-3 hover:border-hairline hover:bg-white transition-all"
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-nested text-[11px] font-black text-muted">
                    {l.index}
                  </span>
                  <span className="min-w-0">
                    <b className="text-[14px] block truncate">{l.title}</b>
                    <span className="text-[12.5px] text-muted">
                      {l.trackId} · {l.targetWpm} wpm
                    </span>
                  </span>
                </span>
                <ArrowRight size={14} className="text-muted shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
            {results.length === 0 && (
              <p className="text-muted">No matches. Try "code" or "chapter".</p>
            )}
          </div>
        </section>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TRACK_DEFS.map((t) => {
          const count = [...done].filter((id) => id.startsWith(t.id + "-")).length;
          return <TrackCard key={t.id} track={t} completed={count} />;
        })}
      </div>

      <section className="mt-10 rounded-[24px] bg-ink text-cream p-7">
        <p className="font-mono text-[13px] text-cream/60">
          {"{ beyond typingclub }"}
        </p>
        <h2 className="mt-1 text-2xl font-extrabold">Only on TypeSkillz</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 text-[14px]">
          {[
            ["Code Typing", "180 real snippets"],
            ["Races", "live + bots"],
            ["25 languages", "native sentences"],
            ["10 layouts", "dvorak to colemak"],
            ["Heatmaps", "finger analytics"],
            ["Arcade", "falling words + more"],
            ["20 achievements", "streaks + XP levels"],
            ["Command search", "press / anywhere"],
            ["Paragraph Marathon", "1,050 paragraphs"],
          ].map(([a, b]) => (
            <div
              key={a}
              className="rounded-2xl border border-cream/15 p-4"
            >
              <p className="font-bold">{a}</p>
              <p className="text-cream/60">{b}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
