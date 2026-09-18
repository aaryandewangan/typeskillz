// TypeSkillz paragraph bank — 1,050 full paragraphs across 10 categories.
// Deterministic: paragraph N is always identical (no hydration mismatch).

export interface Paragraph {
  id: string;
  index: number;
  title: string;
  category: string;
  text: string;
  level: 1 | 2 | 3 | 4 | 5;
}

const BANK: Record<string, string[]> = {
  wisdom: [
    "Patience turns small efforts into great results over time.",
    "A calm mind solves in minutes what a worried mind cannot solve in days.",
    "The best time to start was yesterday, and the second best time is now.",
    "Discipline is choosing what you want most over what you want right now.",
    "Small habits repeated daily quietly build an extraordinary life.",
    "Listen more than you speak and you will learn twice as fast.",
    "Failure is simply feedback wearing a frightening costume.",
    "Gratitude turns an ordinary day into a surprisingly good one.",
    "You cannot control the wind, but you can always adjust your sails.",
    "Kindness costs nothing yet it pays the highest interest of all.",
    "A goal without a plan is only a wish waiting to fade away.",
    "Courage is not the absence of fear but action taken despite it.",
    "The way you spend your mornings shapes the way you spend your life.",
    "Compare yourself only to the person you were yesterday.",
    "Wise people learn from the mistakes that others have already made.",
  ],
  focus: [
    "Focus is a muscle, and every distraction you resist makes it stronger.",
    "Work in short sprints with full attention, then rest without any guilt.",
    "Turn off notifications and your brain will thank you within one hour.",
    "One task done completely beats five tasks started and abandoned.",
    "Your attention is your most valuable currency, so spend it wisely.",
    "Clear your desk, clear your tabs, and watch your mind follow along.",
    "Deep work feels slow at first, then suddenly everything clicks.",
    "Write down distracting thoughts instead of chasing them right away.",
    "The first ten minutes of focus are the hardest, so just begin typing.",
    "Batch similar tasks together to protect your creative energy.",
    "Silence your phone and you will hear your own ideas again.",
    "Multitasking is a myth that makes everything take twice as long.",
    "Set a timer for twenty five minutes and give it everything you have.",
    "End each day by planning the single most important task for tomorrow.",
    "Attention follows intention, so decide clearly what matters today.",
  ],
  technology: [
    "The keyboard remains the fastest bridge between thought and machine.",
    "Every app you love began as plain text typed by patient hands.",
    "Computers execute billions of operations while you blink once.",
    "The internet carries more words per second than anyone could ever read.",
    "Touch typing can save a programmer hundreds of hours every year.",
    "Open source software is built by strangers typing toward a shared dream.",
    "A single semicolon has ended more programs than any complex bug.",
    "Cloud servers hum in distant buildings so your files feel weightless.",
    "Artificial intelligence learns patterns from mountains of typed text.",
    "The first programmers debugged by reading paper printouts line by line.",
    "Version control remembers every change so mistakes become lessons.",
    "Fast typists think in sentences while slow typists think in letters.",
    "Encryption scrambles your words into puzzles only math can unlock.",
    "Smartphones pack more power than the computers that reached the moon.",
    "Learning to type code fluently is a genuine career superpower.",
  ],
  science: [
    "Light from the sun takes eight minutes to reach your eyes.",
    "Your brain sends signals along nerves at two hundred miles per hour.",
    "Honey never spoils, and pots older than pyramids still taste sweet.",
    "A single drop of water holds more molecules than stars in the sky.",
    "Octopuses have three hearts and can taste with their eight arms.",
    "Muscle memory lets your fingers type what your eyes barely see.",
    "Practice grows myelin around nerves, which literally speeds up thought.",
    "The human hand contains twenty seven bones working in perfect sync.",
    "Bananas share about half their genes with human beings.",
    "Sound travels four times faster through water than through air.",
    "Your heart beats around one hundred thousand times every single day.",
    "Trees communicate through underground fungal networks scientists call the wood wide web.",
    "A day on Venus lasts longer than an entire year on Venus.",
    "Exercise grows new brain cells, especially in the memory center.",
    "Sleep files away everything you practiced into long term memory.",
  ],
  nature: [
    "Morning fog lifts slowly off the quiet green valley below.",
    "Rain drums softly on the roof while the garden drinks deeply.",
    "A river never hurries, yet it always reaches the sea on time.",
    "Snow falls silently, covering the sleeping forest in white.",
    "Wildflowers open toward the sun without ever being told to.",
    "The ocean breathes twice a day through the rhythm of tides.",
    "Birds rehearse their dawn chorus long before the sky turns light.",
    "Mountains stand patient while centuries of weather shape their faces.",
    "A thunderstorm cleans the air and leaves the world smelling new.",
    "Fireflies blink in code that scientists are still decoding today.",
    "Desert nights reveal more stars than most people ever imagine.",
    "Autumn leaves let go gracefully to make room for spring.",
    "Whales sing songs that travel across entire ocean basins.",
    "Moss grows on the north side where the shade lingers longest.",
    "Every snowflake takes a unique path down from the clouds.",
  ],
  history: [
    "The printing press spread ideas faster than any invention before it.",
    "Ancient scribes trained for years just to copy books by hand.",
    "The typewriter gave office workers speed their pens never allowed.",
    "Libraries of the ancient world guarded scrolls like treasure.",
    "Messengers once ran twenty six miles to deliver a single sentence.",
    "The telegraph turned weeks of waiting into minutes of dots and dashes.",
    "Medieval monks illuminated manuscripts with gold and brilliant color.",
    "The first keyboards borrowed their layout from mechanical typewriters.",
    "Newspapers once arrived by train before breakfast every morning.",
    "The QWERTY layout was designed to stop jammed typewriter arms.",
    "Explorers mapped whole continents with only a compass and a journal.",
    "Radio voices crossed oceans decades before television existed.",
    "The moon landing was guided by computers weaker than a greeting card.",
    "Historians piece together vanished lives from fragments of writing.",
    "Every document you type joins the long story of human records.",
  ],
  business: [
    "Clear writing is the hidden engine of every successful company.",
    "Reply to important emails within one business day whenever possible.",
    "A short agenda can rescue a meeting from wasting an entire hour.",
    "Customers remember how fast you respond more than what you say.",
    "Document decisions in writing so nobody has to guess later.",
    "Weekly reviews turn scattered effort into steady forward motion.",
    "The best proposals fit on one page that anyone can understand.",
    "Deadlines create focus, so set them even for personal projects.",
    "Take notes during calls and share a summary within the hour.",
    "A calm, typed message beats a hasty meeting almost every time.",
    "Track your numbers weekly or they will quietly drift away.",
    "Onboarding documents save every new teammate weeks of confusion.",
    "Price your work by value delivered, not by hours spent typing.",
    "Follow up twice, politely, before letting any lead go cold.",
    "Systems beat goals because systems produce results every day.",
  ],
  stories: [
    "Mara found a brass key taped under her keyboard on Monday morning.",
    "The old lighthouse keeper typed the weather log every night at nine.",
    "Somewhere in the library, a book was typing back to its readers.",
    "Jasper trained his parrot to squawk whenever he stopped practicing.",
    "The night train carried a passenger who paid in handwritten poems.",
    "A tiny robot polished each key until the whole keyboard gleamed.",
    "Lena discovered that the attic typewriter wrote by itself at dawn.",
    "The map was hidden inside a paragraph nobody had bothered to read.",
    "Captain Wren navigated by stars and kept her log in perfect prose.",
    "A mysterious email arrived with only five words: keep typing, keep going.",
    "The dragon learned to type with two claws and endless patience.",
    "Nadia raced the storm home, her words arriving just before the rain.",
    "Every midnight the clocks paused to listen to the typist upstairs.",
    "The lost letter finally arrived fifty years late but right on time.",
    "Theo typed the last sentence and the whole room burst into applause.",
  ],
  funfacts: [
    "The average person types around forty words per minute with practice.",
    "Stewardesses is the longest word typed with only the left hand.",
    "The dot over the letters i and j has a name, and it is tittle.",
    "Typewriter is the longest word you can type on the top row alone.",
    "The first email ever sent simply read QWERTYUIOP as a test.",
    "Your fingers travel miles across the keyboard during a long workday.",
    "The space bar is the most pressed key by an enormous margin.",
    "Professional typists rarely look down, trusting rhythm over sight.",
    "The Dvorak layout was patented in nineteen thirty six for speed.",
    "Some court reporters type over two hundred words per minute.",
    "The backspace key was originally called the back spacer.",
    "Typing with all ten fingers can triple your writing speed.",
    "The quick brown fox sentence uses every letter of the alphabet.",
    "Keyboard shortcuts can save the average worker weeks per year.",
    "The underscore key hides behind shift on most modern layouts.",
  ],
  mindfulness: [
    "Breathe in slowly for four counts, then release for six counts.",
    "Notice the weight of your hands resting lightly on the keys.",
    "Type one word at a time and let the rhythm calm your mind.",
    "Between sentences, pause and relax your shoulders completely.",
    "There is no rush here, only the next gentle keystroke.",
    "Feel each key press and release like a small wave settling.",
    "If you make a mistake, smile and continue without judgment.",
    "Your breath sets the tempo, so keep it slow and steady.",
    "Gratitude for this quiet moment improves both mood and speed.",
    "Stretch your fingers wide, then curl them softly like a cat paw.",
    "Eyes soft, jaw loose, wrists floating just above the desk.",
    "Each paragraph finished is a small victory worth noticing.",
    "Let background thoughts pass by like clouds across the sky.",
    "Typing can be meditation when you give it full attention.",
    "Finish this line, take one deep breath, and begin again fresh.",
  ],
};

const CATS = Object.keys(BANK);
export const PARAGRAPH_COUNT = 1050;

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

const TITLES = [
  "Morning Drill", "Steady Flow", "Deep Practice", "Quiet Sprint",
  "Evening Session", "Warm Hands", "Clean Run", "Long Road",
  "Fresh Page", "Calm Keys", "Bright Start", "Slow Burn",
];

export const PARAGRAPHS: Paragraph[] = Array.from({ length: PARAGRAPH_COUNT }, (_, i) => {
  const n = i + 1;
  const rnd = seeded(n * 97 + 13);
  const category = CATS[i % CATS.length];
  const pool = BANK[category];
  const sentenceCount = 3 + Math.floor(rnd() * 3); // 3-5 sentences
  const start = Math.floor(rnd() * pool.length);
  const picked: string[] = [];
  for (let k = 0; k < sentenceCount; k++) picked.push(pool[(start + k * 3) % pool.length]);
  const text = picked.join(" ");
  const level = (Math.min(5, 1 + Math.floor(text.length / 110)) || 1) as Paragraph["level"];
  return {
    id: `para-${n}`,
    index: n,
    title: `${TITLES[i % TITLES.length]} ${n}`,
    category,
    text,
    level,
  };
});

export function getParagraph(n: number): Paragraph {
  return PARAGRAPHS[(n - 1 + PARAGRAPHS.length) % PARAGRAPHS.length];
}

/** Deterministic daily pick (1-based day of year). */
export function paragraphOfTheDay(now = new Date()): Paragraph {
  const start = new Date(now.getFullYear(), 0, 0);
  const day = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return PARAGRAPHS[day % PARAGRAPHS.length];
}

/* ── Random sentence generator ──────────────────────────────────────── */

const ALL_SENTENCES: string[] = Object.values(BANK).flat();

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Returns a unique random text by combining 2-4 sentences from the bank.
 * With 150 base sentences and random selection, this produces millions of
 * unique combinations (150^2 = 22,500 to 150^4 = ~500M unique texts).
 */
export function randomSentence(): string {
  const count = Math.random() < 0.3 ? 2 : Math.random() < 0.6 ? 3 : 4;
  const seen = new Set<string>();
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    let s: string;
    do {
      s = pick(ALL_SENTENCES);
    } while (seen.has(s) && seen.size < ALL_SENTENCES.length);
    seen.add(s);
    parts.push(s);
  }
  return parts.join(" ");
}
