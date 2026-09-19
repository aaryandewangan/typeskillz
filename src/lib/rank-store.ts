import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

/* ── Rank Constants ──────────────────────────────────────────────────── */

export const RANKS = [
  { id: "bronze",     label: "Bronze",     min: 0,    color: "#CD7F32", icon: "🥉" },
  { id: "silver",     label: "Silver",     min: 500,  color: "#C0C0C0", icon: "🥈" },
  { id: "gold",       label: "Gold",       min: 1200, color: "#FFD700", icon: "🏆" },
  { id: "platinum",   label: "Platinum",   min: 2000, color: "#00D4FF", icon: "💎" },
  { id: "diamond",    label: "Diamond",    min: 3000, color: "#B9F2FF", icon: "💠" },
  { id: "master",     label: "Master",     min: 4000, color: "#9B59B6", icon: "⭐" },
  { id: "grandmaster",label: "Grandmaster",min: 5000, color: "#FF4500", icon: "👑" },
  { id: "champion",   label: "Champion",   min: 0,    color: "#FFD700", icon: "🏅" },
] as const;

export type RankId = (typeof RANKS)[number]["id"];

export const PLACEMENT_MATCHES = 3;

export interface GameRank {
  uid: string;
  game: string;
  points: number;
  wins: number;
  losses: number;
  placementMatches: number;
  placementDone: boolean;
  rank: RankId;
  season: number;
  updatedAt: string;
}

export interface GameRankEntry {
  uid: string;
  displayName: string;
  points: number;
  wins: number;
  losses: number;
  rank: RankId;
  placementDone: boolean;
}

/* ── Rank Calculation ────────────────────────────────────────────────── */

export function getRankFromPoints(points: number): RankId {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (i === RANKS.length - 1) continue; // Champion is special
    if (points >= RANKS[i].min) return RANKS[i].id;
  }
  return "bronze";
}

export function getRankData(rankId: RankId) {
  return RANKS.find((r) => r.id === rankId) ?? RANKS[0];
}

export function getRankIndex(rankId: RankId): number {
  return RANKS.findIndex((r) => r.id === rankId);
}

export function getPointsForNextRank(currentRank: RankId): number | null {
  const idx = getRankIndex(currentRank);
  if (idx < 0 || idx >= RANKS.length - 1) return null;
  return RANKS[idx + 1].min;
}

export function calculatePointsChange(
  winnerRank: RankId,
  loserRank: RankId,
  isWin: boolean
): number {
  const wIdx = getRankIndex(winnerRank);
  const lIdx = getRankIndex(loserRank);

  if (isWin) {
    if (wIdx < lIdx) return 30;   // Beat someone higher
    if (wIdx === lIdx) return 25; // Beat someone same
    return 20;                     // Beat someone lower
  } else {
    if (wIdx < lIdx) return -15;  // Lost to someone higher
    if (wIdx === lIdx) return -20; // Lost to someone same
    return -25;                     // Lost to someone lower
  }
}

/* ── Firestore Operations ────────────────────────────────────────────── */

const CURRENT_SEASON = 1;

function rankDocId(uid: string, game: string): string {
  return `${uid}_${game}_s${CURRENT_SEASON}`;
}

export async function getGameRank(
  uid: string,
  game: string
): Promise<GameRank | null> {
  const snap = await getDoc(doc(db, "gameRanks", rankDocId(uid, game)));
  return snap.exists() ? (snap.data() as GameRank) : null;
}

export async function getOrCreateGameRank(
  uid: string,
  game: string
): Promise<GameRank> {
  const existing = await getGameRank(uid, game);
  if (existing) return existing;

  const newRank: GameRank = {
    uid,
    game,
    points: 0,
    wins: 0,
    losses: 0,
    placementMatches: 0,
    placementDone: false,
    rank: "bronze",
    season: CURRENT_SEASON,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, "gameRanks", rankDocId(uid, game)), newRank);
  return newRank;
}

export async function recordMatchResult(
  uid: string,
  game: string,
  won: boolean,
  opponentUid: string
): Promise<GameRank> {
  const myRank = await getOrCreateGameRank(uid, game);
  const oppRank = await getOrCreateGameRank(opponentUid, game);

  const ptsChange = calculatePointsChange(myRank.rank, oppRank.rank, won);
  const newPoints = Math.max(0, myRank.points + ptsChange);
  const newRank = getRankFromPoints(newPoints);

  const updates: Partial<GameRank> = {
    points: newPoints,
    rank: newRank,
    wins: myRank.wins + (won ? 1 : 0),
    losses: myRank.losses + (won ? 0 : 1),
    updatedAt: new Date().toISOString(),
  };

  if (!myRank.placementDone) {
    const newPlacement = myRank.placementMatches + 1;
    updates.placementMatches = newPlacement;
    if (newPlacement >= PLACEMENT_MATCHES) {
      updates.placementDone = true;
    }
  }

  await updateDoc(doc(db, "gameRanks", rankDocId(uid, game)), updates);

  return { ...myRank, ...updates } as GameRank;
}

export async function recordPlacementMatch(
  uid: string,
  game: string,
  won: boolean
): Promise<GameRank> {
  const myRank = await getOrCreateGameRank(uid, game);
  if (myRank.placementDone) return myRank;

  const ptsChange = won ? 25 : -15;
  const newPoints = Math.max(0, myRank.points + ptsChange);
  const newRank = getRankFromPoints(newPoints);

  const newPlacement = myRank.placementMatches + 1;
  const placementDone = newPlacement >= PLACEMENT_MATCHES;

  const updates: Partial<GameRank> = {
    points: newPoints,
    rank: newRank,
    wins: myRank.wins + (won ? 1 : 0),
    losses: myRank.losses + (won ? 0 : 1),
    placementMatches: newPlacement,
    placementDone,
    updatedAt: new Date().toISOString(),
  };

  await updateDoc(doc(db, "gameRanks", rankDocId(uid, game)), updates);
  return { ...myRank, ...updates } as GameRank;
}

export async function recordSoloResult(
  uid: string,
  game: string,
  won: boolean
): Promise<{ rank: GameRank; pts: number }> {
  const myRank = await getOrCreateGameRank(uid, game);

  const ptsChange = won ? 15 : -10;
  const newPoints = Math.max(0, myRank.points + ptsChange);
  const newRank = getRankFromPoints(newPoints);

  const updates: Partial<GameRank> = {
    points: newPoints,
    rank: newRank,
    wins: myRank.wins + (won ? 1 : 0),
    losses: myRank.losses + (won ? 0 : 1),
    updatedAt: new Date().toISOString(),
  };

  if (!myRank.placementDone) {
    const newPlacement = myRank.placementMatches + 1;
    updates.placementMatches = newPlacement;
    if (newPlacement >= PLACEMENT_MATCHES) {
      updates.placementDone = true;
    }
  }

  await updateDoc(doc(db, "gameRanks", rankDocId(uid, game)), updates);
  return { rank: { ...myRank, ...updates } as GameRank, pts: ptsChange };
}

export async function getGameLeaderboard(
  game: string,
  count = 500
): Promise<GameRankEntry[]> {
  const q = query(
    collection(db, "gameRanks"),
    where("game", "==", game),
    where("season", "==", CURRENT_SEASON),
    orderBy("points", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);

  const entries: GameRankEntry[] = [];
  for (const d of snap.docs) {
    const data = d.data() as GameRank;
    const userSnap = await getDoc(doc(db, "users", data.uid));
    const userData = userSnap.exists() ? userSnap.data() : null;
    entries.push({
      uid: data.uid,
      displayName: userData?.displayName ?? "Anonymous",
      points: data.points,
      wins: data.wins,
      losses: data.losses,
      rank: data.rank,
      placementDone: data.placementDone,
    });
  }

  return entries;
}

export function listenGameLeaderboard(
  game: string,
  count: number,
  callback: (entries: GameRankEntry[]) => void
): () => void {
  const q = query(
    collection(db, "gameRanks"),
    where("game", "==", game),
    where("season", "==", CURRENT_SEASON),
    orderBy("points", "desc"),
    limit(count)
  );
  return onSnapshot(q, async (snap) => {
    const entries: GameRankEntry[] = [];
    for (const d of snap.docs) {
      const data = d.data() as GameRank;
      const userSnap = await getDoc(doc(db, "users", data.uid));
      const userData = userSnap.exists() ? userSnap.data() : null;
      entries.push({
        uid: data.uid,
        displayName: userData?.displayName ?? "Anonymous",
        points: data.points,
        wins: data.wins,
        losses: data.losses,
        rank: data.rank,
        placementDone: data.placementDone,
      });
    }
    callback(entries);
  });
}

export async function getPlayerRank(
  uid: string,
  game: string
): Promise<{ rank: RankId; position: number } | null> {
  const myRank = await getGameRank(uid, game);
  if (!myRank) return null;

  const q = query(
    collection(db, "gameRanks"),
    where("game", "==", game),
    where("season", "==", CURRENT_SEASON),
    where("points", ">", myRank.points),
    limit(500)
  );
  const snap = await getDocs(q);

  return {
    rank: myRank.rank,
    position: snap.size + 1,
  };
}
