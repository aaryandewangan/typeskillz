"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Zap, ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  listenToRoom,
  updatePlayerProgress,
  deleteRoom,
  type Room,
  type RoomPlayer,
} from "@/lib/firebase-store";

const PLAYER_COLORS = ["#0aa63f", "#5f58e8", "#ff8709", "#e535ab", "#8b5cf6"];

interface Props {
  text: string;
  docId: string;
  onExit: () => void;
}

export default function MultiplayerRace({ text, docId, onExit }: Props) {
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [t0, setT0] = useState(0);
  const [now, setNow] = useState(0);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    unsubRef.current = listenToRoom(docId, (r) => {
      setRoom(r);
      if (r?.status === "racing" && !started) {
        setStarted(true);
        setT0(Date.now());
        setNow(Date.now());
      }
      if (r?.status === "finished") {
        setStarted(false);
      }
    });
    return () => { unsubRef.current?.(); };
  }, [docId, started]);

  useEffect(() => {
    return () => {
      if (room?.host.uid === user?.uid) {
        deleteRoom(docId).catch(() => {});
      }
    };
  }, [docId, room?.host.uid, user?.uid]);

  useEffect(() => {
    if (!started) return;
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [started]);

  const done = input.length >= text.length;
  const elapsedMs = started ? (done ? 0 : now - t0) : 0;
  const elapsedSec = Math.max(0.5, elapsedMs / 1000);
  const correct = input.split("").filter((c, i) => c === text[i]).length;
  const myWpm = started ? Math.round(correct / 5 / (elapsedSec / 60)) : 0;
  const myProg = Math.min(100, (input.length / text.length) * 100);

  const me = room?.players.find((p) => p.uid === user?.uid);
  const opponents = room?.players.filter((p) => p.uid !== user?.uid) ?? [];

  useEffect(() => {
    if (!started || !user) return;
    const prog = Math.min(100, (input.length / text.length) * 100);
    updatePlayerProgress(docId, user.uid, prog, myWpm, done).catch(() => {});
  }, [input, started, user, docId, myWpm, done, text.length]);

  const winner = room?.winner;
  const iWon = winner === user?.uid;
  const gameOver = room?.status === "finished";

  return (
    <div className="rounded-[24px] border border-hairline bg-white p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-brand" />
          <h3 className="text-xl font-extrabold">
            Race ({room?.players.length ?? 0}/{room?.maxPlayers ?? 2})
          </h3>
        </div>
        <button onClick={onExit}
          className="pill-btn border border-hairline px-3 py-1.5 text-[12.5px] font-bold flex items-center gap-1">
          <ArrowLeft size={12} /> Leave
        </button>
      </div>

      <div className="space-y-2.5 font-mono text-[13px]">
        <div>
          <div className="flex justify-between font-sans font-bold text-[13px]">
            <span>You {started && <span className="font-mono text-muted">{myWpm} wpm</span>}</span>
            <span>{Math.round(myProg)}%</span>
          </div>
          <div className="h-3 rounded-full bg-nested overflow-hidden">
            <div className="h-full bg-brand transition-all" style={{ width: `${myProg}%` }} />
          </div>
        </div>
        {opponents.map((opp, i) => (
          <div key={opp.uid}>
            <div className="flex justify-between font-sans font-bold text-[13px] text-muted">
              <span>
                {opp.name} {started && <span className="font-mono">{opp.wpm} wpm</span>}
              </span>
              <span>{Math.round(opp.progress)}%</span>
            </div>
            <div className="h-3 rounded-full bg-nested overflow-hidden">
              <div className="h-full transition-all" style={{ width: `${opp.progress}%`, background: PLAYER_COLORS[(i + 1) % PLAYER_COLORS.length] }} />
            </div>
          </div>
        ))}
        {opponents.length === 0 && (
          <div className="text-[13px] text-muted font-sans">Waiting for opponents…</div>
        )}
      </div>

      <p className="mt-4 rounded-2xl bg-paper border border-hairline p-4 font-mono text-[16px] leading-8 break-words whitespace-pre-wrap overflow-hidden">
        {text.split("").map((c, i) => (
          <span key={i} className={
            input[i] == null ? "text-ink/35" : input[i] === c ? "text-ink" : "bg-rose text-white rounded"
          }>{c === " " ? "\u00A0" : c}</span>
        ))}
      </p>

      <input value={input} disabled={!started || done || gameOver}
        onChange={(e) => {
          if (!started || gameOver) return;
          setInput(e.target.value.slice(0, text.length));
        }}
        placeholder={gameOver ? "Race finished!" : started ? "Type here to race…" : "Waiting for game to start…"}
        className="mt-3 w-full rounded-full border border-hairline bg-paper px-5 py-3 font-mono outline-none focus:border-ink disabled:opacity-50"
        autoFocus />

      {gameOver && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-2xl bg-nested p-4 text-center">
          <Trophy size={24} className={`mx-auto mb-2 ${iWon ? "text-tang" : "text-muted"}`} />
          <p className="font-extrabold text-[18px]">
            {iWon ? "You won!" : winner ? "Someone else wins!" : "Draw!"}
          </p>
          <p className="text-[14px] text-muted mt-1">
            {room?.players.map((p) => `${p.name}: ${p.wpm} wpm`).join(" · ")}
          </p>
          <button onClick={onExit} className="pill-btn mt-3 bg-ink text-cream px-5 py-2.5 font-bold">
            Back to games
          </button>
        </motion.div>
      )}
    </div>
  );
}
