"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Zap, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import SignInGate from "@/components/SignInGate";
import GameModeSelector from "@/components/GameModeSelector";
import MultiplayerRace from "@/components/MultiplayerRace";
import { recordSoloResult, getRankData, type GameRank } from "@/lib/rank-store";
import GameLeaderboard from "@/components/GameLeaderboard";

const BOT_TEXT = "speed is a habit built one clean keystroke at a time so stay calm and let your fingers dance";

function SoloRace({ text }: { text: string }) {
  const { user } = useAuth();
  const [started, setStarted] = useState(false);
  const [input, setInput] = useState("");
  const [t0, setT0] = useState(0);
  const [now, setNow] = useState(0);
  const [finishMs, setFinishMs] = useState(0);
  const [rankResult, setRankResult] = useState<{ won: boolean; pts: number; rank: GameRank } | null>(null);
  const rankRecordedRef = useRef(false);
  const bots = useMemo(
    () => [
      { name: "Tappy", wpm: 31, color: "#0aa63f" },
      { name: "Dash", wpm: 58, color: "#5f58e8" },
      { name: "Blaze", wpm: 82, color: "#ff8709" },
    ],
    []
  );
  const done = input.length >= text.length;

  useEffect(() => {
    if (!started || done) return;
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [started, done]);

  useEffect(() => {
    if (done && t0 > 0 && finishMs === 0) {
      setFinishMs(Date.now());
    }
  }, [done, t0, finishMs]);

  const elapsedMs = started
    ? (done ? (finishMs > 0 ? finishMs - t0 : now - t0) : now - t0)
    : 0;
  const elapsedMin = Math.max(elapsedMs / 60000, 1 / 600);
  const correct = input.split("").filter((c, i) => c === text[i]).length;
  const myWpm = started && elapsedMin > 0 ? Math.round(correct / 5 / elapsedMin) : 0;
  const myProg = (input.length / text.length) * 100;
  const botProg = (b: number) => {
    if (!started) return 0;
    const secs = (now - t0) / 1000;
    return Math.min(100, ((b / 60) * 5 * secs / text.length) * 100);
  };

  useEffect(() => {
    if (!done || !user || rankRecordedRef.current || myWpm === 0) return;
    rankRecordedRef.current = true;
    const won = myWpm >= 31; // Beat at least Tappy
    recordSoloResult(user.uid, "race", won).then((r) => {
      setRankResult({ won, pts: r.pts, rank: r.rank });
    }).catch(() => {});
  }, [done, user, myWpm]);

  return (
    <div className="rounded-[24px] border border-hairline bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-extrabold flex items-center gap-2">
          <Zap size={20} className="text-brand" /> Race the bots
        </h3>
        {!started ? (
          <button onClick={() => { setStarted(true); setT0(Date.now()); setNow(Date.now()); }} className="pill-btn bg-brand px-5 py-2.5 font-bold text-white">
            Start race
          </button>
        ) : (
          <button onClick={() => { setStarted(false); setInput(""); }} className="pill-btn border border-hairline px-5 py-2.5 font-bold">
            Reset
          </button>
        )}
      </div>
      <div className="mt-4 space-y-2.5 font-mono text-[13px]">
        <div>
          <div className="flex justify-between font-sans font-bold text-[13px]">
            <span>You {started && <span className="font-mono text-muted">{myWpm} wpm</span>}</span>
            <span>{Math.round(myProg)}%</span>
          </div>
          <div className="h-3 rounded-full bg-nested overflow-hidden">
            <div className="h-full bg-ink transition-all" style={{ width: `${myProg}%` }} />
          </div>
        </div>
        {bots.map((b) => (
          <div key={b.name}>
            <div className="flex justify-between font-sans font-bold text-[13px] text-muted">
              <span>{b.name}</span>
              <span>{Math.round(botProg(b.wpm))}%</span>
            </div>
            <div className="h-3 rounded-full bg-nested overflow-hidden">
              <div className="h-full transition-all" style={{ width: `${botProg(b.wpm)}%`, background: b.color }} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-2xl bg-paper border border-hairline p-4 font-mono text-[16px] leading-8 break-words whitespace-pre-wrap overflow-hidden">
        {text.split("").map((c, i) => (
          <span key={i} className={
            input[i] == null ? "text-ink/35" : input[i] === c ? "text-ink" : "bg-rose text-white rounded"
          }>
            {c === " " ? "\u00A0" : c}
          </span>
        ))}
      </p>
      <input value={input} disabled={!started || done}
        onChange={(e) => { if (!started) return; setInput(e.target.value.slice(0, text.length)); }}
        placeholder={started ? "Type here to race..." : "Hit Start race, then type here"}
        className="mt-3 w-full rounded-full border border-hairline bg-paper px-5 py-3 font-mono outline-none focus:border-ink disabled:opacity-50" />
      {done && (
        <div className="mt-2">
          <p className="font-bold flex items-center gap-2">
            <Trophy size={16} className="text-tang" />
            Finished at ~{myWpm} WPM.{" "}
            {myWpm >= 82 ? "You beat Blaze!" : myWpm >= 58 ? "You beat Dash!" : myWpm >= 31 ? "You beat Tappy!" : "The bots win this time."}{" "}
            <Link href="/learn/speed-builders" className="underline">Train speed</Link>
          </p>
          {rankResult && (
            <div className="mt-2 flex items-center gap-3">
              <span className={`flex items-center gap-1 font-bold text-[14px] ${rankResult.pts >= 0 ? "text-brand" : "text-rose"}`}>
                {rankResult.pts >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {rankResult.pts >= 0 ? "+" : ""}{rankResult.pts} pts
              </span>
              <span className="text-muted text-[12px]">·</span>
              <span className="font-bold text-[13px]" style={{ color: getRankData(rankResult.rank.rank).color }}>
                {getRankData(rankResult.rank.rank).icon} {getRankData(rankResult.rank.rank).label} — {rankResult.rank.points} pts
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RacePage() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"select" | "playing">("select");
  const [playMode, setPlayMode] = useState<"bot" | "online" | "friends">("bot");
  const [gameText, setGameText] = useState(BOT_TEXT);
  const [docId, setDocId] = useState("");

  const content = (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 pb-10">
      <Link href="/games" className="inline-flex items-center gap-1 text-[14px] font-bold text-muted hover:text-ink">
        <ArrowLeft size={14} /> All games
      </Link>
      <h1 className="display-giant mt-2 text-5xl sm:text-7xl">
        RACE<span className="text-muted">.</span>
      </h1>
      <p className="mt-3 max-w-2xl text-[16px] text-ink-soft">
        Race against bots, random online players, or friends.
      </p>

      {mode === "select" ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <GameModeSelector
            game="race"
            color="#0aa63f"
            onSelect={(m, text, id) => {
              setPlayMode(m);
              if (m === "bot") setGameText(text);
              if (id) setDocId(id);
              setMode("playing");
            }}
          />
          <div className="space-y-6">
            <GameLeaderboard game="race" color="#0aa63f" compact title="Solo Leaderboard" />
            <GameLeaderboard game="race_online" color="#5f58e8" compact title="Online Leaderboard" />
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <button onClick={() => setMode("select")} className="mb-4 text-[13px] font-bold text-muted hover:text-ink">
            ← Back to mode select
          </button>
          {playMode === "bot" ? (
            <SoloRace text={gameText} />
          ) : (
            <MultiplayerRace
              text={gameText}
              docId={docId}
              onExit={() => setMode("select")}
            />
          )}
        </div>
      )}
    </main>
  );

  if (!user) return <SignInGate loading={loading}>{content}</SignInGate>;
  return content;
}
