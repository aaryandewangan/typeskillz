// Practice text bank — 1,000+ texts across categories.
// Pulls from the 1,050-paragraph bank + curated extras + generated combos.

import { PARAGRAPHS } from "./paragraphs";

export interface PracticeText {
  id: string;
  name: string;
  text: string;
  category: PracticeCategory;
}

export type PracticeCategory =
  | "paragraph"
  | "code"
  | "business"
  | "tricky-words"
  | "numbers"
  | "beginner"
  | "story"
  | "technology"
  | "science"
  | "nature"
  | "wisdom";

export const CATEGORY_META: Record<PracticeCategory, { label: string; color: string }> = {
  paragraph:    { label: "Paragraphs",     color: "#ff8709" },
  code:         { label: "Code Snippets",  color: "#5f58e8" },
  business:     { label: "Business",       color: "#0aa63f" },
  "tricky-words":{ label: "Tricky Words",  color: "#c026b8" },
  numbers:      { label: "Numbers",        color: "#008fb8" },
  beginner:     { label: "Beginner",       color: "#0aa63f" },
  story:        { label: "Stories",        color: "#5f58e8" },
  technology:   { label: "Technology",     color: "#ff8709" },
  science:      { label: "Science",        color: "#c026b8" },
  nature:       { label: "Nature",         color: "#008fb8" },
  wisdom:       { label: "Wisdom",         color: "#0aa63f" },
};

/* ── Seeded pseudo-random (deterministic) ───────────────────────────── */

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

/* ── Code snippets ──────────────────────────────────────────────────── */

const CODE_TEXTS: { name: string; text: string }[] = [
  { name: "React state", text: "const [wpm, setWpm] = useState(0); useEffect(() => { const t = setInterval(tick, 250); return () => clearInterval(t); }, []);" },
  { name: "Python function", text: "def words_per_minute(chars, seconds): return round((chars / 5) / (seconds / 60))" },
  { name: "JS array map", text: "const results = data.map(item => ({ id: item.id, name: item.name.trim(), score: Math.round(item.score * 100) / 100 }));" },
  { name: "CSS grid", text: "display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; padding: 2rem;" },
  { name: "SQL query", text: "SELECT users.name, COUNT(orders.id) AS order_count FROM users LEFT JOIN orders ON users.id = orders.user_id GROUP BY users.name HAVING order_count > 5;" },
  { name: "TypeScript interface", text: "interface UserProfile { id: string; name: string; email: string; createdAt: Date; settings: { theme: 'light' | 'dark'; language: string; }; }" },
  { name: "Python list comp", text: "squares = [x ** 2 for x in range(100) if x % 3 == 0]; print(f'Found {len(squares)} multiples of 3 with squares')" },
  { name: "React useEffect", text: "useEffect(() => { async function fetchData() { const res = await fetch('/api/data'); const json = await res.json(); setData(json); } fetchData(); }, []);" },
  { name: "JS async/await", text: "async function processItems(items) { const results = []; for (const item of items) { const result = await transform(item); results.push(result); } return results; }" },
  { name: "HTML form", text: "<form action='/api/submit' method='POST'><label for='email'>Email:</label><input type='email' id='email' name='email' required /><button type='submit'>Subscribe</button></form>" },
  { name: "Python class", text: "class TypingEngine: def __init__(self, text): self.text = text; self.position = 0; self.correct = 0; self.incorrect = 0; def press(self, key): ..." },
  { name: "JS destructuring", text: "const { name, email, settings: { theme, language } } = user; console.log(`${name} prefers ${theme} mode in ${language}`);" },
  { name: "CSS flexbox", text: "display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;" },
  { name: "SQL join", text: "SELECT p.title, a.name AS author, p.published_at FROM posts p INNER JOIN authors a ON p.author_id = a.id WHERE p.published_at > '2024-01-01' ORDER BY p.published_at DESC;" },
  { name: "React useCallback", text: "const handleSubmit = useCallback(async (data) => { setLoading(true); try { await saveData(data); router.push('/success'); } catch (e) { setError(e.message); } finally { setLoading(false); } }, []);" },
  { name: "Python decorator", text: "def timer(func): import time; def wrapper(*args, **kwargs): start = time.time(); result = func(*args, **kwargs); print(f'{func.__name__} took {time.time() - start:.2f}s'); return result; return wrapper" },
  { name: "JS promise chain", text: "fetch(url).then(res => res.json()).then(data => data.filter(item => item.active)).then(active => active.map(item => item.id)).catch(err => console.error(err));" },
  { name: "TypeScript generics", text: "function identity<T>(arg: T): T { return arg; } const result = identity<string>('hello'); const num = identity<number>(42);" },
  { name: "CSS animation", text: "@keyframes slideIn { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } } .animate { animation: slideIn 0.3s ease-out; }" },
  { name: "Python lambda", text: "multiply = lambda x, y: x * y; result = multiply(6, 7); numbers = [1, 2, 3, 4, 5]; doubled = list(map(lambda x: x * 2, numbers));" },
  { name: "React context", text: "const ThemeContext = createContext('light'); function ThemeProvider({ children }) { const [theme, setTheme] = useState('light'); return (<ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>); }" },
  { name: "JS try/catch", text: "try { const data = JSON.parse(input); if (!data.id) throw new Error('Missing id field'); await process(data); } catch (e) { console.error('Processing failed:', e.message); }" },
  { name: "SQL subquery", text: "SELECT name, score FROM players WHERE score > (SELECT AVG(score) FROM players WHERE game_id = 42) ORDER BY score DESC LIMIT 10;" },
  { name: "Python dictionary", text: "config = {'debug': True, 'port': 8080, 'host': 'localhost', 'workers': 4}; {**config, 'debug': False} creates a new dict with debug disabled." },
  { name: "JS spread operator", text: "const newArray = [...oldArray, newItem]; const merged = { ...defaults, ...userSettings }; const copy = { ...original, timestamp: Date.now() };" },
  { name: "React useState", text: "const [count, setCount] = useState(0); const increment = () => setCount(prev => prev + 1); const reset = () => setCount(0);" },
  { name: "CSS variables", text: ":root { --primary: #0aa63f; --bg: #fffdf3; --text: #0e100f; } .button { background: var(--primary); color: var(--text); }" },
  { name: "Python for loop", text: "for i, word in enumerate(words): if len(word) > 5: print(f'{i}: {word} has {len(word)} characters'); total += len(word)" },
  { name: "JS reduce", text: "const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0); const grouped = items.reduce((acc, item) => { acc[item.category] = [...(acc[item.category] || []), item]; return acc; }, {});" },
  { name: "React useMemo", text: "const sorted = useMemo(() => items.sort((a, b) => a.name.localeCompare(b.name)), [items]); const filtered = useMemo(() => sorted.filter(i => i.active), [sorted]);" },
  { name: "Python generator", text: "def fibonacci(): a, b = 0, 1; while True: yield a; a, b = b, a + b; gen = fibonacci(); first_ten = [next(gen) for _ in range(10)];" },
  { name: "JS optional chaining", text: "const city = user?.address?.city ?? 'Unknown'; const first = items?.[0]?.name ?? 'No items'; const value = config?.theme?.colors?.primary);" },
  { name: "TypeScript utility", text: "type Readonly<T> = { readonly [K in keyof T]: T[K] }; type Partial<T> = { [K in keyof T]?: T[K] }; type Pick<T, K> = { [P in K]: T[P] };" },
  { name: "Python f-string", text: "name = 'World'; print(f'Hello, {name}!'); pi = 3.14159; print(f'Pi is approximately {pi:.2f}'); items = [1, 2, 3]; print(f'Count: {len(items)}');" },
  { name: "CSS media query", text: "@media (max-width: 768px) { .container { padding: 1rem; } .grid { grid-template-columns: 1fr; } .hide-mobile { display: none; } }" },
  { name: "JS template literal", text: "const greeting = `Hello, ${name}!\\nYour order #${orderId} is ready.\\nTotal: $${total.toFixed(2)}`;" },
  { name: "React useRef", text: "const inputRef = useRef(null); useEffect(() => { inputRef.current?.focus(); }, []); return <input ref={inputRef} />;" },
  { name: "Python walrus", text: "if (n := len(data)) > 10: print(f'Processing {n} items'); results = [y for x in data if (y := transform(x)) is not None];" },
  { name: "JS Object.keys", text: "const keys = Object.keys(form); const values = Object.values(form); const entries = Object.entries(form).filter(([k, v]) => v !== ''); " },
  { name: "TypeScript mapped", text: "type Nullable<T> = { [K in keyof T]: T[K] | null }; type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] };" },
];

/* ── Business texts ─────────────────────────────────────────────────── */

const BIZ_TEXTS: { name: string; text: string }[] = [
  { name: "Project kickoff", text: "Hi team, I am excited to kick off the Q3 planning cycle. Please review the attached roadmap and share your priorities by Friday. We will finalize the sprint plan in Monday's standup." },
  { name: "Meeting follow-up", text: "Thanks for joining today's sync. Action items: Sarah to draft the proposal by Wednesday, Mike to review the budget, and Lisa to schedule the client call for next week." },
  { name: "Client update", text: "Hi Alex, quick update on the project: Phase 1 is complete and Phase 2 kicks off Monday. We are on track for the March deadline. Please let me know if you have any questions." },
  { name: "Invoice reminder", text: "Dear client, this is a friendly reminder that invoice #4821 for $3,250.00 is due on March 15th. Payment can be made via bank transfer or credit card through the portal." },
  { name: "Team standup", text: "Yesterday I completed the API integration and started on the dashboard. Today I will finish the dashboard and begin testing. No blockers at the moment." },
  { name: "Performance review", text: "Hi Jordan, your Q2 performance was excellent. You exceeded your targets by 15% and received positive feedback from three clients. Let us discuss your growth plan in our one-on-one." },
  { name: "New hire welcome", text: "Welcome to the team, Priya! We are thrilled to have you on board. Your onboarding schedule for the first week is attached. Please reach out if you need anything." },
  { name: "Budget proposal", text: "The proposed budget for Q4 is $145,000, covering staffing ($85k), tools ($25k), marketing ($20k), and contingency ($15k). This represents a 12% increase from Q3." },
  { name: "Product launch", text: "We are targeting April 15th for the product launch. Marketing will begin the campaign two weeks prior. Engineering should complete QA by April 1st. Let us sync on Tuesday." },
  { name: "Quarterly report", text: "Q3 highlights: Revenue up 22%, user base grew to 45,000 active users, NPS score improved to 72. Key challenge: reducing churn from 5.2% to under 4% by year end." },
  { name: "Conference prep", text: "Please prepare a 15-minute presentation covering our key metrics, competitive advantages, and roadmap highlights. The audience will be investors and potential partners." },
  { name: "Vendor evaluation", text: "We have received proposals from three vendors. Vendor A offers the best price at $12k/year, Vendor B has the strongest security features, and Vendor C has the fastest support response." },
  { name: "Remote policy", text: "Starting next month, the team will follow a hybrid schedule: Monday and Thursday in-office, Tuesday through Friday remote. Core collaboration hours are 10am to 3pm." },
  { name: "Sprint retrospective", text: "What went well: We shipped the feature on time and the code review process was smooth. What could improve: Better estimation of task complexity and more frequent communication." },
  { name: "Customer feedback", text: "We received 234 survey responses this quarter. Top requested features: dark mode (68%), offline support (52%), and keyboard shortcuts (41%). Overall satisfaction: 4.3 out of 5." },
];

/* ── Tricky words ───────────────────────────────────────────────────── */

const TRICKY_TEXTS: { name: string; text: string }[] = [
  { name: "Double letters", text: "accommodate exaggerate Mississippi mississippi particularly Committee definitely possessed necessary occurrence" },
  { name: "Silent letters", text: "knight psychology pneumonia receipt subconscious through beautiful" },
  { name: "Homophones drill", text: "their there they are its it is to too two write right red read" },
  { name: "Tongue twisters", text: "she sells seashells by the seashore the shells she sells are seashells I am sure" },
  { name: "Common misspellings", text: "separate definitely occurrence accommodate independent beginning consequences recommendation frustrated" },
  { name: "Medical terms", text: "diagnosis pneumonia gastrointestinal cardiovascular arrhythmia anesthesiology orthopedic dermatology ophthalmology" },
  { name: "Legal terms", text: "jurisdiction plaintiff defendant adjudication heretofore notwithstanding pursuant hereinabove aforementioned" },
  { name: "Scientific terms", text: "photosynthesis gastrointestinal microbiome neurotransmitter mitochondria chromosome endoplasmic reticulum" },
  { name: "Rhythm words", text: "rhythm symphony polyrhythm algorithm entrepreneur synchronization kaleidoscope metamorphosis" },
  { name: "I before E", text: "receive perceive conceive deceive ceiling believe achieve wilderness neighbor neither either seizing" },
  { name: "Double consonants", text: "accomplish contain happen kitten mitten button flatten butter matter better letter pattern" },
  { name: "Prefix words", text: "uncomfortable indispensable misinterpret overcompensate underappreciated discombobulated counterproductive" },
  { name: "Suffix words", text: "responsibility acknowledgment entrepreneurship straightforwardness phenomenologically incomprehensibility" },
  { name: "Latin roots", text: "alter ego benevolent contra indica memo reprise status quo vice versa circa et cetera per capita" },
  { name: "French loanwords", text: "boutique crochet debris facade gouache montage naive portfolio prototype reservoir rouge sabotage" },
];

/* ── Numbers ────────────────────────────────────────────────────────── */

const NUM_TEXTS: { name: string; text: string }[] = [
  { name: "Phone numbers", text: "(555) 123-4567 ext. 201 | +1 (800) 555-0199 | Fax: (555) 987-6543 | Mobile: 555.234.5678" },
  { name: "Currency", text: "$1,234.56 €2,345.67 £3,456.78 ¥45,678 ₹567,890 R12,345.67" },
  { name: "Dates & times", text: "March 15, 2024 at 2:30 PM EST | 12/31/2024 11:59:59 PM | 01-01-2025 09:00 AM PST" },
  { name: "Percentages", text: "The discount is 15.5% off the original price of $89.99, bringing it to $76.04. Tax at 8.25% adds $6.27 for a total of $82.31." },
  { name: "Addresses", text: "1234 Elm Street, Apt 5B, Springfield, IL 62704 | 5678 Oak Avenue, Suite 200, Portland, OR 97201" },
  { name: "Financial data", text: "Q3 revenue: $4,567,890 | Expenses: $2,345,678 | Net profit: $2,222,212 | YoY growth: 23.4%" },
  { name: "Measurements", text: "The room is 12ft 6in by 14ft 3in, totaling approximately 178.5 square feet. The ceiling height is 9ft 2in." },
  { name: "Scientific notation", text: "Speed of light: 2.998 x 10^8 m/s | Avogadro: 6.022 x 10^23 | Planck: 6.626 x 10^-34 J*s" },
  { name: "Order numbers", text: "Order #88412: 36 units @ $49.99, total $1,799.64 (415) 555-0199 ext. 3301 by 5:30pm!" },
  { name: "Statistics", text: "Population: 331,002,651 | Area: 3,796,742 sq mi | GDP: $21.43 trillion | Median age: 38.5 years" },
  { name: "IP addresses", text: "Server at 192.168.1.100 port 8080 | DNS: 8.8.8.8 and 8.8.4.4 | Gateway: 10.0.0.1 | Subnet: 255.255.255.0" },
  { name: "Hex codes", text: "Primary: #0aa63f | Background: #fffdf3 | Text: #0e100f | Accent: #ff8709 | Border: #e7e1cb" },
  { name: "Receipt", text: "Item 1: $12.99 x 3 = $38.97 | Item 2: $24.50 x 2 = $49.00 | Subtotal: $87.97 | Tax (8%): $7.04 | Total: $95.01" },
  { name: "Time zones", text: "EST (UTC-5) | CST (UTC-6) | MST (UTC-7) | PST (UTC-8) | GMT (UTC+0) | IST (UTC+5:30) | JST (UTC+9)" },
  { name: "Passwords", text: "Use at least 12 characters with uppercase, lowercase, numbers, and symbols. Example: Kx9#mP2$wL5@nQ8!" },
];

/* ── Beginner sentences ─────────────────────────────────────────────── */

const BEGINNER_TEXTS: { name: string; text: string }[] = [
  { name: "The cat", text: "The cat sat on the mat." },
  { name: "Quick fox", text: "The quick brown fox jumps over the lazy dog." },
  { name: "Hello world", text: "Hello world this is a typing test." },
  { name: "Simple sentence", text: "I like to type fast on my keyboard." },
  { name: "Short words", text: "the and for are but not you all any can had her was one our out day has how its may now old see way" },
  { name: "Common words", text: "about after again against being below between both but from have into over same some that their them then there these they this those under will with" },
  { name: "Home row", text: "asdf jkl asdf jkl ask sad flask half fall hall jazz all" },
  { name: "Top row", text: "qwer tyui op qwer tyui op quite write your type water power tower" },
  { name: "Bottom row", text: "zxcv bnm zxcv bnm mix box fox zip zap zoom move cave brave voice" },
  { name: "Two letter words", text: "go do if is it me my no of on so to up an as at by he in on or us we am" },
  { name: "Three letter words", text: "the and for are but not you all any can had her was one our out day has how its may now old see way who boy did get let say she too use" },
  { name: "Four letter words", text: "that with have this will your from they been said each which their time about would make like just than look more come could people very when what then them would other which their time about" },
  { name: "Days of week", text: "Monday Tuesday Wednesday Thursday Friday Saturday Sunday" },
  { name: "Months", text: "January February March April May June July August September October November December" },
  { name: "Colors", text: "red orange yellow green blue indigo violet black white gray brown pink purple gold silver bronze" },
  { name: "Shapes", text: "circle square triangle rectangle oval diamond hexagon octagon star heart crescent" },
  { name: "Fruits", text: "apple banana cherry date elderberry fig grape honeydew kiwi lemon mango nectarine orange papaya" },
  { name: "Animals", text: "ant bear cat dog elephant fox giraffe hedgehog iguana jaguar koala lemur mongoose newt owl penguin" },
  { name: "Numbers one to twenty", text: "one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty" },
  { name: "Musical notes", text: "do re mi fa sol la ti do re mi fa sol la ti" },
];

/* ── Combine all curated ────────────────────────────────────────────── */

const CURATED: { name: string; text: string; category: PracticeCategory }[] = [
  ...CODE_TEXTS.map((t) => ({ ...t, category: "code" as PracticeCategory })),
  ...BIZ_TEXTS.map((t) => ({ ...t, category: "business" as PracticeCategory })),
  ...TRICKY_TEXTS.map((t) => ({ ...t, category: "tricky-words" as PracticeCategory })),
  ...NUM_TEXTS.map((t) => ({ ...t, category: "numbers" as PracticeCategory })),
  ...BEGINNER_TEXTS.map((t) => ({ ...t, category: "beginner" as PracticeCategory })),
];

/* ── Build the full list: paragraphs + curated + generated combos ───── */

const PARA_MAP: Record<string, PracticeCategory> = {
  wisdom: "wisdom",
  focus: "story",
  technology: "technology",
  science: "science",
  nature: "nature",
  history: "wisdom",
  business: "business",
  stories: "story",
  funfacts: "paragraph",
  mindfulness: "paragraph",
};

// 1. All 1,050 paragraphs
const PARA_TEXTS: PracticeText[] = PARAGRAPHS.map((p, i) => ({
  id: `practice-${i + 1}`,
  name: p.title,
  text: p.text,
  category: PARA_MAP[p.category] ?? "paragraph",
}));

// 2. Curated extras (offset from paragraphs)
const CURATED_TEXTS: PracticeText[] = CURATED.map((t, i) => ({
  id: `practice-${PARA_TEXTS.length + i + 1}`,
  name: t.name,
  text: t.text,
  category: t.category,
}));

// 3. Generate 200 random sentence combos from the paragraph bank
const ALL_SENTENCES = PARAGRAPHS.flatMap((p) =>
  p.text.split(". ").map((s) => s.trim()).filter((s) => s.length > 15 && s.length < 200)
);

function seededPick(rnd: () => number, arr: string[], exclude: Set<string>): string {
  let s: string;
  let attempts = 0;
  do {
    s = arr[Math.floor(rnd() * arr.length)];
    attempts++;
  } while (exclude.has(s) && attempts < 20);
  return s;
}

const COMBO_TEXTS: PracticeText[] = Array.from({ length: 200 }, (_, i) => {
  const rnd = seeded((i + 1) * 7919);
  const count = 2 + Math.floor(rnd() * 3); // 2-4 sentences
  const used = new Set<string>();
  const parts: string[] = [];
  for (let k = 0; k < count; k++) {
    const s = seededPick(rnd, ALL_SENTENCES, used);
    used.add(s);
    parts.push(s);
  }
  const cats: PracticeCategory[] = ["wisdom", "story", "technology", "science", "nature"];
  return {
    id: `practice-${PARA_TEXTS.length + CURATED_TEXTS.length + i + 1}`,
    name: `Mixed ${i + 1}`,
    text: parts.join(". ") + ".",
    category: cats[Math.floor(rnd() * cats.length)],
  };
});

/* ── Export ──────────────────────────────────────────────────────────── */

export const PRACTICE_TEXTS: PracticeText[] = [
  ...PARA_TEXTS,
  ...CURATED_TEXTS,
  ...COMBO_TEXTS,
];

export const PRACTICE_TOTAL = PRACTICE_TEXTS.length;

export const PRACTICE_CATEGORIES: PracticeCategory[] = [
  "paragraph", "code", "business", "tricky-words", "numbers", "beginner",
  "story", "technology", "science", "nature", "wisdom",
];
