"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Shuffle, ArrowRight, BookOpen } from "lucide-react";
import {
  PRACTICE_TEXTS,
  PRACTICE_TOTAL,
  PRACTICE_CATEGORIES,
  CATEGORY_META,
  type PracticeCategory,
} from "@/lib/practice-texts";

const PER_PAGE = 24;

export default function PracticePage() {
  const [category, setCategory] = useState<PracticeCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = PRACTICE_TEXTS;
    if (category !== "all") list = list.filter((t) => t.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (t) => t.name.toLowerCase().includes(q) || t.text.toLowerCase().includes(q)
      );
    }
    return list;
  }, [category, query]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Random pick
  function randomPick() {
    const pool = category !== "all"
      ? PRACTICE_TEXTS.filter((t) => t.category === category)
      : PRACTICE_TEXTS;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) window.location.href = `/practice/${pick.id}`;
  }

  function goToPage(p: number) {
    setPage(Math.max(1, Math.min(totalPages, p)));
    window.scrollTo({ top: 200, behavior: "smooth" });
  }

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 pb-10">
      <p className="eyebrow">{"{ free practice }"}</p>
      <h1 className="display-giant mt-2 text-5xl sm:text-7xl">
        PRACTICE<span className="text-muted">.</span>
      </h1>
      <p className="mt-3 text-[16px] text-ink-soft max-w-2xl">
        {PRACTICE_TOTAL.toLocaleString()}+ texts across {PRACTICE_CATEGORIES.length} categories.
        Pick any text to start typing — no account needed.
      </p>

      {/* ── Controls ── */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search texts..."
            className="w-full rounded-full border border-hairline bg-white pl-10 pr-4 py-2.5 text-[14px] outline-none focus:border-ink"
          />
        </div>
        <button
          onClick={randomPick}
          className="pill-btn flex items-center gap-1.5 border border-hairline bg-white px-4 py-2.5 text-[13px] font-bold hover:border-ink transition-all"
        >
          <Shuffle size={13} /> Random
        </button>
        <span className="text-[13px] font-bold text-muted tabular-nums">
          {filtered.length.toLocaleString()} texts
        </span>
      </div>

      {/* ── Category filters ── */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <button
          onClick={() => { setCategory("all"); setPage(1); }}
          className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition-all ${
            category === "all"
              ? "bg-ink text-cream"
              : "border border-hairline bg-white text-muted hover:text-ink hover:border-ink"
          }`}
        >
          All
        </button>
        {PRACTICE_CATEGORIES.map((c) => {
          const meta = CATEGORY_META[c];
          const count = PRACTICE_TEXTS.filter((t) => t.category === c).length;
          return (
            <button
              key={c}
              onClick={() => { setCategory(c); setPage(1); }}
              className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition-all ${
                category === c
                  ? "text-cream"
                  : "border border-hairline bg-white text-muted hover:text-ink hover:border-ink"
              }`}
              style={category === c ? { background: meta.color } : undefined}
            >
              {meta.label}
              <span className="ml-1 opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Text grid ── */}
      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {pageItems.map((t) => {
          const meta = CATEGORY_META[t.category];
          return (
            <Link
              key={t.id}
              href={`/practice/${t.id}`}
              className="group rounded-2xl border border-hairline bg-white p-4 hover:border-ink/40 hover:shadow-card transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-extrabold"
                  style={{ background: meta.color + "18", color: meta.color }}
                >
                  {meta.label}
                </span>
                <span className="text-[11px] font-bold text-muted tabular-nums shrink-0">
                  #{t.id.replace("practice-", "")}
                </span>
              </div>
              <p className="mt-2 font-bold text-[14px] leading-snug">
                {t.name}
              </p>
              <p className="mt-1 line-clamp-2 font-mono text-[12px] leading-relaxed text-muted">
                {t.text}
              </p>
              <div className="mt-2.5 flex items-center gap-1 text-[12.5px] font-bold text-ink-soft group-hover:text-ink transition-colors">
                Open
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
        {pageItems.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted">
            <BookOpen size={28} className="mx-auto mb-2 opacity-40" />
            <p className="text-[15px] font-bold">No texts match your search.</p>
            <p className="text-[13px]">Try a different category or keyword.</p>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1.5">
          <button
            disabled={page === 1}
            onClick={() => goToPage(page - 1)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-hairline bg-white text-muted hover:text-ink hover:border-ink disabled:opacity-30 transition-all"
          >
            ←
          </button>

          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let p: number;
            if (totalPages <= 7) {
              p = i + 1;
            } else if (page <= 4) {
              p = i + 1;
            } else if (page >= totalPages - 3) {
              p = totalPages - 6 + i;
            } else {
              p = page - 3 + i;
            }
            return (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`grid h-9 w-9 place-items-center rounded-xl text-[13px] font-bold transition-all ${
                  page === p
                    ? "bg-ink text-cream"
                    : "border border-hairline bg-white text-muted hover:text-ink hover:border-ink"
                }`}
              >
                {p}
              </button>
            );
          })}

          <button
            disabled={page === totalPages}
            onClick={() => goToPage(page + 1)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-hairline bg-white text-muted hover:text-ink hover:border-ink disabled:opacity-30 transition-all"
          >
            →
          </button>
        </div>
      )}
    </main>
  );
}
