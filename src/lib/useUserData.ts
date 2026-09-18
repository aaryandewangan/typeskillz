"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  getProfile,
  createProfile,
  updateProfile,
  getProgress,
  saveResult as firebaseSaveResult,
  type UserProfile,
  type TypingResult,
  type UserProgress,
} from "@/lib/firebase-store";

/* ── Types ──────────────────────────────────────────────────────────── */

export interface Profile {
  name: string;
  goal: number;
  layout: string;
}

export interface StreakData {
  day: string;
  count: number;
}

// Re-export the firebase-store TypingResult
export type { TypingResult } from "@/lib/firebase-store";

/* ── Local storage helpers (used when not signed in) ────────────────── */

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/* ── Hook: useUserData ──────────────────────────────────────────────── */

export function useUserData() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>({
    name: "Speedster",
    goal: 60,
    layout: "qwerty",
  });
  const [results, setResults] = useState<TypingResult[]>([]);
  const [streak, setStreak] = useState<StreakData>({ day: "", count: 0 });
  const [achievements, setAchievements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [synced, setSynced] = useState(false);

  // Load data from Firebase or localStorage
  useEffect(() => {
    async function load() {
      setLoading(true);
      if (user) {
        // Firebase
        const [fbProfile, fbProgress] = await Promise.all([
          getProfile(user.uid),
          getProgress(user.uid),
        ]);
        if (fbProfile) {
          setProfile({ name: fbProfile.displayName, goal: fbProfile.goal, layout: fbProfile.layout });
        } else {
          // First sign-in: create profile from localStorage
          const lsProfile = lsGet<Profile>("typeskillz:profile:v1", {
            name: "Speedster",
            goal: 60,
            layout: "qwerty",
          });
          await createProfile(user.uid, {
            displayName: lsProfile.name,
            email: user.email ?? "",
            goal: lsProfile.goal,
            layout: lsProfile.layout,
          });
          setProfile(lsProfile);
        }
        if (fbProgress) {
          setResults(fbProgress.results ?? []);
          setStreak(fbProgress.streak ?? { day: "", count: 0 });
          setAchievements(fbProgress.achievements ?? []);
        } else {
          // First sign-in: migrate localStorage data to Firebase
          const lsResults = lsGet<TypingResult[]>("typeskillz:progress:v1", []);
          const lsStreak = lsGet<StreakData>("typeskillz:streak", {
            day: "",
            count: 0,
          });
          if (lsResults.length > 0) {
            await firebaseSaveResult(user.uid, lsResults[lsResults.length - 1]);
            // Re-fetch to get the merged data
            const fresh = await getProgress(user.uid);
            if (fresh) {
              setResults(fresh.results ?? []);
              setStreak(fresh.streak ?? { day: "", count: 0 });
            }
          } else {
            setResults([]);
            setStreak(lsStreak);
          }
        }
        setSynced(true);
      } else {
        // localStorage
        setProfile(lsGet<Profile>("typeskillz:profile:v1", { name: "Speedster", goal: 60, layout: "qwerty" }));
        setResults(lsGet<TypingResult[]>("typeskillz:progress:v1", []));
        setStreak(lsGet<StreakData>("typeskillz:streak", { day: "", count: 0 }));
        setAchievements([]);
        setSynced(true);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  // Save profile
  const saveProfile = useCallback(
    async (p: Profile) => {
      setProfile(p);
      if (user) {
        await updateProfile(user.uid, {
          displayName: p.name,
          goal: p.goal,
          layout: p.layout,
        });
      } else {
        lsSet("typeskillz:profile:v1", p);
      }
    },
    [user]
  );

  // Save result
  const saveResult = useCallback(
    async (r: TypingResult) => {
      setResults((prev) => {
        const next = [...prev, r].slice(-2000);
        if (!user) lsSet("typeskillz:progress:v1", next);
        return next;
      });
      if (user) {
        await firebaseSaveResult(user.uid, r);
      }
      // Update streak
      const today = new Date().toDateString();
      setStreak((prev) => {
        if (prev.day === today) return prev;
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const count = prev.day === yesterday ? prev.count + 1 : 1;
        const next = { day: today, count };
        if (!user) lsSet("typeskillz:streak", next);
        return next;
      });
    },
    [user]
  );

  // Computed stats
  const stats = {
    avgWpm: results.length > 0 ? results.reduce((s, r) => s + r.wpm, 0) / results.length : 0,
    bestWpm: results.length > 0 ? Math.max(...results.map((r) => r.wpm)) : 0,
    avgAcc: results.length > 0 ? results.reduce((s, r) => s + r.accuracy, 0) / results.length : 0,
    sessions: results.length,
    timeMin: results.reduce((s, r) => s + r.durationSec, 0) / 60,
    xp: results.reduce((s, r) => s + Math.round(r.wpm * (r.accuracy / 100)), 0),
  };

  const level = Math.floor(stats.xp / 1000) + 1;
  const completedIds = new Set(results.filter((r) => r.accuracy >= 80).map((r) => r.lessonId));

  return {
    user,
    profile,
    results,
    streak,
    achievements,
    stats,
    level,
    completedIds,
    loading,
    synced,
    saveProfile,
    saveResult,
  };
}
