"use client";

import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import { TRACK_DEFS, TOTAL_LESSONS } from "@/lib/lessons";
import { randomSentence } from "@/lib/paragraphs";
import TypingEngine from "@/components/TypingEngine";
import DailyChallenge from "@/components/DailyChallenge";
import {
  Zap,
  Trophy,
  Target,
  Code,
  Globe,
  Keyboard,
  Flame,
  ArrowRight,
  BarChart3,
  RefreshCw,
} from "lucide-react";

export default function Home() {
  const [demoText, setDemoText] = useState("");
  const [demoKey, setDemoKey] = useState(0);

  useEffect(() => {
    setDemoText(randomSentence());
  }, []);

  const refreshDemo = useCallback(() => {
    setDemoText(randomSentence());
    setDemoKey((k) => k + 1);
  }, []);
  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* HERO */}
      <section className="pt-8 text-center">
        <p className="eyebrow">{"{ the typing school, rebuilt }"}</p>
        <h1 className="display-giant mx-auto mt-4 max-w-5xl text-[13vw] sm:text-[92px] lg:text-[120px]">
          TYPE LIKE
          <br />
          <span className="relative inline-block">
            <span className="bg-ink text-cream px-5 rounded-[24px] inline-block -rotate-1">
              LIGHTNING
            </span>
            <span className="absolute -right-6 -top-6 float-slow text-4xl">
              <Zap size={32} className="text-brand-bright" />
            </span>
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-[17px] sm:text-[19px] leading-7 text-ink-soft">
          TypeSkillz beats TypingClub with{" "}
          <b>{TOTAL_LESSONS.toLocaleString()}+ lessons</b>, code typing,
          realtime races, 25 languages, 10 keyboard layouts, and analytics
          down to the finger. Free forever. No account needed.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/lesson/home-row-1"
            className="pill-btn bg-ink text-cream px-8 py-4 text-[16px] font-bold shadow-float hover:scale-[1.02] flex items-center gap-2"
          >
            Start lesson 1 <ArrowRight size={18} />
          </Link>
          <Link
            href="/games"
            className="pill-btn border-2 border-ink bg-white px-8 py-4 text-[16px] font-bold hover:bg-nested"
          >
            Race a friend
          </Link>
        </div>

        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-3 gap-3">
          {[
            { n: `${TOTAL_LESSONS.toLocaleString()}+`, l: "lessons", icon: Trophy },
            { n: "25+", l: "languages", icon: Globe },
            { n: "10+", l: "layouts", icon: Keyboard },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-3xl border border-hairline bg-white px-4 py-4 shadow-card"
            >
              <s.icon size={18} className="text-muted mb-1" />
              <p className="text-2xl sm:text-3xl font-black tracking-tight">
                {s.n}
              </p>
              <p className="text-[13px] font-semibold text-muted">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE DEMO */}
      <section className="mt-14">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="eyebrow">{"{ try it right here }"}</p>
            <h2 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight">
              60-second taste. No signup.
            </h2>
          </div>
          <Link
            href="/practice"
            className="hidden sm:inline pill-btn border border-hairline bg-white px-5 py-2.5 text-[14px] font-bold"
          >
            Open full practice
          </Link>
        </div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[13px] font-bold tracking-widest text-muted">
            WARM UP
          </h2>
          <button
            onClick={refreshDemo}
            className="flex items-center gap-1.5 rounded-full border border-hairline bg-white px-3 py-1.5 text-[12.5px] font-bold text-muted hover:text-ink hover:border-ink transition-all"
          >
            <RefreshCw size={12} /> New sentence
          </button>
        </div>
        <TypingEngine
          key={demoKey}
          text={demoText}
          title="Warm-up sprint"
          targetWpm={40}
          accent="#ff8709"
        />
      </section>

      {/* DAILY CHALLENGE */}
      <section className="mt-8">
        <DailyChallenge />
      </section>

      {/* MARQUEE */}
      <section className="mt-14 overflow-hidden rounded-[24px] border border-hairline bg-ink py-4 text-cream">
        <div className="marquee-track flex w-max gap-8 whitespace-nowrap font-mono text-[14px]">
          {[0, 1].map((k) => (
            <span key={k} className="flex gap-8">
              {[
                "realtime races",
                "accuracy lab",
                "code typing",
                "25 languages",
                "dvorak + colemak",
                "streaks",
                "finger heatmaps",
                "kids jungle",
              ].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-cream/20 px-4 py-1.5"
                >
                  {t}
                </span>
              ))}
            </span>
          ))}
        </div>
      </section>

      {/* WHY BETTER */}
      <section className="mt-16">
        <p className="eyebrow">{"{ why typeskillz }"}</p>
        <h2 className="mt-1 max-w-2xl text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
          Everything TypingClub does. Plus everything it doesn't.
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              t: "2,395 lessons, zero boredom",
              d: "Home row to 100 WPM sprints, 1,050 paragraphs, stories, business drills — sequenced so 5 stars means something.",
              c: "#0aa63f",
              icon: Trophy,
            },
            {
              t: "Code typing mode",
              d: "Real JS, Python, SQL & HTML snippets with bracket balance drills. The #1 request TypingClub never shipped.",
              c: "#5f58e8",
              icon: Code,
            },
            {
              t: "Realtime races",
              d: "Race friends or bots live with WPM ghosts. Loser buys coffee.",
              c: "#ff8709",
              icon: Zap,
            },
            {
              t: "Finger-level analytics",
              d: "Weak-key heatmaps, per-finger accuracy, WPM curves, error replays. Know exactly what to fix.",
              c: "#c026b8",
              icon: BarChart3,
            },
            {
              t: "25 languages + 10 layouts",
              d: "Spanish to Hindi to Arabic. QWERTY to Dvorak, Colemak, AZERTY. Remap muscle memory in weeks.",
              c: "#008fb8",
              icon: Globe,
            },
            {
              t: "Streaks, XP, playback",
              d: "Daily challenges, XP levels, typing playback, voice-over, accessibility-first design.",
              c: "#0aa63f",
              icon: Flame,
            },
          ].map((f) => (
            <div
              key={f.t}
              className="card-hover rounded-[24px] border border-hairline bg-white p-6"
            >
              <div
                className="grid h-12 w-12 place-items-center rounded-2xl"
                style={{ background: `${f.c}15` }}
              >
                <f.icon size={20} style={{ color: f.c }} />
              </div>
              <h3 className="mt-4 text-[19px] font-extrabold tracking-tight">
                {f.t}
              </h3>
              <p className="mt-2 text-[14.5px] leading-6 text-muted">{f.d}</p>
              <span
                className="mt-4 inline-block h-1.5 w-16 rounded-full"
                style={{ background: f.c }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* TRACKS */}
      <section className="mt-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">{"{ lesson plans }"}</p>
            <h2 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight">
              Pick your path. All free.
            </h2>
          </div>
          <Link
            href="/learn"
            className="pill-btn hidden sm:inline border border-hairline bg-white px-5 py-2.5 text-[14px] font-bold"
          >
            View all
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRACK_DEFS.slice(0, 6).map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.id}
                href={`/learn/${t.id}`}
                className="card-hover rounded-[24px] border border-hairline bg-white p-6 block"
              >
                <div className="flex items-center justify-between">
                  <div
                    className="grid h-12 w-12 place-items-center rounded-2xl"
                    style={{ background: t.soft }}
                  >
                    <Icon size={20} strokeWidth={2.2} style={{ color: t.color }} />
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-[12px] font-bold"
                    style={{ background: t.soft, color: t.color }}
                  >
                    {t.count} lessons
                  </span>
                </div>
                <h3 className="mt-4 text-[19px] font-extrabold">{t.title}</h3>
                <p className="mt-1 text-[14px] text-muted leading-6">{t.blurb}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 overflow-hidden rounded-[28px] bg-ink text-cream p-8 sm:p-12 text-center relative">
        <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-brand-bright/30 blur-3xl" />
        <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-tang/30 blur-3xl" />
        <p className="font-mono text-[13px] text-cream/60">
          {"{ 5 minutes a day · 2 weeks · pro }"}
        </p>
        <h2 className="display-giant mx-auto mt-3 max-w-3xl text-4xl sm:text-6xl">
          YOUR FINGERS WILL THANK YOU
        </h2>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/lesson/home-row-1"
            className="pill-btn bg-brand-bright text-ink px-8 py-4 font-extrabold flex items-center gap-2"
          >
            Begin now <ArrowRight size={16} />
          </Link>
          <Link
            href="/learn"
            className="pill-btn border border-cream/30 px-8 py-4 font-bold hover:bg-white/10"
          >
            Browse {TOTAL_LESSONS.toLocaleString()}+ lessons
          </Link>
        </div>
      </section>
    </main>
  );
}
