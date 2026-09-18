"use client";

import Link from "next/link";
import { useEffect, useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Swords } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import SignInGate from "@/components/SignInGate";
import { listenToRoom, updatePlayerExtendedProgress, deleteRoom, type Room } from "@/lib/firebase-store";
import GameModeSelector from "@/components/GameModeSelector";

const FALLING_WORDS = [
  "apple","ocean","plane","river","light","paper","dance","flame","glass","solar",
  "music","earth","crane","blank","stone","water","frost","bloom","cloud","flint",
];

type Word = { id: number; text: string; y: number };

function SoloWordFall({ text }: { text: string }) {
  const words = text.split(" ");
  const [queue, setQueue] = useState<string[]>([...words, ...FALLING_WORDS]);
  const [falling, setFalling] = useState<Word[]>([]);
  const [typed, setTyped] = useState("");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [speed, setSpeed] = useState(280);
  const [lives, setLives] = useState(3);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const idRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const spawn = useCallback(() => {
    setQueue((q) => {
      if (q.length === 0) { setDone(true); return q; }
      const idx = Math.floor(Math.random() * q.length);
      const pick = q[idx];
      const next = q.filter((_, i) => i !== idx);
      setFalling((f) => [...f, { id: idRef.current++, text: pick, y: Math.random() > 0.5 ? -5 : 105 }]);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!started || done || lives <= 0) return;
    const i = setInterval(spawn, 1200);
    return () => clearInterval(i);
  }, [started, done, lives, spawn]);

  useEffect(() => {
    if (!started || done) return;
    const i = setInterval(() => {
      setFalling((f) =>
        f.map((w) => ({ ...w, y: w.y + (w.y < 0 ? speed * 0.5 : speed * -0.5) * 0.02 }))
          .filter((w) => Math.abs(w.y - 50) < 55)
      );
    }, 33);
    return () => clearInterval(i);
  }, [started, done, speed]);

  const onType = useCallback((val: string) => {
    setTyped(val);
    const v = val.toLowerCase();
    setFalling((f) => {
      const hitIdx = f.findIndex((w) => w.text.toLowerCase() === v);
      if (hitIdx !== -1) {
        setScore((s) => s + f[hitIdx].text.length * 10);
        setCombo((c) => c + 1);
        setSpeed((s) => Math.min(900, s + 2));
        return f.filter((_, i) => i !== hitIdx);
      }
      return f;
    });
  }, []);

  useEffect(() => {
    if (combo > 0 && combo % 5 === 0) {
      setSpeed((s) => Math.min(900, s + 5));
      setLives((l) => Math.min(5, l + 1));
    }
  }, [combo]);

  const gameState = started && lives > 0 && !done;

  return (
    <div className="rounded-[24px] border border-hairline bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-extrabold">Word Fall</h3>
        {!started ? (
          <button onClick={() => { setStarted(true); spawn(); inputRef.current?.focus(); }}
            className="pill-btn bg-brand px-5 py-2.5 font-bold text-white">Start</button>
        ) : (
          <button onClick={() => { setStarted(false); setFalling([]); setTyped(""); setScore(0); setLives(3); setCombo(0); setQueue([...words, ...FALLING_WORDS]); }}
            className="pill-btn border border-hairline px-5 py-2.5 font-bold">Reset</button>
        )}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-paper border border-hairline p-3">
          <p className="text-[13px] font-bold text-muted">Score</p>
          <p className="text-[22px] font-black tabular-nums">{score}</p>
        </div>
        <div className="rounded-2xl bg-paper border border-hairline p-3">
          <p className="text-[13px] font-bold text-muted">Combo</p>
          <p className="text-[22px] font-black tabular-nums text-brand">{combo}x</p>
        </div>
        <div className="rounded-2xl bg-paper border border-hairline p-3">
          <p className="text-[13px] font-bold text-muted">Lives</p>
          <p className="text-[22px] font-black tabular-nums">{lives}</p>
        </div>
      </div>
      <div className="relative mt-4 h-[220px] overflow-hidden rounded-2xl border border-hairline bg-white">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,#e7eee6_100%)] opacity-60 pointer-events-none" />
        <AnimatePresence>
          {falling.map((w) => {
            const abs = w.y < 0 ? Math.abs(w.y) : 100 - w.y;
            const edge = w.y < 0 ? `left:${Math.max(0, Math.min(100, abs - 15))}%` : `right:${Math.max(0, Math.min(100, abs - 15))}%`;
            return (
              <motion.span key={w.id} initial={{ opacity: 0.9 }} animate={{ top: `${w.y}%` }}
                className="absolute z-10 inline-block rounded-full bg-brand px-3 py-1 text-[13px] font-extrabold text-cream shadow-sm pointer-events-none"
                style={{ left: edge.includes("left") ? edge.split(":")[1] : "auto", right: edge.includes("right") ? edge.split(":")[1] : "auto" }}>
                {w.text}
              </motion.span>
            );
          })}
        </AnimatePresence>
        {lives <= 0 && (
          <div className="absolute inset-0 grid place-items-center bg-white/90 z-20">
            <p className="text-[18px] font-extrabold">Game over! Score {score}</p>
          </div>
        )}
        {done && (
          <div className="absolute inset-0 grid place-items-center bg-white/90 z-20">
            <p className="text-[18px] font-extrabold flex items-center gap-2"><Trophy size={18} className="text-tang" /> All done! Score {score}</p>
          </div>
        )}
      </div>
      {gameState && (
        <input ref={inputRef} autoFocus value={typed} onChange={(e) => onType(e.target.value)}
          placeholder="Type falling words…"
          className="mt-4 w-full rounded-full border border-brand/30 bg-paper px-5 py-3 font-mono outline-none focus:border-ink" />
      )}
    </div>
  );
}

export default function WordFallPage() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"select" | "playing">("select");
  const [playMode, setPlayMode] = useState<"bot" | "online" | "friends">("bot");
  const [gameText, setGameText] = useState("type speed focus keyboard swift bright flow power zebra wizard oxygen rhythm");
  const [docId, setDocId] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (mode !== "playing" || (playMode !== "friends" && playMode !== "online") || !docId) return;
    unsubRef.current?.();
    unsubRef.current = listenToRoom(docId, setRoom);
    return () => { unsubRef.current?.(); };
  }, [mode, playMode, docId]);

  const content = (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 pb-10">
      <Link href="/games" className="inline-flex items-center gap-1 text-[14px] font-bold text-muted hover:text-ink">
        <ArrowLeft size={14} /> All games
      </Link>
      <h1 className="display-giant mt-2 text-5xl sm:text-7xl">
        WORD FALL<span className="text-muted">.</span>
      </h1>
      <p className="mt-3 max-w-2xl text-[16px] text-ink-soft">
        Tap the falling words before they escape. Multiplayer syncs scores in real time.
      </p>

      {mode === "select" ? (
        <div className="mt-6">
          <GameModeSelector
            game="word-fall"
            color="#0aa63f"
            onSelect={(m, text, id) => {
              setPlayMode(m);
              if (m === "bot") setGameText(text);
              if (id) setDocId(id);
              setMode("playing");
            }}
          />
        </div>
      ) : (
        <div className="mt-6">
          <button onClick={() => { setMode("select"); unsubRef.current?.(); }} className="mb-4 text-[13px] font-bold text-muted hover:text-ink">
            ← Back to mode select
          </button>
          {playMode === "bot" ? (
            <SoloWordFall text={gameText} />
          ) : (
            <MultiplayerWordFall text={gameText} room={room} onExit={() => { setMode("select"); unsubRef.current?.(); }} />
          )}
        </div>
      )}
    </main>
  );

  if (!user) return <SignInGate loading={loading}>{content}</SignInGate>;
  return content;
}

/* ── Multiplayer Word Fall ── */

function MultiplayerWordFall({ text, room, onExit }: { text: string; room: Room | null; onExit: () => void }) {
  const { user } = useAuth();
  const FALLING_WORDS = ["apple","ocean","plane","river","light","paper","dance","flame","glass","solar","music","earth","crane","blank","stone","water"];
  const words = text.split(" ");
  const [queue, setQueue] = useState<string[]>([...words, ...FALLING_WORDS]);
  const [falling, setFalling] = useState<Word[]>([]);
  const [typed, setTyped] = useState("");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [speed, setSpeed] = useState(280);
  const [lives, setLives] = useState(3);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const idRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const opponents = room?.players.filter((p) => p.uid !== user?.uid) ?? [];

  const spawn = useCallback(() => {
    setQueue((q) => {
      if (q.length === 0) { setDone(true); return q; }
      const idx = Math.floor(Math.random() * q.length);
      const pick = q[idx];
      const next = q.filter((_, i) => i !== idx);
      setFalling((f) => [...f, { id: idRef.current++, text: pick, y: Math.random() > 0.5 ? -5 : 105 }]);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!started || done || lives <= 0) return;
    const i = setInterval(spawn, 1200);
    return () => clearInterval(i);
  }, [started, done, lives, spawn]);

  useEffect(() => {
    if (!started || done) return;
    const i = setInterval(() => {
      setFalling((f) => f.map((w) => ({ ...w, y: w.y + (w.y < 0 ? speed * 0.5 : speed * -0.5) * 0.02 })).filter((w) => Math.abs(w.y - 50) < 55));
    }, 33);
    return () => clearInterval(i);
  }, [started, done, speed]);

  useEffect(() => {
    if (started && score > 0 && room?.docId && user) {
      updatePlayerExtendedProgress(room.docId, user.uid, { score, combo, lives, done }).catch(() => {});
    }
  }, [score, combo, lives, started, done, room?.docId, user]);

  const onType = useCallback((val: string) => {
    setTyped(val);
    const v = val.toLowerCase();
    setFalling((f) => {
      const hitIdx = f.findIndex((w) => w.text.toLowerCase() === v);
      if (hitIdx !== -1) {
        setScore((s) => s + f[hitIdx].text.length * 10);
        setCombo((c) => c + 1);
        setSpeed((s) => Math.min(900, s + 2));
        return f.filter((_, i) => i !== hitIdx);
      }
      return f;
    });
  }, []);

  useEffect(() => {
    if (combo > 0 && combo % 5 === 0) setSpeed((s) => Math.min(900, s + 5));
  }, [combo]);

  return (
    <div className="rounded-[24px] border border-hairline bg-white p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-extrabold flex items-center gap-2">
          <Swords size={20} className="text-brand" /> Word Fall ({opponents.length + 1} players)
        </h3>
        <button onClick={onExit} className="pill-btn border border-hairline px-5 py-2.5 font-bold">Exit</button>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-2xl bg-paper border border-hairline p-3">
          <p className="text-[13px] font-bold text-muted">You</p>
          <p className="text-[22px] font-black tabular-nums">{score}</p>
        </div>
        {opponents.map((opp) => (
          <div key={opp.uid} className="rounded-2xl bg-paper border border-hairline p-3">
            <p className="text-[13px] font-bold text-muted">{opp.name}</p>
            <p className="text-[22px] font-black tabular-nums">{(opp as any).score ?? 0}</p>
          </div>
        ))}
      </div>
      <div className="relative h-[200px] overflow-hidden rounded-2xl border border-hairline bg-white mb-4">
        <AnimatePresence>
          {falling.map((w) => (
            <motion.span key={w.id} initial={{ opacity: 0.9 }} animate={{ top: `${w.y}%` }}
              className="absolute z-10 inline-block rounded-full bg-brand px-3 py-1 text-[13px] font-extrabold text-cream shadow-sm pointer-events-none"
              style={{ left: `${30 + Math.random() * 40}%` }}>
              {w.text}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      {started && (
        <input ref={inputRef} autoFocus value={typed} onChange={(e) => onType(e.target.value)} placeholder="Type falling words…"
          className="w-full rounded-full border border-brand/30 bg-paper px-5 py-3 font-mono outline-none focus:border-ink" />
      )}
    </div>
  );
}
