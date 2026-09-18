"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Shuffle } from "lucide-react";
import { useMemo } from "react";
import TypingEngine from "@/components/TypingEngine";
import {
  PRACTICE_TEXTS,
  PRACTICE_TOTAL,
  CATEGORY_META,
} from "@/lib/practice-texts";

export default function PracticeDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const text = useMemo(() => PRACTICE_TEXTS.find((t) => t.id === id), [id]);

  if (!text) {
    return (
      <main className="mx-auto max-w-4xl px-4 sm:px-6 pb-10">
        <Link
          href="/practice"
          className="inline-flex items-center gap-1 text-[14px] font-bold text-muted hover:text-ink"
        >
          <ArrowLeft size={14} /> All texts
        </Link>
        <div className="mt-12 text-center">
          <p className="text-[18px] font-bold">Text not found</p>
          <Link href="/practice" className="mt-2 pill-btn bg-ink text-cream px-5 py-2.5 font-bold inline-flex">
            Browse all texts
          </Link>
        </div>
      </main>
    );
  }

  const meta = CATEGORY_META[text.category];
  const idx = PRACTICE_TEXTS.findIndex((t) => t.id === id);
  const prev = idx > 0 ? PRACTICE_TEXTS[idx - 1] : null;
  const next = idx < PRACTICE_TEXTS.length - 1 ? PRACTICE_TEXTS[idx + 1] : null;

  // Random text in same category
  const randomInCategory = useMemo(() => {
    const pool = PRACTICE_TEXTS.filter((t) => t.category === text.category && t.id !== text.id);
    return pool[Math.floor(Math.random() * pool.length)] ?? PRACTICE_TEXTS[0];
  }, [text]);

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 pb-10">
      <div className="flex items-center justify-between text-[14px] font-bold">
        <Link href="/practice" className="text-muted hover:text-ink">
          ← All texts
        </Link>
        <span className="rounded-full bg-white border border-hairline px-3 py-1 tabular-nums">
          {idx + 1} / {PRACTICE_TOTAL.toLocaleString()}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className="rounded-full px-3 py-1 text-[12.5px] font-extrabold"
          style={{ background: meta.color + "18", color: meta.color }}
        >
          {meta.label}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {text.name}
        </h1>
      </div>

      <div className="mt-5">
        <TypingEngine
          text={text.text}
          title={text.name}
          targetWpm={45}
          accent={meta.color}
        />
      </div>

      {/* navigation */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {prev ? (
          <Link
            href={`/practice/${prev.id}`}
            className="rounded-2xl border border-hairline bg-white px-4 py-3 font-bold text-[13px] hover:bg-paper truncate"
          >
            ← {prev.name}
          </Link>
        ) : (
          <span />
        )}
        <Link
          href={`/practice/${randomInCategory.id}`}
          className="rounded-2xl border border-hairline bg-white px-4 py-3 font-bold text-[13px] hover:bg-paper flex items-center justify-center gap-1.5"
        >
          <Shuffle size={13} /> Random
        </Link>
        {next ? (
          <Link
            href={`/practice/${next.id}`}
            className="rounded-2xl border border-hairline bg-white px-4 py-3 font-bold text-[13px] text-right hover:bg-paper truncate"
          >
            {next.name} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </main>
  );
}
