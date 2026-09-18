"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, BookOpen, CheckCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import SignInGate from "@/components/SignInGate";
import GameModeSelector from "@/components/GameModeSelector";
import { listenToRoom, updatePlayerExtendedProgress, type Room } from "@/lib/firebase-store";
import { useUserData } from "@/lib/useUserData";
import { PARAGRAPHS, getParagraph } from "@/lib/paragraphs";

const PARA_COUNT = PARAGRAPHS.length;

function SoloMarathon() {
  const { saveResult } = useUserData();
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [done, setDone] = useState(false);
  const [correctChars, setCorrect] = useState(0);
  const [wrongChars, setWrong] = useState(0);
  const [keystrokes, setKeystrokes] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [weakKeys, setWeakKeys] = useState<Record<string, number>>({});
  const startRef = useRef(0);
  const para = getParagraph(idx).text;
  const totalLen = PARAGRAPHS.reduce((s, p) => s + p.text.length, 0);
  const currentLen = PARAGRAPHS.slice(0, idx).reduce((s, p) => s + p.text.length, 0);
  const progress = para ? ((currentLen + input.length) / totalLen) * 100 : 0;

  useEffect(() => {
    if (startRef.current === 0 && input.length > 0) startRef.current = Date.now();
  }, [input]);

  const finishPara = useCallback((text: string) => {
    const correct = text.split("").filter((c, i) => c === text[i]).length;
    setCorrect((p) => p + correct);
    setWrong((p) => p + (text.length - correct));
    setKeystrokes((p) => p + text.length);

    if (idx + 1 < PARA_COUNT) {
      setIdx((i) => i + 1);
      setInput("");
      setDoneCount((c) => c + 1);
    } else {
      setDone(true);
      setDoneCount((c) => c + 1);
      const elapsed = (Date.now() - startRef.current) / 60000;
      const wpm = elapsed > 0 ? Math.round(correct / 5 / elapsed) : 0;
      const accuracy = text.length > 0 ? Math.round((correct / text.length) * 100) : 100;

      saveResult({
        lessonId: `marathon-${Date.now()}`,
        wpm,
        accuracy,
        correct,
        wrong: text.length - correct,
        durationSec: Math.round(elapsed * 60),
        at: new Date().toISOString(),
        weakKeys: Object.keys(weakKeys).length > 0 ? Object.entries(weakKeys).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k) : [],
      }).catch(() => {});
    }
  }, [idx, saveResult, weakKeys]);

  return (
    <div className="rounded-[24px] border border-hairline bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-extrabold flex items-center gap-2">
          <BookOpen size={20} className="text-tang" /> Marathon
          <span className="text-[14px] text-muted font-bold">Para {Math.min(idx + 1, PARA_COUNT)} / {PARA_COUNT}</span>
        </h3>
        <div className="rounded-full bg-nested px-3 py-1 text-[13px] font-bold tabular-nums">{doneCount} / {PARA_COUNT}</div>
      </div>

      <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-nested">
        <motion.div className="absolute left-0 top-0 h-full rounded-full bg-tang transition-[width] duration-300"
          initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
      </div>

      <p className="mt-4 rounded-2xl bg-paper border border-hairline p-5 font-mono text-[16px] leading-8 break-words whitespace-pre-wrap overflow-hidden min-h-[140px]">
        {done ? (
          <span className="text-brand font-bold flex items-center gap-2">
            <CheckCircle size={16} /> Marathon complete!
          </span>
        ) : (
          para.split("").map((c, i) => (
            <span key={i} className={
              input[i] == null ? "text-ink/35" : input[i] === c ? "text-ink" : "bg-rose text-white rounded"
            }>{c === " " ? "\u00A0" : c}</span>
          ))
        )}
      </p>

      {!done && (
        <input autoFocus value={input} onChange={(e) => {
          const val = e.target.value;
          if (val.length > para.length) return;
          setInput(val);
          if (val.length === para.length) finishPara(para);
        }} placeholder="Type this paragraph, then press Next…"
          className="mt-3 w-full rounded-full border border-hairline bg-paper px-5 py-3 font-mono outline-none focus:border-ink" />
      )}
    </div>
  );
}

export default function MarathonPage() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"select" | "playing">("select");
  const [playMode, setPlayMode] = useState<"bot" | "online" | "friends">("bot");
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
        MARATHON<span className="text-muted">.</span>
      </h1>
      <p className="mt-3 max-w-2xl text-[16px] text-ink-soft">
        Endurance typing — 1,050 paragraphs in sequence. Multiplayer races you head-to-head in real time.
      </p>

      {mode === "select" ? (
        <div className="mt-6">
          <GameModeSelector
            game="marathon"
            color="#ff8709"
            onSelect={(m, text, id) => {
              setPlayMode(m);
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
            <SoloMarathon />
          ) : (
            <MultiplayerMarathon room={room} onExit={() => { setMode("select"); unsubRef.current?.(); }} />
          )}
        </div>
      )}
    </main>
  );

  if (!user) return <SignInGate loading={loading}>{content}</SignInGate>;
  return content;
}

/* ── Multiplayer Marathon ── */

function MultiplayerMarathon({ room, onExit }: { room: Room | null; onExit: () => void }) {
  const { user } = useAuth();
  const { saveResult } = useUserData();
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [done, setDone] = useState(false);
  const [correctChars, setCorrect] = useState(0);
  const [weakKeys, setWeakKeys] = useState<Record<string, number>>({});
  const startRef = useRef(0);
  const para = room?.text ?? getParagraph(idx).text;
  const opponents = room?.players.filter((p) => p.uid !== user?.uid) ?? [];
  const me = room?.players.find((p) => p.uid === user?.uid);

  useEffect(() => {
    if (startRef.current === 0 && input.length > 0) startRef.current = Date.now();
  }, [input]);

  const finishPara = useCallback((text: string) => {
    const correct = text.split("").filter((c, i) => c === text[i]).length;
    setCorrect((p) => p + correct);

    if (room?.docId && user) {
      updatePlayerExtendedProgress(room.docId, user.uid, {
        progress: Math.min(100, ((idx + 1) / PARAGRAPHS.length) * 100),
        doneCount: idx + 1,
        wpm: 0,
        done: idx + 1 >= PARAGRAPHS.length,
      }).catch(() => {});
    }

    if (idx + 1 < PARAGRAPHS.length) {
      setIdx((i) => i + 1);
      setInput("");
    } else {
      setDone(true);
      const elapsed = (Date.now() - startRef.current) / 60000;
      const wpm = elapsed > 0 ? Math.round(correct / 5 / elapsed) : 0;
      saveResult({
        lessonId: `multi-marathon-${Date.now()}`,
        wpm,
        accuracy: text.length > 0 ? Math.round((correct / text.length) * 100) : 100,
        correct,
        wrong: text.length - correct,
        durationSec: Math.round(elapsed * 60),
        at: new Date().toISOString(),
        weakKeys: [],
      }).catch(() => {});
    }
  }, [idx, room?.docId, user, saveResult]);

  return (
    <div className="rounded-[24px] border border-hairline bg-white p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-extrabold flex items-center gap-2">
          <BookOpen size={20} className="text-tang" /> Marathon ({opponents.length + 1} players)
        </h3>
        <button onClick={onExit} className="pill-btn border border-hairline px-5 py-2.5 font-bold">Exit</button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-2xl bg-paper border border-hairline p-3">
          <p className="text-[13px] font-bold text-muted">You</p>
          <p className="text-[22px] font-black tabular-nums">{idx} <span className="text-[14px] text-muted font-bold">paragraphs</span></p>
        </div>
        {opponents.map((opp) => (
          <div key={opp.uid} className="rounded-2xl bg-paper border border-hairline p-3">
            <p className="text-[13px] font-bold text-muted">{opp.name}</p>
            <p className="text-[22px] font-black tabular-nums">{(opp as any).doneCount ?? 0} <span className="text-[14px] text-muted font-bold">paragraphs</span></p>
          </div>
        ))}
      </div>

      <p className="mb-1 text-center text-[13px] font-bold text-muted">Para {idx + 1} / {PARAGRAPHS.length}</p>

      <p className="rounded-2xl bg-paper border border-hairline p-5 font-mono text-[16px] leading-8 break-words whitespace-pre-wrap overflow-hidden min-h-[140px]">
        {done ? (
          <span className="text-brand font-bold flex items-center gap-2">
            <CheckCircle size={16} /> Marathon complete!
          </span>
        ) : (
          para.split("").map((c, i) => (
            <span key={i} className={
              input[i] == null ? "text-ink/35" : input[i] === c ? "text-ink" : "bg-rose text-white rounded"
            }>{c === " " ? "\u00A0" : c}</span>
          ))
        )}
      </p>

      {!done && (
        <input autoFocus value={input} onChange={(e) => {
          const val = e.target.value;
          if (val.length > para.length) return;
          setInput(val);
          if (val.length === para.length) finishPara(para);
        }} placeholder="Type this paragraph…"
          className="mt-3 w-full rounded-full border border-hairline bg-paper px-5 py-3 font-mono outline-none focus:border-ink" />
      )}
    </div>
  );
}
