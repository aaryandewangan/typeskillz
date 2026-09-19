import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

/* ── Types ──────────────────────────────────────────────────────────── */

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  goal: number;
  layout: string;
  createdAt: string;
}

export interface TypingResult {
  lessonId: string;
  wpm: number;
  accuracy: number;
  correct: number;
  wrong: number;
  durationSec: number;
  at: number | string;
  weakKeys: string[];
}

export interface UserProgress {
  uid: string;
  results: TypingResult[];
  streak: { day: string; count: number };
  achievements: string[];
  bestWpm: number;
  updatedAt: string;
}

/* ── Usernames (unique) ────────────────────────────────────────────── */

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const normalized = username.toLowerCase().trim();
  if (normalized.length < 3 || normalized.length > 20) return false;
  if (!/^[a-z0-9_]+$/.test(normalized)) return false;
  const snap = await getDoc(doc(db, "usernames", normalized));
  return !snap.exists();
}

export async function claimUsername(uid: string, username: string): Promise<boolean> {
  const normalized = username.toLowerCase().trim();
  const avail = await isUsernameAvailable(normalized);
  if (!avail) return false;
  await setDoc(doc(db, "usernames", normalized), { uid, createdAt: new Date().toISOString() });
  return true;
}

export async function getUsername(uid: string): Promise<string | null> {
  const q = query(collection(db, "usernames"), where("uid", "==", uid), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].id;
}

/* ── Profile ────────────────────────────────────────────────────────── */

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function createProfile(
  uid: string,
  data: Omit<UserProfile, "uid" | "createdAt">
) {
  await setDoc(doc(db, "users", uid), {
    uid,
    ...data,
    createdAt: new Date().toISOString(),
  });
}

export async function updateProfile(uid: string, data: Partial<UserProfile>) {
  await updateDoc(doc(db, "users", uid), data);
}

/* ── Results ────────────────────────────────────────────────────────── */

export async function saveResult(uid: string, result: TypingResult) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const existing = (snap.data().progress as UserProgress) ?? {
    results: [],
    streak: { day: "", count: 0 },
    achievements: [],
    bestWpm: 0,
  };

  const results = [...existing.results, result].slice(-2000);
  const bestWpm = Math.max(existing.bestWpm ?? 0, result.wpm);

  // Update streak
  const today = new Date().toDateString();
  const streak = existing.streak;
  let newStreak = streak;
  if (streak.day !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const count = streak.day === yesterday ? streak.count + 1 : 1;
    newStreak = { day: today, count };
  }

  await updateDoc(ref, {
    progress: {
      results,
      streak: newStreak,
      achievements: existing.achievements,
      bestWpm,
      updatedAt: new Date().toISOString(),
    },
  });
}

export async function getProgress(uid: string): Promise<UserProgress | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  const progress = (data.progress as UserProgress) ?? null;
  if (progress && progress.bestWpm === undefined) {
    const results = progress.results ?? [];
    progress.bestWpm = results.length > 0 ? Math.max(...results.map((r) => r.wpm)) : 0;
  }
  return progress;
}

/* ── Leaderboard ────────────────────────────────────────────────────── */

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  bestWpm: number;
}

export async function getLeaderboard(
  count = 20
): Promise<LeaderboardEntry[]> {
  const q = query(
    collection(db, "users"),
    where("progress.bestWpm", ">", 0),
    orderBy("progress.bestWpm", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    const progress = data.progress as UserProgress | undefined;
    const bestWpm = progress?.bestWpm ?? 0;
    return {
      uid: data.uid,
      displayName: data.displayName ?? "Anonymous",
      bestWpm,
    };
  });
}

export function listenLeaderboard(
  count = 20,
  callback: (entries: LeaderboardEntry[]) => void
): () => void {
  const q = query(
    collection(db, "users"),
    where("progress.bestWpm", ">", 0),
    orderBy("progress.bestWpm", "desc"),
    limit(count)
  );
  return onSnapshot(q, (snap) => {
    const entries = snap.docs.map((d) => {
      const data = d.data();
      const progress = data.progress as UserProgress | undefined;
      const bestWpm = progress?.bestWpm ?? 0;
      return {
        uid: data.uid,
        displayName: data.displayName ?? "Anonymous",
        bestWpm,
      };
    });
    callback(entries);
  });
}

/* ── Rooms (multiplayer) ────────────────────────────────────────────── */

export interface RoomPlayer {
  uid: string;
  name: string;
  ready: boolean;
  progress: number;
  wpm: number;
  finished: boolean;
  finishedAt?: string;
  score?: number;
  combo?: number;
  lives?: number;
  done?: boolean;
  doneCount?: number;
}

export interface Room {
  id: string;
  docId: string;
  code: string;
  host: RoomPlayer;
  players: RoomPlayer[];
  maxPlayers: number;
  status: "lobby" | "countdown" | "racing" | "finished";
  text: string;
  createdAt: string;
  countdownStart?: number;
  winner?: string;
  mode: string;
}

export type RoomData = Omit<Room, "id" | "docId">;

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function getGameText(game: string): string {
  if (game === "race") return "speed is a habit built one clean keystroke at a time so stay calm and let your fingers dance";
  if (game === "marathon") return "Practice makes progress when you show up every day with intention and patience";
  return "type speed focus keyboard swift bright flow power zebra wizard oxygen rhythm";
}

export async function createRoom(
  uid: string,
  name: string,
  text: string,
  maxPlayers = 2,
  mode = ""
): Promise<string> {
  const code = generateCode();
  const host: RoomPlayer = { uid, name, ready: true, progress: 0, wpm: 0, finished: false };
  const roomData: RoomData = {
    code,
    host,
    players: [host],
    maxPlayers,
    status: "lobby",
    text,
    createdAt: new Date().toISOString(),
    mode,
  };
  const ref = doc(collection(db, "rooms"));
  await setDoc(ref, roomData);
  return code;
}

export async function joinRoom(
  code: string,
  uid: string,
  name: string
): Promise<Room | null> {
  const q = query(collection(db, "rooms"), where("code", "==", code), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const roomDoc = snap.docs[0];
  const room = roomDoc.data() as Room;
  if (room.players.length >= room.maxPlayers) return null;
  if (room.players.some((p) => p.uid === uid)) return null;

  const player: RoomPlayer = { uid, name, ready: false, progress: 0, wpm: 0, finished: false };
  const updatedPlayers = [...room.players, player];
  const newStatus = updatedPlayers.length >= room.maxPlayers ? "lobby" : room.status;

  await updateDoc(doc(db, "rooms", roomDoc.id), {
    players: updatedPlayers,
    status: newStatus,
  });
  return { ...room, id: roomDoc.id, docId: roomDoc.id, players: updatedPlayers, status: newStatus };
}

export async function togglePlayerReady(docId: string, uid: string): Promise<void> {
  const snap = await getDoc(doc(db, "rooms", docId));
  if (!snap.exists()) return;
  const room = snap.data() as Room;
  const updatedPlayers = room.players.map((p) =>
    p.uid === uid ? { ...p, ready: !p.ready } : p
  );
  await updateDoc(doc(db, "rooms", docId), { players: updatedPlayers });
}

export async function setAllReady(docId: string, ready: boolean): Promise<void> {
  const snap = await getDoc(doc(db, "rooms", docId));
  if (!snap.exists()) return;
  const room = snap.data() as Room;
  const updatedPlayers = room.players.map((p) => ({ ...p, ready }));
  await updateDoc(doc(db, "rooms", docId), { players: updatedPlayers });
}

export async function startCountdown(docId: string): Promise<void> {
  await updateDoc(doc(db, "rooms", docId), {
    status: "countdown",
    countdownStart: Date.now(),
  });
}

export async function setRoomRacing(docId: string): Promise<void> {
  await updateDoc(doc(db, "rooms", docId), {
    status: "racing",
  });
}

export async function setRoomFinished(docId: string, winnerUid?: string): Promise<void> {
  const update: Record<string, unknown> = { status: "finished" };
  if (winnerUid) update.winner = winnerUid;
  await updateDoc(doc(db, "rooms", docId), update);
}

export async function autoStartOnline(docId: string): Promise<void> {
  await updateDoc(doc(db, "rooms", docId), {
    status: "countdown",
    countdownStart: Date.now(),
  });
}

export async function getRoomByCode(code: string): Promise<(Room & { docId: string }) | null> {
  const q = query(collection(db, "rooms"), where("code", "==", code.toUpperCase().trim()), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return { ...(docSnap.data() as Room), id: docSnap.id, docId: docSnap.id };
}

export function getPlayerField(uid: string, room: Room): string | null {
  if (room.host.uid === uid) return "host";
  const idx = room.players.findIndex((p) => p.uid === uid);
  return idx >= 0 ? `players.${idx}` : null;
}

export async function updatePlayerProgress(
  docId: string,
  uid: string,
  progress: number,
  wpm: number,
  finished: boolean
) {
  const snap = await getDoc(doc(db, "rooms", docId));
  if (!snap.exists()) return;
  const room = snap.data() as Room;

  const updatedPlayers = room.players.map((p) => {
    if (p.uid !== uid) return p;
    return { ...p, progress, wpm, finished, ...(finished ? { finishedAt: new Date().toISOString() } : {}) };
  });

  const allFinished = updatedPlayers.every((p) => p.finished);
  const finishedPlayer = updatedPlayers.find((p) => p.uid === uid);

  const update: Record<string, unknown> = { players: updatedPlayers };
  if (allFinished) {
    update.status = "finished";
    update.winner = finishedPlayer?.uid;
  }

  await updateDoc(doc(db, "rooms", docId), update);
}

export async function updatePlayerExtendedProgress(
  docId: string,
  uid: string,
  data: Record<string, unknown>
) {
  const snap = await getDoc(doc(db, "rooms", docId));
  if (!snap.exists()) return;
  const room = snap.data() as Room;

  const updatedPlayers = room.players.map((p) => {
    if (p.uid !== uid) return p;
    return { ...p, ...data };
  });

  await updateDoc(doc(db, "rooms", docId), { players: updatedPlayers });
}

export function listenToRoom(
  docId: string,
  callback: (room: Room | null) => void
): () => void {
  return onSnapshot(doc(db, "rooms", docId), (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback({ ...(snap.data() as Room), id: snap.id, docId: snap.id });
  });
}

export async function leaveRoom(docId: string, uid: string): Promise<void> {
  const snap = await getDoc(doc(db, "rooms", docId));
  if (!snap.exists()) return;
  const room = snap.data() as Room;
  const updatedPlayers = room.players.filter((p) => p.uid !== uid);
  if (updatedPlayers.length === 0) {
    await deleteDoc(doc(db, "rooms", docId));
    return;
  }
  const newHost = updatedPlayers[0];
  await updateDoc(doc(db, "rooms", docId), {
    players: updatedPlayers,
    host: newHost,
  });
}

export async function deleteRoom(docId: string) {
  try {
    await deleteDoc(doc(db, "rooms", docId));
  } catch {}
}

/* ── Delete account ─────────────────────────────────────────────────── */

export async function deleteAccount(uid: string) {
  const usernameQuery = query(collection(db, "usernames"), where("uid", "==", uid), limit(1));
  const usernameSnap = await getDocs(usernameQuery);
  for (const d of usernameSnap.docs) {
    await deleteDoc(d.ref);
  }

  const roomsQuery = query(collection(db, "rooms"), where("host.uid", "==", uid));
  const roomsSnap = await getDocs(roomsQuery);
  for (const d of roomsSnap.docs) {
    await deleteDoc(d.ref);
  }

  await deleteDoc(doc(db, "users", uid));
}

/* ── Matchmaking ────────────────────────────────────────────────────── */

export interface MatchTicket {
  uid: string;
  name: string;
  game: string;
  size: number;
  status: "queuing" | "matched";
  roomId?: string;
  createdAt: string;
}

export async function joinMatchmaking(
  uid: string,
  name: string,
  game: string,
  size: number
): Promise<string | null> {
  const stale = query(collection(db, "matchmaking"), where("uid", "==", uid));
  const staleSnap = await getDocs(stale);
  for (const d of staleSnap.docs) {
    await deleteDoc(d.ref);
  }

  const waiting = query(
    collection(db, "matchmaking"),
    where("status", "==", "queuing"),
    where("size", "==", size),
    limit(20)
  );
  const waitingSnap = await getDocs(waiting);

  const candidates = waitingSnap.docs.filter((d) => {
    const data = d.data() as MatchTicket;
    return data.uid !== uid && data.game === game;
  });

  if (candidates.length >= size - 1) {
    const picked = candidates.slice(0, size - 1);
    const text = getGameText(game);

    const roomCode = await createRoom(uid, name, text, size, game);
    const room = await getRoomByCode(roomCode);

    if (room) {
      for (const c of picked) {
        const cData = c.data() as MatchTicket;
        await joinRoom(roomCode, cData.uid, cData.name);
        await updateDoc(c.ref, { status: "matched", roomId: room.docId });
      }

      for (const d of staleSnap.docs) {
        await deleteDoc(d.ref);
      }

      return room.docId;
    }
  }

  const ticketRef = doc(collection(db, "matchmaking"));
  await setDoc(ticketRef, {
    uid,
    name,
    game,
    size,
    status: "queuing",
    createdAt: new Date().toISOString(),
  });
  return null;
}

export function listenForMatch(
  uid: string,
  game: string,
  callback: (roomId: string | null) => void
): () => void {
  const q = query(
    collection(db, "matchmaking"),
    where("uid", "==", uid),
    where("game", "==", game),
    limit(1)
  );
  return onSnapshot(q, (snap) => {
    if (snap.empty) {
      callback(null);
      return;
    }
    const matchDoc = snap.docs[0];
    const data = matchDoc.data() as MatchTicket;
    if (data.status === "matched" && data.roomId) {
      deleteDoc(matchDoc.ref).catch(() => {});
      callback(data.roomId);
    } else {
      callback(null);
    }
  });
}

export function listenMatchmakingQueue(
  game: string,
  size: number,
  callback: (count: number) => void
): () => void {
  const q = query(
    collection(db, "matchmaking"),
    where("status", "==", "queuing"),
    where("size", "==", size),
    limit(50)
  );
  return onSnapshot(q, (snap) => {
    const inGame = snap.docs.filter((d) => (d.data() as MatchTicket).game === game);
    callback(inGame.length);
  });
}

export async function leaveMatchmaking(uid: string, game: string) {
  const q = query(collection(db, "matchmaking"), where("uid", "==", uid), where("game", "==", game));
  const snap = await getDocs(q);
  for (const d of snap.docs) {
    await deleteDoc(d.ref);
  }
}
