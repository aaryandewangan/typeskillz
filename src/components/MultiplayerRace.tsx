"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Zap, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  listenToRoom,
  updatePlayerProgress,
  deleteRoom,
  type Room,
  type RoomPlayer,
} from "@/lib/firebase-store";
import { recordMatchResult, getRankData, calculatePointsChange, type GameRank } from "@/lib/rank-store";

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
      unsubRef.current?.();
    };
  }, []);

  useEffect(() => {
    if (!started) return;
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [started]);

  const done = input.length >= text.length;
  const correct = input.split("").filter((c, i) => c === text[i]).length;
  const [finishMs, setFinishMs] = useState(0);
  const lastWpmRef = useRef(0);

  useEffect(() => {
    if (done && t0 > 0 && finishMs === 0) {
      setFinishMs(Date.now());
    }
  }, [done, t0, finishMs]);

  const elapsedMs = started
    ? (done ? (finishMs > 0 ? finishMs - t0 : now - t0) : now - t0)
    : 0;
  const elapsedSec = Math.max(0.5, elapsedMs / 1000);
  const myWpm = started && elapsedSec > 0 ? Math.round(correct / 5 / (elapsedSec / 60)) : 0;

  useEffect(() => {
    if (done && myWpm > 0) {
      lastWpmRef.current = myWpm;
    }
  }, [done, myWpm]);

  const displayWpm = done ? lastWpmRef.current : myWpm;
  const myProg = Math.min(100, (input.length / text.length) * 100);

  const me = room?.players.find((p) => p.uid === user?.uid);
  const opponents = room?.players.filter((p) => p.uid !== user?.uid) ?? [];

  useEffect(() => {
    if (!started || !user) return;
    const prog = Math.min(100, (input.length / text.length) * 100);
    updatePlayerProgress(docId, user.uid, prog, displayWpm, done).catch(() => {});
  }, [input, started, user, docId, displayWpm, done, text.length]);

  const winner = room?.winner;
  const iWon = winner === user?.uid;
  const gameOver = room?.status === "finished";

  const [matchResult, setMatchResult] = useState<{ won: boolean; pts: number; rank: GameRank } | null>(null);
  const matchRecordedRef = useRef(false);

  useEffect(() => {
    if (!gameOver || !user || !room || matchRecordedRef.current) return;
    matchRecordedRef.current = true;

    const opponents = room.players.filter((p) => p.uid !== user.uid);
    const winnerUid = room.winner;

    if (opponents.length > 0) {
      const opp = opponents[0];
      const won = winnerUid === user.uid;
      recordMatchResult(user.uid, (room.mode || "race") + "_online", won, opp.uid).then((rank) => {
        const pts = calculatePointsChange(rank.rank, getRankData(rank.rank).id, won);
        setMatchResult({ won, pts, rank });
      }).catch(() => {});
    }
  }, [gameOver, user, room]);

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
            <span>You {started && <span className="font-mono text-muted">{displayWpm} wpm</span>}</span>
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
          {matchResult && (
            <div className="mt-3 flex items-center justify-center gap-3">
              <span className={`flex items-center gap-1 font-bold text-[15px] ${matchResult.pts >= 0 ? "text-brand" : "text-rose"}`}>
                {matchResult.pts >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {matchResult.pts >= 0 ? "+" : ""}{matchResult.pts} pts
              </span>
              <span className="text-muted text-[13px]">·</span>
              <span className="font-bold text-[13px]" style={{ color: getRankData(matchResult.rank.rank).color }}>
                {getRankData(matchResult.rank.rank).icon} {getRankData(matchResult.rank.rank).label} — {matchResult.rank.points} pts
              </span>
            </div>
          )}
          <button onClick={onExit} className="pill-btn mt-3 bg-ink text-cream px-5 py-2.5 font-bold">
            Back to games
          </button>
        </motion.div>
      )}
    </div>
  );
}
