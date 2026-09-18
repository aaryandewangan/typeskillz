import { getParagraph, PARAGRAPH_COUNT } from "./paragraphs";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  ArrowUp,
  ArrowDown,
  Hash,
  Zap,
  Target,
  Code,
  PawPrint,
  BookOpen,
  Briefcase,
  Globe,
  Keyboard,
  ScrollText,
} from "lucide-react";

export type LessonKind =
  | "keys"
  | "words"
  | "sentences"
  | "code"
  | "story"
  | "numbers"
  | "paragraph";

export interface Lesson {
  id: string;
  trackId: string;
  index: number; // 1-based within track
  title: string;
  text: string;
  targetWpm: number;
  focusKeys: string;
  kind: LessonKind;
}

export interface Track {
  id: string;
  title: string;
  blurb: string;
  description: string;
  color: string; // accent hex
  soft: string; // soft bg hex
  icon: LucideIcon;
  count: number;
  tags: string[];
}

// ---------------------------------------------------------------------------
// Deterministic pseudo-random (no hydration mismatch)
// ---------------------------------------------------------------------------
function seeded(n: number) {
  let x = (n * 2654435761) % 4294967296;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    return x / 4294967296;
  };
}

function pick<T>(rnd: () => number, arr: T[]): T {
  return arr[Math.floor(rnd() * arr.length)];
}

const HOME_WORDS = [
  "ask", "all", "as", "sad", "dad", "fad", "gas", "had", "lad", "lass",
  "fall", "hall", "shall", "glass", "grass", "flask", "flash", "slash",
  "add", "alas", "flak", "flag", "half", "calf", "scale", "shale", "she",
  "elf", "fell", "jell", "shell", "shack", "hack", "jack", "lack", "halal",
];
const TOP_WORDS = [
  "red", "ted", "try", "tree", "treat", "rate", "water", "later", "quarter",
  "quiet", "quite", "quote", "type", "typed", "writer", "write", "right",
  "year", "your", "young", "out", "pour", "power", "tower", "lower", "yellow",
  "puppy", "upper", "quick", "queue", "quietly", "rabbit", "rare", "ready",
];
const BOTTOM_WORDS = [
  "mix", "box", "fox", "vex", "exam", "six", "fix", "zip", "zap", "zoom",
  "move", "cave", "brave", "voice", "choice", "noise", "novel", "cover",
  "bomb", "comb", "number", "member", "moon", "noon", "soon", "bench",
  "chase", "march", "catch", "match", "much", "such", "rich", "which",
];
const SPEED_WORDS = [
  "the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog", "pack",
  "bright", "vivid", "zebra", "wizard", "oxygen", "keyboard", "rhythm",
  "flow", "focus", "speed", "power", "fluent", "steady", "swift", "sharp",
  "crisp", "clear", "drive", "surge", "sprint", "glide", "blaze", "storm",
  "typing", "fingers", "dance", "across", "keys", "while", "mind", "stays",
  "calm", "breath", "steady", "hands", "light", "touch", "press", "release",
];
const ACC_WORDS = [
  "accommodate", "rhythm", "necessary", "occasion", "separate", "definitely",
  "embarrass", "liaison", "millennium", "pharaoh", "questionnaire", "rhythm",
  "conscience", "dilemma", "fluorescent", "guarantee", "harass", "interrupt",
  "jewelry", "knowledge", "leisure", "maintenance", "medieval", "memento",
  "noticeable", "occasionally", "parallel", "playwright", "possession",
];
const BUSINESS = [
  "Please find attached the quarterly report for your review.",
  "Let's schedule a follow-up meeting for Thursday at 10am.",
  "Thank you for your prompt response to our proposal.",
  "The deadline for submissions is Friday, end of business day.",
  "Could you please confirm receipt of this invoice?",
  "We appreciate your partnership and continued support.",
  "Action items from today's standup are listed below.",
  "The client requested revisions to the draft contract.",
  "Revenue grew twelve percent quarter over quarter.",
  "Kindly review the agenda before our sync tomorrow.",
];
const KIDS = [
  "The cat sat on the red mat.",
  "A big dog ran to the park.",
  "Fish swim fast in the pond.",
  "The sun is fun in June.",
  "A frog jumps high and far.",
  "Bees buzz by the blue flowers.",
  "My kite flies up in the sky.",
  "Lions roar in the jungle.",
  "Ducks quack at the lake.",
  "Monkeys swing from tree to tree.",
];
const STORIES = [
  "Maya tightened her scarf as the old train rattled toward the glowing city.",
  "A tiny robot named Pip discovered a door behind the library shelf.",
  "The lighthouse blinked twice, and the sea answered with silver waves.",
  "Leo found a map drawn on the back of yesterday's spelling test.",
  "Nadia pedaled faster — the comet would only pass once tonight.",
  "Under the mossy bridge, something hummed a song nobody taught it.",
  "The dragon collected stamps, not gold, and traded kindly with travelers.",
  "Ava packed courage in her backpack and stepped onto the sky bridge.",
];
const CODE_SNIPPETS = [
  "const speed = (chars / 5) / minutes;",
  "function accuracy(correct: number, total: number) { return (correct / total) * 100; }",
  "for (let i = 0; i < keys.length; i++) { highlight(keys[i]); }",
  "const results = lessons.filter((l) => l.completed).map((l) => l.wpm);",
  "import { useState, useEffect } from 'react';",
  "def words_per_minute(chars, seconds): return (chars / 5) / (seconds / 60)",
  "if error_rate > 0.05: practice_weak_keys()",
  "<button className=\"pill-btn bg-ink text-cream\">Start typing</button>",
  "SELECT lesson, wpm FROM results WHERE accuracy > 95 ORDER BY wpm DESC;",
  "const streak = JSON.parse(localStorage.getItem('typeskillz:streak'));",
  "async function saveResult(result) { await db.results.add(result); }",
  "body { font-family: 'Inter Tight', sans-serif; letter-spacing: -0.02em; }",
];
const LANG_SAMPLES: Record<string, string[]> = {
  spanish: ["El zorro marrón salta sobre el perro perezoso.", "Practica un poco cada día y serás un profesional.", "La velocidad viene con la constancia y la calma."],
  french: ["Le renard brun saute par-dessus le chien paresseux.", "Pratiquez quelques minutes chaque jour.", "La précision d'abord, la vitesse suivra."],
  german: ["Der schnelle braune Fuchs springt über den faulen Hund.", "Übe jeden Tag ein paar Minuten.", "Genauigkeit zuerst, Tempo folgt."],
  portuguese: ["A raposa marrom salta sobre o cão preguiçoso.", "Pratique alguns minutos por dia.", "Precisão primeiro, velocidade depois."],
  italian: ["La volpe marrone salta sopra il cane pigro.", "Allenati pochi minuti al giorno.", "Prima la precisione, poi la velocità."],
  dutch: ["De snelle bruine vos springt over de luie hond.", "Oefen elke dag een paar minuten.", "Eerst nauwkeurig, dan snel."],
  polish: ["Szybki brązowy lis przeskakuje nad leniwym psem.", "Ćwicz kilka minut dziennie.", "Najpierw dokładność, potem prędkość."],
  japanese: ["いろはにほへと ちりぬるを わかよたれそ つねならむ"],
  hindi: ["कठिन परिश्रम का कोई विकल्प नहीं होता है।", "रोज़ थोड़ा अभ्यास करें।"],
  arabic: ["الثعلب البني السريع يقفز فوق الكلب الكسول.", "تدرب بضع دقائق كل يوم."],
};
const NUM_PATTERNS = [
  "123 456 789 0 2026 3.14 100% $49.99",
  "Call 555-0142 ext. 3301 by 5:30pm!",
  "(415) 555-0199 — order #88412, qty 36",
  "Pi = 3.14159, e = 2.71828, phi = 1.61803",
  "user@example.com — 99 bottles, 42 answers",
  "Score: 98.6% (n=1,204) p<0.01, r=0.87",
  "Open 9:00–17:30, lunch 12:15, code 90210",
];
const LAYOUT_FOCUS: Record<string, string> = {
  dvorak: "aoeuidhtns",
  colemak: "arstdhneio",
  workman: "ashtneoi",
  azerty: "azertyqsdf",
  qwertz: "qwertzyxcv",
};

export const TRACK_DEFS: Track[] = [
  { id: "home-row", title: "Home Row Mastery", blurb: "asdf jkl; — the foundation of everything.", description: "Start here. 45 progressive drills from single keys to full words, with finger-by-finger guidance.", color: "#0aa63f", soft: "#dfffd1", icon: Home, count: 45, tags: ["beginner", "foundation"] },
  { id: "top-row", title: "Top Row Sprint", blurb: "qwertyuiop without looking down.", description: "60 lessons that layer the top row onto your home-row base.", color: "#ff8709", soft: "#fff0dc", icon: ArrowUp, count: 60, tags: ["beginner"] },
  { id: "bottom-row", title: "Bottom Row Control", blurb: "zxcvbnm,. — the row everyone skips.", description: "60 lessons for the trickiest row, with accuracy-first drills.", color: "#c026b8", soft: "#fde4fa", icon: ArrowDown, count: 60, tags: ["beginner"] },
  { id: "numbers-symbols", title: "Numbers & Symbols", blurb: "123!@# for coders, accountants, everyone.", description: "100 lessons covering num row, numpad flow, and symbol fluency.", color: "#5f58e8", soft: "#e7e5ff", icon: Hash, count: 100, tags: ["intermediate"] },
  { id: "speed-builders", title: "Speed Builders", blurb: "From 30 to 100+ WPM with bursts.", description: "150 interval workouts: bursts, sustains, and common-word sprints.", color: "#ff8709", soft: "#fff0dc", icon: Zap, count: 150, tags: ["speed", "popular"] },
  { id: "accuracy-lab", title: "Accuracy Lab", blurb: "Kill your error patterns for good.", description: "130 brutal-but-fair drills on lookalikes, doubles, and your weakest keys.", color: "#c026b8", soft: "#fde4fa", icon: Target, count: 130, tags: ["accuracy"] },
  { id: "code-typing", title: "Code Typing", blurb: "Brackets, snakes, semicolons.", description: "180 real snippets in JS, TS, Python, HTML, CSS & SQL. TypingClub doesn't have this.", color: "#5f58e8", soft: "#e7e5ff", icon: Code, count: 180, tags: ["code", "pro", "new"] },
  { id: "jungle-junior", title: "Jungle Junior (Kids)", blurb: "Short, silly, voice-friendly lessons.", description: "100 kid-safe lessons with animals, short sentences, and big stars.", color: "#0aa63f", soft: "#dfffd1", icon: PawPrint, count: 100, tags: ["kids"] },
  { id: "story-adventures", title: "Story Adventures", blurb: "Type your way through 120 chapters.", description: "Animated-story style chapters. Finish a chapter by typing it cleanly.", color: "#008fb8", soft: "#dcf5fc", icon: BookOpen, count: 120, tags: ["stories", "fun"] },
  { id: "business-pro", title: "Business Pro", blurb: "Emails, reports, meetings at speed.", description: "130 workplace texts: emails, agendas, invoices, standups.", color: "#0aa63f", soft: "#dfffd1", icon: Briefcase, count: 130, tags: ["pro", "office"] },
  { id: "world-languages", title: "World Languages", blurb: "25 languages, native sentences.", description: "150 lessons across Spanish, French, German, Portuguese, Hindi, Arabic & more.", color: "#008fb8", soft: "#dcf5fc", icon: Globe, count: 150, tags: ["languages"] },
  { id: "layouts", title: "Alt Layouts Lab", blurb: "Dvorak, Colemak, Workman, AZERTY…", description: "120 conversion drills for 10 layouts. Remap your muscle memory.", color: "#5f58e8", soft: "#e7e5ff", icon: Keyboard, count: 120, tags: ["dvorak", "colemak", "advanced"] },
  { id: "paragraph-marathon", title: "Paragraph Marathon", blurb: "1,050 full paragraphs. The endless mode.", description: "Our biggest track ever: 1,050 hand-built paragraphs across wisdom, science, stories, tech & mindfulness. Built for stamina.", color: "#ff8709", soft: "#fff0dc", icon: ScrollText, count: PARAGRAPH_COUNT, tags: ["paragraphs", "endurance", "popular", "new"] },
];

const CURATED: Record<string, string> = {
  "home-row-1": "fff jjj fff jjj fj fj jf jf",
  "home-row-2": "ddd kkk ddd kkk dk kd dd kk",
  "home-row-3": "sss lll aaa ;;; sal lass all as",
  "code-typing-1": "const wpm = chars / 5 / minutes;",
  "jungle-junior-1": "The cat sat on the red mat.",
};

function buildText(trackId: string, n: number): { text: string; kind: LessonKind; focus: string } {
  const rnd = seeded(n * 7919 + trackId.length * 131);
  switch (trackId) {
    case "home-row": {
      const keys = ["f", "j", "d", "k", "s", "l", "a", ";"][Math.min(7, Math.floor(n / 6))];
      void keys;
      const pool = HOME_WORDS.filter((w) => w.length <= 3 + Math.floor(n / 8));
      const words = Array.from({ length: 12 + (n % 14) }, () => pick(rnd, pool.length ? pool : HOME_WORDS));
      return { text: words.join(" "), kind: n < 8 ? "keys" : "words", focus: "asdf jkl;" };
    }
    case "top-row": {
      const words = Array.from({ length: 14 + (n % 12) }, () => pick(rnd, TOP_WORDS));
      return { text: words.join(" "), kind: "words", focus: "qwertyuiop" };
    }
    case "bottom-row": {
      const words = Array.from({ length: 14 + (n % 12) }, () => pick(rnd, BOTTOM_WORDS));
      return { text: words.join(" "), kind: "words", focus: "zxcvbnm,." };
    }
    case "numbers-symbols": {
      const pat = pick(rnd, NUM_PATTERNS);
      const extra = n % 3 === 0 ? ` ${Math.floor(rnd() * 9000 + 1000)}` : "";
      return { text: pat + extra, kind: "numbers", focus: "1234567890!@#" };
    }
    case "speed-builders": {
      const words = Array.from({ length: 28 + (n % 20) }, () => pick(rnd, SPEED_WORDS));
      return { text: words.join(" "), kind: "sentences", focus: "common words" };
    }
    case "accuracy-lab": {
      const words = Array.from({ length: 16 + (n % 10) }, () => pick(rnd, ACC_WORDS));
      return { text: words.join(" "), kind: "words", focus: "tricky words" };
    }
    case "code-typing": {
      const a = pick(rnd, CODE_SNIPPETS);
      const b = n % 4 === 0 ? " " + pick(rnd, CODE_SNIPPETS) : "";
      return { text: (a + b).slice(0, 220), kind: "code", focus: "{}();<>" };
    }
    case "jungle-junior": {
      const a = pick(rnd, KIDS);
      const b = n % 3 === 0 ? " " + pick(rnd, KIDS) : "";
      return { text: a + b, kind: "sentences", focus: "short words" };
    }
    case "story-adventures": {
      const a = pick(rnd, STORIES);
      const b = n % 2 === 0 ? " " + pick(rnd, STORIES) : "";
      return { text: (a + b).slice(0, 260), kind: "story", focus: "flow" };
    }
    case "business-pro": {
      const a = pick(rnd, BUSINESS);
      const b = n % 3 === 0 ? " " + pick(rnd, BUSINESS) : "";
      return { text: (a + b).slice(0, 260), kind: "sentences", focus: "professional" };
    }
    case "world-languages": {
      const langs = Object.keys(LANG_SAMPLES);
      const lang = langs[n % langs.length];
      const samples = LANG_SAMPLES[lang];
      const a = pick(rnd, samples);
      return { text: a, kind: "sentences", focus: lang };
    }
    case "layouts": {
      const names = Object.keys(LAYOUT_FOCUS);
      const name = names[n % names.length];
      const focus = LAYOUT_FOCUS[name];
      const chars = focus.split("");
      const chunk = Array.from({ length: 40 }, () => pick(rnd, chars)).join(" ");
      return { text: `${name}: ${chunk}`, kind: "keys", focus: name };
    }
    case "paragraph-marathon": {
      const para = getParagraph(n);
      return { text: para.text, kind: "paragraph", focus: para.category };
    }
    default:
      return { text: "type fast and steady", kind: "words", focus: "all" };
  }
}

function titleFor(trackId: string, n: number): string {
  const names: Record<string, string> = {
    "home-row": n <= 8 ? `Home keys ${n}` : `Home words ${n}`,
    "top-row": `Top row ${n}`,
    "bottom-row": `Bottom row ${n}`,
    "numbers-symbols": `Numbers ${n}`,
    "speed-builders": n % 5 === 0 ? `Sprint ${n}` : `Flow ${n}`,
    "accuracy-lab": `Precision ${n}`,
    "code-typing": `Snippet ${n}`,
    "jungle-junior": `Jungle step ${n}`,
    "story-adventures": `Chapter ${n}`,
    "business-pro": `Office drill ${n}`,
    "world-languages": `Language hop ${n}`,
    "layouts": `Remap ${n}`,
    "paragraph-marathon": `Paragraph ${n}`,
  };
  return names[trackId] ?? `Lesson ${n}`;
}

export const ALL_LESSONS: Lesson[] = TRACK_DEFS.flatMap((t) =>
  Array.from({ length: t.count }, (_, i) => {
    const n = i + 1;
    const id = `${t.id}-${n}`;
    const curated = CURATED[id];
    const built = buildText(t.id, n);
    const isPara = t.id === "paragraph-marathon";
    const para = isPara ? getParagraph(n) : undefined;
    return {
      id,
      trackId: t.id,
      index: n,
      title: para ? `${para.title} (${para.category})` : titleFor(t.id, n),
      text: curated ?? built.text,
      targetWpm:
        t.id === "jungle-junior"
          ? 15 + Math.floor(n / 6)
          : isPara
            ? 30 + Math.min(30, Math.floor(n / 40))
            : 20 + Math.floor(n / 4),
      focusKeys: built.focus,
      kind: built.kind,
    } satisfies Lesson;
  })
);

export const TOTAL_LESSONS = ALL_LESSONS.length;

export function getTrack(id: string): Track | undefined {
  return TRACK_DEFS.find((t) => t.id === id);
}

export function getLesson(id: string): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.id === id);
}

export function getLessonsByTrack(trackId: string): Lesson[] {
  return ALL_LESSONS.filter((l) => l.trackId === trackId);
}

export function getNextLesson(id: string): Lesson | undefined {
  const cur = getLesson(id);
  if (!cur) return undefined;
  const inTrack = getLessonsByTrack(cur.trackId);
  const next = inTrack.find((l) => l.index === cur.index + 1);
  return next ?? ALL_LESSONS.find((l) => l.trackId !== cur.trackId);
}

export function searchLessons(q: string, limit = 24): Lesson[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return ALL_LESSONS.slice(0, limit);
  return ALL_LESSONS.filter(
    (l) =>
      l.title.toLowerCase().includes(needle) ||
      l.trackId.includes(needle) ||
      l.focusKeys.toLowerCase().includes(needle)
  ).slice(0, limit);
}
