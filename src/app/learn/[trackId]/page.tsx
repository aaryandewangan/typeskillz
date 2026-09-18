import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowLeft, Clock, Zap } from "lucide-react";
import { getTrack, getLessonsByTrack, TRACK_DEFS } from "@/lib/lessons";

export function generateStaticParams() {
  return TRACK_DEFS.map((t) => ({ trackId: t.id }));
}

export default async function TrackPage({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = await params;
  const track = getTrack(trackId);
  if (!track) notFound();
  const lessons = getLessonsByTrack(trackId);
  const Icon = track.icon;

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 pb-10">
      <Link
        href="/learn"
        className="inline-flex items-center gap-1 text-[14px] font-bold text-muted hover:text-ink"
      >
        <ArrowLeft size={14} /> All tracks
      </Link>

      {/* track header */}
      <div className="mt-3 rounded-[28px] border border-hairline bg-white p-7 sm:p-10 shadow-card relative overflow-hidden">
        <div
          className="absolute -right-16 -top-16 h-64 w-64 rounded-full blur-3xl opacity-40"
          style={{ background: track.soft }}
        />
        <div className="flex items-start gap-5">
          <div
            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl"
            style={{ background: track.soft }}
          >
            <Icon size={26} strokeWidth={2} style={{ color: track.color }} />
          </div>
          <div>
            <p className="eyebrow">{"{ track }"}</p>
            <h1 className="display-giant mt-1 text-4xl sm:text-6xl">
              {track.title.toUpperCase()}
            </h1>
            <p className="mt-3 max-w-2xl text-[16px] text-ink-soft">
              {track.description}
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/lesson/${lessons[0].id}`}
            className="pill-btn bg-ink text-cream px-6 py-3 font-bold flex items-center gap-2"
          >
            Start lesson 1 <ArrowRight size={14} />
          </Link>
          <span className="pill-btn border border-hairline bg-paper px-5 py-3 font-bold flex items-center gap-2 text-[13px]">
            <Clock size={14} className="text-muted" />
            {lessons.length} lessons · ~{Math.round(lessons.length * 1.5)} min
          </span>
          <span className="pill-btn border border-hairline bg-paper px-5 py-3 font-bold flex items-center gap-2 text-[13px]">
            <Zap size={14} className="text-tang" />
            Target: {lessons[0].targetWpm}–{lessons[lessons.length - 1].targetWpm} wpm
          </span>
        </div>
      </div>

      {/* lesson list */}
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {lessons.map((l) => (
          <Link
            key={l.id}
            href={`/lesson/${l.id}`}
            className="group card-hover flex items-center gap-4 rounded-2xl border border-hairline bg-white px-5 py-4 hover:shadow-card transition-all"
          >
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[13px] font-black transition-transform group-hover:scale-105"
              style={{ background: track.soft, color: track.color }}
            >
              {l.index}
            </span>
            <span className="flex-1 min-w-0">
              <b className="text-[15px] block truncate">{l.title}</b>
              <span className="text-[12.5px] text-muted truncate block mt-0.5">
                {l.text.slice(0, 50)}…
              </span>
            </span>
            <span className="shrink-0 text-[12px] font-bold text-muted tabular-nums">
              {l.targetWpm}<span className="font-normal"> wpm</span>
            </span>
            <ArrowRight size={14} className="text-muted shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </main>
  );
}
