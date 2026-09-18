import Link from "next/link";
import { TOTAL_LESSONS } from "@/lib/lessons";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-hairline bg-white">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-cream text-lg font-black">
                TS
              </span>
              <span className="text-lg font-extrabold tracking-tight">
                TypeSkillz
              </span>
            </div>
            <p className="mt-4 max-w-sm text-[14.5px] leading-6 text-muted">
              The typing school TypingClub wishes it was.{" "}
              {TOTAL_LESSONS.toLocaleString()}+ lessons, 1,050 paragraphs,
              code typing, realtime races, 25 languages, 10 keyboard layouts,
              achievements, and analytics down to the finger.
            </p>
            <div className="mt-5 flex gap-2">
              {["Beginner", "Pro", "Schools", "Kids"].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-hairline bg-paper px-3 py-1.5 text-[12px] font-semibold"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow">{"{ learn }"}</p>
            <ul className="mt-3 space-y-2.5 text-[14.5px] font-medium">
              <li>
                <Link className="hover:underline" href="/learn">
                  All lesson plans
                </Link>
              </li>
              <li>
                <Link className="hover:underline" href="/practice">
                  Free practice
                </Link>
              </li>
              <li>
                <Link className="hover:underline" href="/games">
                  Typing games
                </Link>
              </li>
              <li>
                <Link className="hover:underline" href="/stats">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow">{"{ tracks }"}</p>
            <ul className="mt-3 space-y-2.5 text-[14.5px] font-medium">
              <li>
                <Link className="hover:underline" href="/learn/code-typing">
                  Code typing
                </Link>
              </li>
              <li>
                <Link className="hover:underline" href="/learn/speed-builders">
                  Speed builders
                </Link>
              </li>
              <li>
                <Link className="hover:underline" href="/learn/jungle-junior">
                  Kids jungle
                </Link>
              </li>
              <li>
                <Link className="hover:underline" href="/learn/business-pro">
                  Business pro
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow">{"{ company }"}</p>
            <ul className="mt-3 space-y-2.5 text-[14.5px] font-medium">
              <li>
                <Link className="hover:underline" href="/profile">
                  Your profile
                </Link>
              </li>
              <li>
                <Link className="hover:underline" href="/learn">
                  Schools edition
                </Link>
              </li>
              <li>
                <Link className="hover:underline" href="/practice">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-hairline pt-6 text-[13px] text-muted">
          <span>
            &copy; 2026 TypeSkillz. Type faster, think faster.
          </span>
          <span className="font-mono">
            {"{ wpm up · accuracy up · fun up }"}
          </span>
        </div>
      </div>
    </footer>
  );
}
