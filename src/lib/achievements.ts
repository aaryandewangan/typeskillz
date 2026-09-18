import type { TypingResult } from "./stats";

export interface Achievement {
  id: string;
  name: string;
  blurb: string;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-steps", name: "First Steps", blurb: "Finish your very first lesson.", icon: "👣" },
  { id: "warming-up", name: "Warming Up", blurb: "Complete 5 lessons.", icon: "🔥" },
  { id: "regular", name: "Regular", blurb: "Complete 25 lessons.", icon: "📅" },
  { id: "centurion", name: "Centurion", blurb: "Complete 100 lessons.", icon: "💯" },
  { id: "marathoner", name: "Marathoner", blurb: "Complete 500 lessons.", icon: "🏃" },
  { id: "speed-30", name: "Cruising", blurb: "Hit 30 WPM in any run.", icon: "🚗" },
  { id: "speed-50", name: "Swift", blurb: "Hit 50 WPM in any run.", icon: "🚄" },
  { id: "speed-70", name: "Blazing", blurb: "Hit 70 WPM in any run.", icon: "⚡" },
  { id: "speed-100", name: "Supersonic", blurb: "Hit 100 WPM in any run.", icon: "🚀" },
  { id: "sharpshooter", name: "Sharpshooter", blurb: "Score 95%+ accuracy in a run.", icon: "🎯" },
  { id: "perfectionist", name: "Perfectionist", blurb: "Score a flawless 100% run.", icon: "💎" },
  { id: "streak-3", name: "On Fire", blurb: "Reach a 3-day streak.", icon: "🔥" },
  { id: "streak-7", name: "Unstoppable", blurb: "Reach a 7-day streak.", icon: "🌋" },
  { id: "streak-30", name: "Legend", blurb: "Reach a 30-day streak.", icon: "👑" },
  { id: "explorer", name: "Explorer", blurb: "Type in 5 different tracks.", icon: "🧭" },
  { id: "code-warrior", name: "Code Warrior", blurb: "Finish 10 code typing lessons.", icon: "💻" },
  { id: "paragraph-10", name: "Paragraph Pro", blurb: "Finish 10 paragraph marathon lessons.", icon: "📝" },
  { id: "paragraph-100", name: "Novelist", blurb: "Finish 100 paragraph marathon lessons.", icon: "📚" },
  { id: "polyglot", name: "Polyglot", blurb: "Finish 10 world-language lessons.", icon: "🌍" },
  { id: "xp-5000", name: "Rising Star", blurb: "Earn 5,000 total XP.", icon: "⭐" },
];

export function evaluateAchievements(results: TypingResult[], streak: number): Set<string> {
  const unlocked = new Set<string>();
  const done = results.filter((r) => r.accuracy >= 70);
  const best = Math.max(0, ...results.map((r) => r.wpm));
  const bestAcc = Math.max(0, ...results.map((r) => r.accuracy));
  const xp = results.reduce((s, r) => s + Math.round(r.wpm * (r.accuracy / 100)), 0);
  const tracks = new Set(done.map((r) => r.lessonId.split("-").slice(0, -1).join("-") || r.lessonId));
  // note: track ids contain dashes; match by prefix instead
  const inTrack = (t: string) => done.filter((r) => r.lessonId.startsWith(t + "-")).length;
  const trackCount = [
    "home-row", "top-row", "bottom-row", "numbers-symbols", "speed-builders",
    "accuracy-lab", "code-typing", "jungle-junior", "story-adventures",
    "business-pro", "world-languages", "layouts", "paragraph-marathon",
  ].filter((t) => inTrack(t) > 0).length;
  void tracks;

  if (done.length >= 1) unlocked.add("first-steps");
  if (done.length >= 5) unlocked.add("warming-up");
  if (done.length >= 25) unlocked.add("regular");
  if (done.length >= 100) unlocked.add("centurion");
  if (done.length >= 500) unlocked.add("marathoner");
  if (best >= 30) unlocked.add("speed-30");
  if (best >= 50) unlocked.add("speed-50");
  if (best >= 70) unlocked.add("speed-70");
  if (best >= 100) unlocked.add("speed-100");
  if (bestAcc >= 95) unlocked.add("sharpshooter");
  if (bestAcc >= 100 && results.length > 0) unlocked.add("perfectionist");
  if (streak >= 3) unlocked.add("streak-3");
  if (streak >= 7) unlocked.add("streak-7");
  if (streak >= 30) unlocked.add("streak-30");
  if (trackCount >= 5) unlocked.add("explorer");
  if (inTrack("code-typing") >= 10) unlocked.add("code-warrior");
  if (inTrack("paragraph-marathon") >= 10) unlocked.add("paragraph-10");
  if (inTrack("paragraph-marathon") >= 100) unlocked.add("paragraph-100");
  if (inTrack("world-languages") >= 10) unlocked.add("polyglot");
  if (xp >= 5000) unlocked.add("xp-5000");
  return unlocked;
}
