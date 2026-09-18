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

export interface Profile {
  name: string;
  goal: number; // wpm goal
  layout: string;
}

const PROGRESS_KEY = "typeskillz:progress:v1";
const PROFILE_KEY = "typeskillz:profile:v1";
const STREAK_KEY = "typeskillz:streak";

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function loadResults(): TypingResult[] {
  if (typeof window === "undefined") return [];
  return safeParse<TypingResult[]>(localStorage.getItem(PROGRESS_KEY), []);
}

export function recordResult(r: TypingResult): { results: TypingResult[]; isNewBest: boolean } {
  const prev = loadResults();
  const bestBefore = Math.max(0, ...prev.filter((x) => x.lessonId === r.lessonId).map((x) => x.wpm));
  const results = [...prev, r].slice(-2000);
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(results));
    bumpStreak();
  } catch {}
  return { results, isNewBest: r.wpm > bestBefore && bestBefore > 0 };
}

export function completedLessonIds(): Set<string> {
  return new Set(loadResults().filter((r) => r.accuracy >= 80).map((r) => r.lessonId));
}

export function bestForLesson(lessonId: string): TypingResult | undefined {
  const all = loadResults().filter((r) => r.lessonId === lessonId);
  return all.sort((a, b) => b.wpm - a.wpm)[0];
}

export function overallStats() {
  const all = loadResults();
  if (all.length === 0)
    return { avgWpm: 0, bestWpm: 0, avgAcc: 0, sessions: 0, timeMin: 0, xp: 0 };
  const avgWpm = all.reduce((s, r) => s + r.wpm, 0) / all.length;
  const avgAcc = all.reduce((s, r) => s + r.accuracy, 0) / all.length;
  const bestWpm = Math.max(...all.map((r) => r.wpm));
  const timeMin = all.reduce((s, r) => s + r.durationSec, 0) / 60;
  const xp = all.reduce((s, r) => s + Math.round(r.wpm * (r.accuracy / 100)), 0);
  return { avgWpm, bestWpm, avgAcc, sessions: all.length, timeMin, xp };
}

export function weakKeyReport(limit = 12): { key: string; misses: number }[] {
  const all = loadResults();
  const map = new Map<string, number>();
  for (const r of all.slice(-120)) {
    for (const k of r.weakKeys) map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([key, misses]) => ({ key, misses }))
    .sort((a, b) => b.misses - a.misses)
    .slice(0, limit);
}

export function wpmHistory(limit = 30): number[] {
  return loadResults().slice(-limit).map((r) => r.wpm);
}

export function loadProfile(): Profile {
  if (typeof window === "undefined") return { name: "Speedster", goal: 60, layout: "qwerty" };
  return safeParse<Profile>(localStorage.getItem(PROFILE_KEY), {
    name: "Speedster",
    goal: 60,
    layout: "qwerty",
  });
}

export function saveProfile(p: Profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {}
}

export function bumpStreak(): number {
  if (typeof window === "undefined") return 0;
  const today = new Date().toDateString();
  const cur = safeParse<{ day: string; count: number }>(
    localStorage.getItem(STREAK_KEY),
    { day: "", count: 0 }
  );
  if (cur.day === today) return cur.count;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const count = cur.day === yesterday ? cur.count + 1 : 1;
  localStorage.setItem(STREAK_KEY, JSON.stringify({ day: today, count }));
  return count;
}

export function starsFor(wpm: number, accuracy: number, target: number): number {
  if (accuracy < 70) return 1;
  if (accuracy < 85) return 2;
  if (wpm < target * 0.6) return 2;
  if (accuracy < 92) return 3;
  if (wpm < target) return 4;
  if (accuracy >= 97 && wpm >= target) return 5;
  return 4;
}
