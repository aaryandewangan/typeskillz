"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Zap, Shield, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useUserData } from "@/lib/useUserData";
import {
  getOrCreateGameRank,
  listenGameLeaderboard,
  getRankData,
  getRankIndex,
  getPointsForNextRank,
  PLACEMENT_MATCHES,
  type GameRank,
  type GameRankEntry,
  type RankId,
} from "@/lib/rank-store";

const RANK_ICONS = [Trophy, Medal, Zap];
const RANK_COLORS: Record<string, string> = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
  platinum: "#00D4FF",
  diamond: "#B9F2FF",
  master: "#9B59B6",
  grandmaster: "#FF4500",
  champion: "#FFD700",
};

function RankBadge({ rank, size = "md" }: { rank: RankId; size?: "sm" | "md" | "lg" }) {
  const data = getRankData(rank);
  const sizeClasses = {
    sm: "h-5 w-5 text-[10px]",
    md: "h-8 w-8 text-[13px]",
    lg: "h-12 w-12 text-[18px]",
  };
  return (
    <div
      className={`${sizeClasses[size]} grid place-items-center rounded-full font-black text-white`}
      style={{ background: data.color }}
      title={data.label}
    >
      {data.icon}
    </div>
  );
}

function RankProgress({ rank, points }: { rank: RankId; points: number }) {
  const nextPoints = getPointsForNextRank(rank);
  if (nextPoints === null) return null;

  const rankData = getRankData(rank);
  const progress = ((points - rankData.min) / (nextPoints - rankData.min)) * 100;

  return (
    <div className="mt-2">
      <div className="flex justify-between text-[12px] font-bold text-muted mb-1">
        <span>{rankData.label} — {points} pts</span>
        <span>{nextPoints} pts to next</span>
      </div>
      <div className="h-2 rounded-full bg-nested overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: rankData.color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, progress)}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

function PlacementBanner({ matches, total }: { matches: number; total: number }) {
  return (
    <div className="rounded-2xl bg-tang/10 border border-tang/20 px-4 py-3 mb-4">
      <div className="flex items-center gap-2">
        <Shield size={16} className="text-tang" />
        <span className="text-[13px] font-extrabold text-tang">
          Placement: {matches}/{total} matches
        </span>
      </div>
      <p className="text-[12px] text-muted mt-1">
        Complete {total - matches} more match{total - matches !== 1 ? "es" : ""} to get your rank
      </p>
    </div>
  );
}

interface GameLeaderboardProps {
  game: string;
  color: string;
  compact?: boolean;
  title?: string;
}

export default function GameLeaderboard({ game, color, compact = false, title }: GameLeaderboardProps) {
  const { user } = useAuth();
  const { stats } = useUserData();
  const [entries, setEntries] = useState<GameRankEntry[]>([]);
  const [myRank, setMyRank] = useState<GameRank | null>(null);
  const [myPosition, setMyPosition] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = listenGameLeaderboard(game, 500, (data) => {
      setEntries(data);
      setLoading(false);
    });
    return unsub;
  }, [game]);

  useEffect(() => {
    if (!user) return;
    getOrCreateGameRank(user.uid, game).then(setMyRank);
  }, [user, game]);

  useEffect(() => {
    if (!user) return;
    const pos = entries.findIndex((e) => e.uid === user.uid);
    setMyPosition(pos >= 0 ? pos + 1 : null);
  }, [user, entries]);

  const maxPts = Math.max(...entries.map((e) => e.points), 1);

  if (loading) {
    return (
      <div className="rounded-[24px] border border-hairline bg-white p-6 shadow-card">
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 rounded-2xl bg-paper animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-hairline bg-white p-6 shadow-card">
      {/* My Rank Card */}
      {myRank && (
        <div className="mb-4 rounded-2xl bg-paper border border-hairline p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RankBadge rank={myRank.rank} size="lg" />
              <div>
                <p className="text-[18px] font-black" style={{ color: RANK_COLORS[myRank.rank] }}>
                  {getRankData(myRank.rank).label}
                </p>
                {myPosition && (
                  <p className="text-[13px] font-bold text-muted">
                    Rank #{myPosition} globally
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-[22px] font-black tabular-nums">{myRank.points}</p>
              <p className="text-[12px] font-bold text-muted">points</p>
            </div>
          </div>
          <div className="flex gap-4 mt-3 text-[13px] font-bold">
            <span className="text-brand flex items-center gap-1">
              <TrendingUp size={13} /> {myRank.wins}W
            </span>
            <span className="text-rose flex items-center gap-1">
              <TrendingDown size={13} /> {myRank.losses}L
            </span>
            <span className="text-muted">
              {myRank.wins + myRank.losses > 0
                ? `${Math.round((myRank.wins / (myRank.wins + myRank.losses)) * 100)}% WR`
                : "—"}
            </span>
          </div>
          {!myRank.placementDone && (
            <PlacementBanner matches={myRank.placementMatches} total={PLACEMENT_MATCHES} />
          )}
          <RankProgress rank={myRank.rank} points={myRank.points} />
        </div>
      )}

      {/* Leaderboard */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-extrabold flex items-center gap-2">
          <Trophy size={16} style={{ color }} /> {title ?? "Top 500"}
        </h3>
        <span className="text-[12px] font-bold text-muted">
          {entries.length} ranked
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="text-[13px] text-muted py-4 text-center">
          No ranked players yet. Be the first!
        </p>
      ) : (
        <div className={`${compact ? "max-h-[300px]" : "max-h-[400px]"} overflow-y-auto space-y-1.5`}>
          {entries.slice(0, compact ? 10 : 500).map((e, i) => {
            const RankIcon = i < 3 ? RANK_ICONS[i] : null;
            const isMe = e.uid === user?.uid;
            return (
              <motion.div
                key={e.uid}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className={`relative overflow-hidden rounded-xl px-3 py-2.5 ${
                  isMe ? "border-2 border-brand-bright bg-brand-soft" : "bg-paper"
                }`}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-xl opacity-8"
                  style={{ width: `${(e.points / maxPts) * 100}%`, background: color }}
                />
                <div className="relative flex items-center gap-2.5">
                  <span className="w-6 text-center font-black text-[13px]">
                    {RankIcon ? (
                      <RankIcon size={14} style={{ color: RANK_COLORS[e.rank] }} className="mx-auto" />
                    ) : (
                      <span className="text-muted">{i + 1}</span>
                    )}
                  </span>
                  <RankBadge rank={e.rank} size="sm" />
                  <span className="flex-1 font-bold text-[13px] truncate">
                    {e.displayName}
                    {isMe && <span className="ml-1 text-brand text-[11px]">(you)</span>}
                  </span>
                  <span className="font-mono font-bold tabular-nums text-[13px]">
                    {e.points}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
