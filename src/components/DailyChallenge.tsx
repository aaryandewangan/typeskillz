"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, Zap } from "lucide-react";
import { paragraphOfTheDay, type Paragraph } from "@/lib/paragraphs";

export default function DailyChallenge() {
  const [para, setPara] = useState<Paragraph | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const p = paragraphOfTheDay();
    setPara(p);
    try {
      const raw = localStorage.getItem("typeskillz:daily");
      const today = new Date().toDateString();
      setDone(raw === `${today}:${p.id}`);
    } catch {}
  }, []);

  if (!para) return null;
  const lessonId = `paragraph-marathon-${para.index}`;

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-ink text-cream p-7 sm:p-9 shadow-float">
      <div className="absolute -left-12 -top-12 h-56 w-56 rounded-full bg-brand-bright/20 blur-3xl" />
      <div className="absolute -bottom-12 -right-12 h-56 w-56 rounded-full bg-tang/20 blur-3xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-5">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={14} className="text-brand-bright" />
            <p className="font-mono text-[12.5px] font-bold tracking-widest text-brand-bright">
              DAILY CHALLENGE · {para.category} · level {para.level}
            </p>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {done ? "Done for today." : `Today: ${para.title}`}
          </h2>
          <p className="mt-2 line-clamp-2 font-mono text-[13.5px] text-cream/60">
            {para.text}
          </p>
        </div>
        <Link
          href={`/lesson/${lessonId}`}
          className="pill-btn shrink-0 flex items-center gap-2 bg-brand-bright px-7 py-3.5 font-extrabold text-ink hover:brightness-110"
        >
          <Zap size={16} />
          {done ? "Play again" : "Take the challenge"}
        </Link>
      </div>
    </div>
  );
}
