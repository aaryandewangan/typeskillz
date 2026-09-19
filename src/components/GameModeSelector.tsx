"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Globe,
  Users,
  Copy,
  Check,
  ArrowRight,
  Loader2,
  X,
  Search,
  UserCheck,
  Clock,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  createRoom,
  joinRoom,
  getRoomByCode,
  joinMatchmaking,
  listenForMatch,
  leaveMatchmaking,
  listenToRoom,
  togglePlayerReady,
  startCountdown,
  setRoomRacing,
  leaveRoom,
  type Room,
} from "@/lib/firebase-store";

interface GameModeSelectorProps {
  game: string;
  color: string;
  onSelect: (mode: "bot" | "online" | "friends", text: string, docId: string) => void;
}

const GAME_TEXTS: Record<string, string[]> = {
  race: [
    "speed is a habit built one clean keystroke at a time so stay calm and let your fingers dance",
    "every great typist started with slow deliberate practice before speed became second nature",
    "focus on accuracy first and speed will follow naturally like water finding its own level",
    "the keyboard is an instrument and your fingers are the musicians playing a daily concert",
  ],
  "word-fall": [
    "type speed focus keyboard swift bright flow power zebra wizard oxygen rhythm",
    "focus practice speed rhythm clarity precision swift accurate deliberate methodical",
    "keyboard dance lightning thunder clever brilliant swift agile nimble sharp bright",
  ],
  marathon: [
    "Practice makes progress when you show up every day with intention and patience",
    "The best way to predict the future is to create it with consistent daily effort",
    "Success is not about perfection but about showing up and doing the work every day",
  ],
};

function randomText(game: string) {
  const texts = GAME_TEXTS[game] ?? GAME_TEXTS.race;
  return texts[Math.floor(Math.random() * texts.length)];
}

type Step =
  | "pick"
  | "online-size"
  | "friends-join"
  | "friends-create"
  | "online-waiting"
  | "online-starting"
  | "lobby";

export default function GameModeSelector({ game, color, onSelect }: GameModeSelectorProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("pick");
  const [playerSize, setPlayerSize] = useState(2);
  const [room, setRoom] = useState<Room | null>(null);
  const [docId, setDocId] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [queueCount, setQueueCount] = useState(0);
  const [countdown, setCountdown] = useState(0);

  const unsubRoomRef = useRef<(() => void) | null>(null);
  const unsubMatchRef = useRef<(() => void) | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      unsubRoomRef.current?.();
      unsubMatchRef.current?.();
      countdownRef.current && clearInterval(countdownRef.current);
    };
  }, []);

  // Listen to room changes
  useEffect(() => {
    if (!docId) return;
    unsubRoomRef.current?.();
    unsubRoomRef.current = listenToRoom(docId, (r) => {
      setRoom(r);
      if (r?.status === "countdown" && r.countdownStart) {
        const elapsed = Date.now() - r.countdownStart;
        const remaining = Math.max(0, 3 - Math.floor(elapsed / 1000));
        setCountdown(remaining);
        if (remaining === 0 && r.host.uid === user?.uid) {
          setRoomRacing(docId).catch(() => {});
        }
      }
      if (r?.status === "racing") {
        onSelect("friends", "", docId);
      }
      if (r?.status === "finished") {
        onSelect("friends", "", docId);
      }
    });
    return () => { unsubRoomRef.current?.(); };
  }, [docId, step, onSelect, user?.uid]);

  const isHost = room?.host.uid === user?.uid;
  const allReady = room ? room.players.every((p) => p.ready) && room.players.length >= 2 : false;

  // Auto-start countdown for online matches when room is full
  useEffect(() => {
    if (step === "online-starting" && room && room.status === "lobby" && room.players.length >= room.maxPlayers) {
      startCountdown(docId).catch(() => {});
    }
  }, [step, room, docId]);

  // ── Bot ──
  const handleBot = useCallback(() => {
    onSelect("bot", randomText(game), "");
  }, [game, onSelect]);

  // ── Online ──
  const handleOnlineSearch = useCallback(async (size: number) => {
    if (!user) return;
    setStep("online-waiting");
    setError("");
    setPlayerSize(size);

    try {
      const name = user.displayName ?? user.email?.split("@")[0] ?? "Player";
      const roomId = await joinMatchmaking(user.uid, name, game, size);

      if (roomId) {
        setDocId(roomId);
        setStep("lobby");
        return;
      }

      unsubMatchRef.current = listenForMatch(user.uid, game, (rid) => {
        if (rid) {
          unsubMatchRef.current?.();
          setDocId(rid);
          setStep("online-starting");
        }
      });
    } catch {
      setError("Matchmaking failed. Try again.");
      setStep("online-size");
    }
  }, [user, game]);

  const cancelSearch = useCallback(() => {
    if (user) leaveMatchmaking(user.uid, game).catch(() => {});
    unsubMatchRef.current?.();
    setStep("online-size");
  }, [user, game]);

  // ── Friends ──
  const handleCreateRoom = useCallback(async (size: number) => {
    if (!user) return;
    setLoading(true);
    setError("");
    setPlayerSize(size);
    try {
      const name = user.displayName ?? user.email?.split("@")[0] ?? "Player";
      const code = await createRoom(user.uid, name, randomText(game), size, game);
      const r = await getRoomByCode(code);
      if (r) {
        setDocId(r.docId);
        setStep("lobby");
      }
    } catch {
      setError("Failed to create room.");
    }
    setLoading(false);
  }, [user, game]);

  const handleJoinRoom = useCallback(async () => {
    if (!user || !joinCode.trim()) return;
    setLoading(true);
    setError("");
    try {
      const r = await getRoomByCode(joinCode.trim());
      if (!r) { setError("Room not found."); setLoading(false); return; }
      if (r.players.some((p) => p.uid === user.uid)) { setError("Already in room."); setLoading(false); return; }
      if (r.players.length >= r.maxPlayers) { setError("Room is full."); setLoading(false); return; }
      const name = user.displayName ?? user.email?.split("@")[0] ?? "Player";
      await joinRoom(joinCode.trim(), user.uid, name);
      setDocId(r.docId);
      setStep("lobby");
    } catch {
      setError("Failed to join room.");
    }
    setLoading(false);
  }, [user, joinCode]);

  const handleToggleReady = useCallback(async () => {
    if (!docId || !user) return;
    await togglePlayerReady(docId, user.uid);
  }, [docId, user]);

  const handleStartGame = useCallback(async () => {
    if (!docId || !allReady) return;
    await startCountdown(docId);
  }, [docId, allReady]);

  const handleLeave = useCallback(async () => {
    if (!docId || !user) return;
    unsubRoomRef.current?.();
    await leaveRoom(docId, user.uid);
    setDocId("");
    setRoom(null);
    setStep("pick");
  }, [docId, user]);

  function copyCode() {
    if (!room) return;
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const bg = color + "18";

  return (
    <div className="rounded-[24px] border border-hairline bg-white p-6 shadow-card">
      <AnimatePresence mode="wait">
        {/* ── Pick mode ── */}
        {step === "pick" && (
          <motion.div key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3 className="text-xl font-extrabold mb-4">Choose how to play</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <button onClick={handleBot}
                className="group rounded-2xl border border-hairline bg-paper p-5 text-left hover:border-ink/40 hover:shadow-card transition-all">
                <div className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: bg }}>
                  <Bot size={20} style={{ color }} />
                </div>
                <p className="mt-3 font-extrabold text-[15px]">Play with Bot</p>
                <p className="mt-1 text-[13px] text-muted">Race against AI opponents</p>
              </button>
              <button onClick={() => setStep("online-size")}
                className="group rounded-2xl border border-hairline bg-paper p-5 text-left hover:border-ink/40 hover:shadow-card transition-all">
                <div className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: bg }}>
                  <Globe size={20} style={{ color }} />
                </div>
                <p className="mt-3 font-extrabold text-[15px]">Play Online</p>
                <p className="mt-1 text-[13px] text-muted">Find random opponents</p>
              </button>
              <button onClick={() => setStep("friends-join")}
                className="group rounded-2xl border border-hairline bg-paper p-5 text-left hover:border-ink/40 hover:shadow-card transition-all">
                <div className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: bg }}>
                  <Users size={20} style={{ color }} />
                </div>
                <p className="mt-3 font-extrabold text-[15px]">Play with Friends</p>
                <p className="mt-1 text-[13px] text-muted">Create or join a room</p>
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Online: pick size ── */}
        {step === "online-size" && (
          <motion.div key="online-size" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h3 className="text-xl font-extrabold mb-4">Online Match</h3>
            <p className="text-[14px] text-muted mb-4">How many players?</p>
            <div className="grid grid-cols-3 gap-3">
              {[2, 3, 4].map((n) => (
                <button key={n} onClick={() => handleOnlineSearch(n)}
                  className="rounded-2xl border border-hairline bg-paper p-4 text-center hover:border-ink/40 hover:shadow-card transition-all">
                  <p className="text-[28px] font-black">{n}</p>
                  <p className="text-[13px] font-bold text-muted">
                    {n === 2 ? "Duo" : n === 3 ? "Trio" : "Quad"}
                  </p>
                </button>
              ))}
            </div>
            <button onClick={() => setStep("pick")} className="mt-4 text-[13px] font-bold text-muted hover:text-ink">
              ← Back
            </button>
          </motion.div>
        )}

        {/* ── Online: searching ── */}
        {step === "online-waiting" && (
          <motion.div key="online-wait" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center py-6">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl mb-4" style={{ background: bg }}>
              <Search size={24} className="animate-pulse" style={{ color }} />
            </div>
            <p className="text-[18px] font-extrabold">Finding {playerSize} players…</p>
            <p className="text-[14px] text-muted mt-1">
              {queueCount > 0 ? `${queueCount} player${queueCount > 1 ? "s" : ""} waiting` : "Scanning for players"}
              <span className="animate-pulse">_</span>
            </p>
            {error && <p className="text-[13px] font-bold text-rose mt-2">{error}</p>}
            <button onClick={cancelSearch}
              className="mt-4 pill-btn flex items-center gap-2 mx-auto border border-hairline bg-white px-5 py-2.5 text-[13px] font-bold">
              <X size={14} /> Cancel
            </button>
          </motion.div>
        )}

        {/* ── Online: matched, starting ── */}
        {step === "online-starting" && docId && (
          <motion.div key="online-starting" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center py-6">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl mb-4" style={{ background: bg }}>
              <UserCheck size={24} style={{ color }} />
            </div>
            <p className="text-[18px] font-extrabold">Match found!</p>
            <p className="text-[14px] text-muted mt-1">Starting game…</p>
            {room?.status === "countdown" && (
              <motion.p key={countdown} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="mt-4 text-[80px] font-black" style={{ color }}>
                {countdown > 0 ? countdown : "GO!"}
              </motion.p>
            )}
          </motion.div>
        )}

        {/* ── Friends: join or create ── */}
        {step === "friends-join" && (
          <motion.div key="friends-join" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h3 className="text-xl font-extrabold mb-4">Play with Friends</h3>
            <div className="space-y-3">
              <button onClick={() => setStep("friends-create")} disabled={loading}
                className="w-full rounded-2xl border border-hairline bg-ink text-cream p-4 text-left hover:opacity-90 transition-all flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10"><Users size={18} /></div>
                <div><p className="font-bold">Create Room</p><p className="text-[13px] text-cream/60">Get a code to share</p></div>
                <ArrowRight size={16} className="ml-auto" />
              </button>
              <div className="flex gap-2">
                <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-letter code" maxLength={6}
                  className="flex-1 rounded-2xl border border-hairline bg-paper px-4 py-3 font-mono text-[16px] font-bold tracking-[0.2em] text-center outline-none focus:border-ink uppercase" />
                <button onClick={handleJoinRoom} disabled={loading || joinCode.length < 6}
                  className="pill-btn px-5 py-3 font-bold text-white disabled:opacity-40" style={{ background: color }}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                </button>
              </div>
              {error && <p className="text-[13px] font-bold text-rose">{error}</p>}
            </div>
            <button onClick={() => setStep("pick")} className="mt-4 text-[13px] font-bold text-muted hover:text-ink">← Back</button>
          </motion.div>
        )}

        {/* ── Friends: pick size ── */}
        {step === "friends-create" && (
          <motion.div key="friends-create" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h3 className="text-xl font-extrabold mb-4">Room Size</h3>
            <p className="text-[14px] text-muted mb-4">How many players?</p>
            <div className="grid grid-cols-5 gap-3">
              {[2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => handleCreateRoom(n)} disabled={loading}
                  className="rounded-2xl border border-hairline bg-paper p-4 text-center hover:border-ink/40 hover:shadow-card transition-all disabled:opacity-50">
                  <p className="text-[28px] font-black">{n}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setStep("friends-join")} className="mt-4 text-[13px] font-bold text-muted hover:text-ink">← Back</button>
          </motion.div>
        )}

        {/* ── Lobby ── */}
        {step === "lobby" && room && (
          <motion.div key="lobby" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Countdown overlay */}
            {room.status === "countdown" && (
              <div className="fixed inset-0 z-50 grid place-items-center bg-ink/80 backdrop-blur-sm">
                <motion.p key={countdown} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="text-[120px] font-black text-cream">
                  {countdown > 0 ? countdown : "GO!"}
                </motion.p>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-extrabold flex items-center gap-2">
                <Users size={20} style={{ color }} /> Lobby
              </h3>
              <button onClick={handleLeave}
                className="pill-btn border border-hairline px-4 py-2 text-[13px] font-bold flex items-center gap-1">
                <X size={14} /> Leave
              </button>
            </div>

            {/* Room code */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="rounded-2xl bg-nested px-6 py-3 font-mono text-[28px] font-black tracking-[0.3em]">
                {room.code}
              </span>
              <button onClick={copyCode}
                className="grid h-11 w-11 place-items-center rounded-xl border border-hairline bg-white hover:bg-paper transition-all" title="Copy code">
                {copied ? <Check size={16} className="text-brand" /> : <Copy size={16} />}
              </button>
            </div>

            <p className="text-center text-[13px] text-muted mb-4">
              Share this code with friends ({room.players.length}/{room.maxPlayers})
            </p>

            {/* Player list */}
            <div className="space-y-2">
              {room.players.map((p) => (
                <div key={p.uid} className="flex items-center gap-3 rounded-2xl border border-hairline bg-paper p-3">
                  <div className={`grid h-9 w-9 place-items-center rounded-xl ${p.ready ? "bg-brand text-cream" : "bg-nested text-muted"}`}>
                    {p.ready ? <UserCheck size={16} /> : <Clock size={16} />}
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-[14px]">
                      {p.name}
                      {p.uid === user?.uid && <span className="text-muted font-bold"> (you)</span>}
                      {p.uid === room.host.uid && <span className="text-tang font-bold"> (host)</span>}
                    </p>
                    <p className="text-[12px] text-muted">{p.ready ? "Ready" : "Not ready"}</p>
                  </div>
                </div>
              ))}
              {Array.from({ length: room.maxPlayers - room.players.length }).map((_, i) => (
                <div key={`empty-${i}`} className="flex items-center gap-3 rounded-2xl border border-dashed border-hairline p-3 opacity-40">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-nested"><Users size={16} className="text-muted" /></div>
                  <p className="text-[14px] text-muted font-bold">Waiting for player…</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button onClick={handleToggleReady}
                className={`flex-1 pill-btn py-3 font-bold text-white ${room.players.find((p) => p.uid === user?.uid)?.ready ? "bg-muted" : "bg-brand"}`}>
                {room.players.find((p) => p.uid === user?.uid)?.ready ? "Unready" : "Ready Up"}
              </button>
              {isHost && (
                <button onClick={handleStartGame} disabled={!allReady}
                  className="flex-1 pill-btn py-3 font-bold bg-cream text-ink border border-hairline disabled:opacity-30 disabled:cursor-not-allowed">
                  {allReady ? "Start Game" : `Waiting (${room.players.filter((p) => p.ready).length}/${room.players.length})`}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
