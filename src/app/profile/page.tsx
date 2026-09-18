"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Trophy, Flame, BookOpen, ArrowRight, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useUserData } from "@/lib/useUserData";
import { useAuth } from "@/components/AuthProvider";
import { ACHIEVEMENTS, evaluateAchievements } from "@/lib/achievements";
import { TOTAL_LESSONS } from "@/lib/lessons";
import { deleteAccount } from "@/lib/firebase-store";
import AchievementBadge from "@/components/AchievementBadge";
import StatCard from "@/components/StatCard";
import SignInGate from "@/components/SignInGate";

const LAYOUTS = [
  "qwerty", "dvorak", "colemak", "workman", "azerty",
  "qwertz", "colemak-dh", "neo", "bepo", "hindi-inscript",
];

export default function ProfilePage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { profile, results, streak, stats, level, saveProfile, loading: dataLoading } = useUserData();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const loading = authLoading || dataLoading;

  const unlocked = evaluateAchievements(results, streak.count);
  const doneCount = [...new Set(results.filter((r) => r.accuracy >= 80).map((r) => r.lessonId))].length;
  const levelProg = (stats.xp % 1000) / 10;

  const content = (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 pb-10">
      <p className="eyebrow">{"{ you }"}</p>
      <h1 className="display-giant mt-2 text-5xl sm:text-7xl">
        PROFILE<span className="text-muted">.</span>
      </h1>

      <div className="mt-6 rounded-[24px] border border-hairline bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-ink text-cream text-2xl font-black">
            {profile.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-[12px] font-bold tracking-widest text-muted">
              DISPLAY NAME
            </label>
            <input
              value={profile.name}
              onChange={(e) => saveProfile({ ...profile, name: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-hairline bg-paper px-4 py-2.5 font-bold outline-none focus:border-ink"
            />
          </div>
          <div>
            <label className="text-[12px] font-bold tracking-widest text-muted">
              WPM GOAL
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                min={10}
                max={200}
                value={profile.goal}
                onChange={(e) => saveProfile({ ...profile, goal: Number(e.target.value) })}
                className="w-24 rounded-2xl border border-hairline bg-paper px-4 py-2.5 font-bold outline-none focus:border-ink"
              />
              <span className="text-[13px] text-muted">wpm</span>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <label className="text-[12px] font-bold tracking-widest text-muted">
            KEYBOARD LAYOUT (10 SUPPORTED)
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {LAYOUTS.map((l) => (
              <button
                key={l}
                onClick={() => saveProfile({ ...profile, layout: l })}
                className={`pill-btn px-4 py-2 text-[13px] font-bold border ${
                  profile.layout === l
                    ? "bg-ink text-cream border-ink"
                    : "bg-paper border-hairline hover:bg-nested"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          {profile.layout !== "qwerty" && (
            <Link
              href="/learn/layouts"
              className="mt-3 inline-flex items-center gap-1 text-[14px] font-bold underline"
            >
              Open {profile.layout} conversion drills <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[22px] border border-hairline bg-ink text-cream p-5">
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={14} className="text-brand-bright" />
            <p className="text-[12px] font-bold tracking-widest text-cream/60">
              LEVEL {level}
            </p>
          </div>
          <p className="text-2xl font-black">{stats.xp.toLocaleString()} XP</p>
          <div className="mt-2 h-2 rounded-full bg-white/15 overflow-hidden">
            <div className="h-full bg-brand-bright" style={{ width: `${levelProg}%` }} />
          </div>
        </div>
        <StatCard
          icon={BookOpen}
          label="PROGRESS"
          value={`${doneCount} / ${TOTAL_LESSONS}`}
          sub="lessons at 80%+ accuracy"
          color="#0aa63f"
        />
        <StatCard
          icon={Flame}
          label="STREAK"
          value={`${streak.count} days`}
          sub="type daily to keep it alive"
          color="#ff8709"
        />
      </div>

      <div className="mt-4 rounded-[24px] border border-hairline bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-[18px] flex items-center gap-2">
            <Trophy size={18} className="text-tang" /> Achievements
          </h2>
          <span className="rounded-full bg-nested px-3 py-1 text-[12.5px] font-bold">
            {unlocked.size} / {ACHIEVEMENTS.length} unlocked
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {ACHIEVEMENTS.map((a, i) => (
            <AchievementBadge key={a.id} achievement={a} unlocked={unlocked.has(a.id)} index={i} />
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="mt-8 rounded-[24px] border border-rose/30 bg-white p-6">
        <h2 className="font-extrabold text-[18px] flex items-center gap-2 text-rose">
          <AlertTriangle size={18} /> Danger zone
        </h2>
        <p className="mt-1 text-[14px] text-muted">
          Permanently delete your account and all data. This cannot be undone.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="mt-4 pill-btn flex items-center gap-2 border border-rose/40 text-rose px-5 py-2.5 text-[13.5px] font-bold hover:bg-rose-soft transition-colors"
          >
            <Trash2 size={14} /> Delete account
          </button>
        ) : (
          <div className="mt-4 rounded-2xl border border-rose/30 bg-rose-soft/50 p-4">
            <p className="text-[14px] font-bold text-rose">
              Are you sure? This will permanently delete:
            </p>
            <ul className="mt-2 text-[13px] text-muted space-y-1">
              <li>Your profile and username</li>
              <li>All typing results and stats</li>
              <li>All streaks and achievements</li>
              <li>Any rooms you created</li>
            </ul>
            {deleteError && (
              <p className="mt-2 text-[13px] font-bold text-rose">{deleteError}</p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                onClick={async () => {
                  if (!user) return;
                  setDeleteLoading(true);
                  setDeleteError("");
                  try {
                    await deleteAccount(user.uid);
                    await user.delete();
                    await signOut();
                  } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : "Failed to delete account";
                    if (msg.includes("recent")) {
                      setDeleteError("Please sign in again before deleting your account.");
                    } else {
                      setDeleteError(msg);
                    }
                    setDeleteLoading(false);
                  }
                }}
                disabled={deleteLoading}
                className="pill-btn flex items-center gap-2 bg-rose text-white px-5 py-2.5 text-[13.5px] font-bold disabled:opacity-50"
              >
                {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Yes, delete everything
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteError(""); }}
                className="pill-btn border border-hairline bg-white px-5 py-2.5 text-[13.5px] font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );

  if (!user) {
    return <SignInGate loading={loading}>{content}</SignInGate>;
  }

  return content;
}
