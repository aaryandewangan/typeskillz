"use client";

import Link from "next/link";
import { Target } from "lucide-react";
import LessonGuard from "@/components/LessonGuard";
import TypingEngine from "@/components/TypingEngine";
import { TRACK_DEFS } from "@/lib/lessons";
import type { Lesson } from "@/lib/lessons";

interface Props {
  lesson: Lesson;
  trackId: string;
  trackTitle: string;
  trackColor: string;
  trackSoft: string;
  siblings: Lesson[];
}

export default function LessonContent({ lesson, trackId, trackTitle, trackColor, trackSoft, siblings }: Props) {
  const idx = siblings.findIndex((l) => l.id === lesson.id);
  const prev = siblings[idx - 1];
  const next = siblings[idx + 1];
  const TrackIcon = TRACK_DEFS.find((t) => t.id === trackId)?.icon;

  return (
    <LessonGuard lesson={lesson}>
      <main className="mx-auto max-w-4xl px-4 sm:px-6 pb-10">
        <div className="flex items-center justify-between text-[14px] font-bold">
          <Link href={`/learn/${trackId}`} className="text-muted hover:text-ink">
            ← {trackTitle}
          </Link>
          <span className="rounded-full bg-white border border-hairline px-3 py-1">
            Lesson {lesson.index} / {siblings.length}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{lesson.title}</h1>
          <span
            className="rounded-full px-3 py-1 text-[12.5px] font-bold flex items-center gap-1.5"
            style={{ background: trackSoft, color: trackColor }}
          >
            <Target size={12} />
            {lesson.targetWpm} WPM · focus: {lesson.focusKeys}
          </span>
        </div>

        <div className="mt-5">
          <TypingEngine
            text={lesson.text}
            lessonId={lesson.id}
            targetWpm={lesson.targetWpm}
            title={`${trackTitle} — ${lesson.title}`}
            accent={trackColor}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {prev ? (
            <Link
              href={`/lesson/${prev.id}`}
              className="rounded-2xl border border-hairline bg-white px-5 py-4 font-bold hover:bg-paper"
            >
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/lesson/${next.id}`}
              className="rounded-2xl border border-hairline bg-white px-5 py-4 font-bold text-right hover:bg-paper"
            >
              {next.title} →
            </Link>
          ) : (
            <span />
          )}
        </div>
      </main>
    </LessonGuard>
  );
}
