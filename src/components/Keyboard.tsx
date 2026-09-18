"use client";

const ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
];

const FINGER: Record<string, string> = {
  q: "pinky L", a: "pinky L", z: "pinky L",
  w: "ring L", s: "ring L", x: "ring L",
  e: "middle L", d: "middle L", c: "middle L",
  r: "index L", f: "index L", v: "index L",
  t: "index L", g: "index L", b: "index L",
  y: "index R", h: "index R", n: "index R",
  u: "index R", j: "index R", m: "index R",
  i: "middle R", k: "middle R", ",": "middle R",
  o: "ring R", l: "ring R", ".": "ring R",
  p: "pinky R", ";": "pinky R", "/": "pinky R",
  " ": "thumb",
};

export default function Keyboard({ nextChar, accent = "#0aa63f" }: { nextChar: string; accent?: string }) {
  const target = nextChar.toLowerCase();
  return (
    <div>
      <div className="mx-auto max-w-xl rounded-2xl border border-hairline bg-white p-3 shadow-card">
        {ROWS.map((row, ri) => (
          <div key={ri} className="mb-1.5 flex justify-center gap-1.5 last:mb-0" style={{ marginLeft: ri === 1 ? 8 : ri === 2 ? 20 : 0 }}>
            {row.map((k) => {
              const active = k === target;
              return (
                <span
                  key={k}
                  className={`grid h-10 w-10 place-items-center rounded-xl border font-mono text-[15px] font-bold transition-all sm:h-11 sm:w-11 ${
                    active ? "scale-110 text-white border-transparent" : "bg-paper text-ink-soft border-hairline"
                  }`}
                  style={active ? { background: accent } : undefined}
                >
                  {k}
                </span>
              );
            })}
          </div>
        ))}
        <div className="flex justify-center">
          <span
            className={`mt-1.5 h-10 w-64 rounded-xl border font-mono text-[12px] grid place-items-center transition-all ${target === " " ? "text-white border-transparent scale-105" : "bg-paper border-hairline text-muted"}`}
            style={target === " " ? { background: accent } : undefined}
          >
            space
          </span>
        </div>
      </div>
      <p className="mt-2 text-center text-[12.5px] text-muted">
        Finger hint: <span className="font-bold text-ink">{FINGER[target] ?? "read & type"}</span>
        {"  •  "}Keep wrists floating, thumbs hovering over space.
      </p>
    </div>
  );
}
