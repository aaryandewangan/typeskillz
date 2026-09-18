"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { starsFor } from "@/lib/stats";
import { useUserData } from "@/lib/useUserData";
import { paragraphOfTheDay } from "@/lib/paragraphs";
import Keyboard from "./Keyboard";
import Link from "next/link";
import { getNextLesson } from "@/lib/lessons";

interface Props {
  text: string;
  lessonId?: string;
  targetWpm?: number;
  title?: string;
  accent?: string;
}

export interface LiveStats {
  wpm: number;
  accuracy: number;
  progress: number;
}

export default function TypingEngine({ text, lessonId, targetWpm = 30, title, accent = "#0aa63f" }: Props) {
  const { saveResult } = useUserData();
  const [input, setInput] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [wrongMap, setWrongMap] = useState<Record<number, number>>({});
  const [now, setNow] = useState(Date.now());
  const boxRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);

  const done = input.length >= text.length;
  const correct = useMemo(() => {
    let c = 0;
    for (let i = 0; i < input.length; i++) if (input[i] === text[i]) c++;
    return c;
  }, [input, text]);
  const wrong = input.length - correct;
  const accuracy = input.length === 0 ? 100 : (correct / input.length) * 100;

  const elapsedSec = useMemo(() => {
    if (startedAt == null) return 0;
    const end = endedAt ?? now;
    return Math.max(0.5, (end - startedAt) / 1000);
  }, [startedAt, endedAt, now]);

  const wpm = useMemo(() => {
    if (elapsedSec <= 0) return 0;
    return Math.round(correct / 5 / (elapsedSec / 60));
  }, [correct, elapsedSec]);

  // tick while typing
  useEffect(() => {
    if (startedAt == null || endedAt != null) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [startedAt, endedAt]);

  // persist on completion
  const savedRef = useRef(false);
  const [stars, setStars] = useState(0);
  useEffect(() => {
    if (done && !savedRef.current) {
      savedRef.current = true;
      setEndedAt(Date.now());
      const weakKeys = Object.entries(wrongMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([idx]) => text[Number(idx)] ?? "?");
      setStars(starsFor(wpm, accuracy, targetWpm));
      try {
        const daily = paragraphOfTheDay();
        if (lessonId === `paragraph-marathon-${daily.index}`) {
          localStorage.setItem("typeskillz:daily", `${new Date().toDateString()}:${daily.id}`);
        }
      } catch {}
      if (lessonId) {
        saveResult({
          lessonId,
          wpm,
          accuracy: Math.round(accuracy * 10) / 10,
          correct,
          wrong,
          durationSec: Math.round(elapsedSec),
          at: new Date().toISOString(),
          weakKeys,
        });
      }
    }
  }, [done, lessonId, wpm, accuracy, correct, wrong, elapsedSec, text, targetWpm, wrongMap, saveResult]);

  function handleKey(ch: string) {
    if (done) return;
    if (startedAt == null) setStartedAt(Date.now());
    const pos = input.length;
    if (ch !== text[pos]) {
      setWrongMap((m) => ({ ...m, [pos]: (m[pos] ?? 0) + 1 }));
    }
    setInput((s) => (s + ch).slice(0, text.length));
  }

  function handleSpecial(key: string) {
    if (key === "Backspace") setInput((s) => s.slice(0, -1));
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" && (e.target as HTMLInputElement).type !== "hidden") {
        // allow typing in visible inputs elsewhere; ignore engine
        if (document.activeElement !== hiddenRef.current) return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Backspace") {
        e.preventDefault();
        handleSpecial("Backspace");
        return;
      }
      if (e.key.length === 1) {
        // don't hijack when user is editing profile inputs etc.
        const ae = document.activeElement as HTMLElement | null;
        if (ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA") && ae !== hiddenRef.current) return;
        e.preventDefault();
        handleKey(e.key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, text, done, startedAt]);

  function restart() {
    savedRef.current = false;
    setInput("");
    setStartedAt(null);
    setEndedAt(null);
    setWrongMap({});
    setStars(0);
    setNow(Date.now());
    hiddenRef.current?.focus();
    boxRef.current?.focus();
  }

  const next = lessonId ? getNextLesson(lessonId) : undefined;
  const progress = Math.min(100, (input.length / text.length) * 100);
  const nextChar = text[input.length] ?? "";

  return (
    <div className="overflow-hidden rounded-[24px] border border-hairline bg-white shadow-card">
      {/* header strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-paper px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="h-9 w-1.5 rounded-full" style={{ background: accent }} />
          <div>
            <p className="text-[12px] font-bold tracking-widest text-muted uppercase">{"{ now typing }"}</p>
            <p className="text-[16px] font-bold leading-tight">{title ?? "Lesson"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-center">
          {[
            { label: "WPM", value: String(wpm) },
            { label: "ACC", value: `${Math.round(accuracy)}%` },
            { label: "TARGET", value: String(targetWpm) },
          ].map((s) => (
            <div key={s.label} className="min-w-[72px] rounded-2xl border border-hairline bg-white px-3 py-1.5">
              <p className="text-[10.5px] font-bold tracking-widest text-muted">{s.label}</p>
              <p className="text-[18px] font-extrabold tabular-nums">{s.value}</p>
            </div>
          ))}
          <button onClick={restart} className="pill-btn border border-hairline bg-white px-4 py-2.5 text-[13.5px] font-bold hover:bg-paper">
            ↻ Restart
          </button>
        </div>
      </div>

      {/* progress */}
      <div className="h-1.5 bg-nested">
        <div className="h-full transition-all" style={{ width: `${progress}%`, background: accent }} />
      </div>

      {/* text */}
      <div
        ref={boxRef}
        tabIndex={0}
        onClick={() => hiddenRef.current?.focus()}
        className="cursor-text px-5 sm:px-8 py-7 font-mono text-[19px] sm:text-[21px] leading-[2] outline-none break-words whitespace-pre-wrap overflow-hidden"
      >
        {text.split("").map((ch, i) => {
          const typed = input[i];
          const isCurrent = i === input.length && !done;
          let cls = "text-ink/35 ";
          if (typed != null) cls = typed === ch ? "text-ink bg-brand-soft/70 rounded " : "text-white bg-rose rounded ";
          if (ch === " " && typed != null && typed !== ch) cls = "bg-rose text-white rounded ";
          return (
            <span key={i} className={`${cls} ${isCurrent ? "relative" : ""} px-[1px]`}>
              {isCurrent && (
                <span className="typing-caret absolute -left-[1px] top-[2px] h-[1.4em] w-[2.5px] rounded" style={{ background: accent }} />
              )}
              {ch === " " ? " " : ch}
            </span>
          );
        })}
        <input ref={hiddenRef} type="text" aria-hidden className="h-0 w-0 opacity-0" onChange={() => {}} />
      </div>

      {!done ? (
        <div className="border-t border-hairline bg-paper px-5 py-5">
          <p className="mb-3 text-[13px] font-semibold text-muted">
            {startedAt == null ? "Click the text, then start typing — the timer begins on your first key." : <>Next key: <span className="font-mono font-bold text-ink">“{nextChar === " " ? "space" : nextChar}”</span> • keep your eyes on the screen, not the keyboard.</>}
          </p>
          <Keyboard nextChar={nextChar} accent={accent} />
        </div>
      ) : (
        <div className="border-t border-hairline bg-ink px-6 py-7 text-cream">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[13px] tracking-widest text-cream/60 font-bold">{"{ lesson complete }"}</p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight">
                {wpm} WPM • {Math.round(accuracy)}% <span className="ml-2 text-brand-bright">{"★".repeat(stars)}{"☆".repeat(5 - stars)}</span>
              </p>
              <p className="mt-1 text-[14px] text-cream/70">
                {accuracy >= 97 && wpm >= targetWpm ? "Flawless. You owned every key." : accuracy >= 92 ? "Great run — push the target next time." : "Good effort — retry to lock in 92%+ accuracy."}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={restart} className="pill-btn border border-cream/30 px-5 py-2.5 font-bold hover:bg-white/10">
                Retry
              </button>
              {next && (
                <Link href={`/lesson/${next.id}`} className="pill-btn bg-brand-bright text-ink px-5 py-2.5 font-extrabold hover:brightness-110">
                  Next: {next.title} →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
