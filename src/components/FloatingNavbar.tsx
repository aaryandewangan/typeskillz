"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useMotionValue, type MotionValue } from "framer-motion";
import {
  BookOpen,
  Keyboard,
  Gamepad2,
  BarChart3,
  User,
  Search,
  Zap,
  Flame,
  Trophy,
  ArrowRight,
  LogIn,
  LogOut,
  Settings,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { searchLessons, TOTAL_LESSONS } from "@/lib/lessons";
import { useAuth } from "./AuthProvider";
import { useUserData } from "@/lib/useUserData";
import AuthModal from "./AuthModal";

const DOCK_ITEMS = [
  { href: "/learn", label: "Learn", icon: BookOpen, color: "#0aa63f" },
  { href: "/practice", label: "Practice", icon: Keyboard, color: "#ff8709" },
  { href: "/games", label: "Games", icon: Gamepad2, color: "#c026b8" },
  { href: "/stats", label: "Stats", icon: BarChart3, color: "#5f58e8" },
  { href: "/profile", label: "Profile", icon: User, color: "#008fb8" },
];

/* ── DockIcon ───────────────────────────────────────────────────────── */

function DockIcon({
  item,
  mouseX,
  active,
}: {
  item: (typeof DOCK_ITEMS)[number];
  mouseX: MotionValue<number>;
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <div style={{ width: 44 }} className="relative flex items-center justify-center">
      <Link
        href={item.href}
        className={`relative flex h-[44px] w-[44px] items-center justify-center rounded-2xl transition-all duration-200 ${
          active
            ? "text-white scale-110"
            : "text-ink-soft hover:text-ink hover:scale-110"
        }`}
        style={active ? { background: item.color } : undefined}
        title={item.label}
      >
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
        {active && (
          <motion.span
            layoutId="dock-dot"
            className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
            style={{ background: item.color }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
        )}
      </Link>
    </div>
  );
}

/* ── Command Palette ────────────────────────────────────────────────── */

function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchLessons(query, 8), [query]);
  const router = useRouter();

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
    else setQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      className="absolute bottom-full left-1/2 mb-3 w-[min(520px,92vw)] -translate-x-1/2 overflow-hidden rounded-3xl border border-hairline bg-white/95 shadow-float backdrop-blur-2xl"
    >
      <div className="flex items-center gap-3 border-b border-hairline px-5 py-3.5">
        <Search size={18} className="text-muted shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results.length > 0) {
              router.push(`/lesson/${results[0].id}`);
              onClose();
            }
          }}
          placeholder="Search 2,395+ lessons..."
          className="flex-1 bg-transparent text-[15px] font-medium outline-none placeholder:text-muted"
        />
        <kbd className="rounded-lg border border-hairline bg-paper px-2 py-0.5 font-mono text-[11px] font-bold text-muted">
          ESC
        </kbd>
      </div>
      {query.trim() !== "" && (
        <div className="max-h-[340px] overflow-y-auto p-2">
          {results.map((l) => (
            <Link
              key={l.id}
              href={`/lesson/${l.id}`}
              onClick={onClose}
              className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-[14px] hover:bg-paper transition-colors"
            >
              <span className="truncate">
                <b className="font-bold">{l.title}</b>
                <span className="ml-2 text-muted">
                  {l.trackId} · {l.targetWpm} WPM
                </span>
              </span>
              <ArrowRight size={14} className="text-muted shrink-0" />
            </Link>
          ))}
          {results.length === 0 && (
            <p className="px-4 py-6 text-center text-[14px] text-muted">
              No matches found.
            </p>
          )}
        </div>
      )}
      {query.trim() === "" && (
        <div className="px-5 py-4">
          <p className="text-[12px] font-bold tracking-widest text-muted mb-2">
            QUICK LINKS
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              "home-row-1",
              "speed-builders-1",
              "code-typing-1",
              "jungle-junior-1",
              "paragraph-marathon-1",
              "accuracy-lab-1",
            ].map((id) => (
              <Link
                key={id}
                href={`/lesson/${id}`}
                onClick={onClose}
                className="rounded-full border border-hairline bg-paper px-3 py-1.5 text-[12.5px] font-bold hover:bg-nested transition-colors"
              >
                {id.replace(/-\d+$/, "").replace(/-/g, " ")}
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ── Main Dock ──────────────────────────────────────────────────────── */

export default function FloatingNavbar() {
  const pathname = usePathname();
  const mouseX = useMotionValue(Infinity);
  const { user, signOut } = useAuth();
  const { profile, streak, level, loading } = useUserData();
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ae = document.activeElement as HTMLElement | null;
      const typing = ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA");
      if (e.key === "/" && !typing && !searchOpen) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  const isActive = useCallback(
    (href: string) =>
      pathname === href || pathname?.startsWith(href + "/"),
    [pathname]
  );

  return (
    <>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      {/* ── top bar ── */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-sm font-black text-cream transition-transform group-hover:-rotate-3">
              TS
            </span>
            <span className="text-[15px] font-extrabold tracking-tight hidden sm:block">
              TypeSkillz
            </span>
            <span className="ml-1 hidden rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-extrabold text-brand sm:block">
              {TOTAL_LESSONS.toLocaleString()}+
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-full border border-hairline bg-white/80 px-3.5 py-2 text-[13px] font-bold text-muted backdrop-blur-sm hover:border-ink hover:text-ink transition-all"
            >
              <Search size={14} />
              <span className="hidden sm:inline">Search</span>
              <kbd className="rounded-md border border-hairline bg-paper px-1.5 py-0.5 font-mono text-[10px]">
                /
              </kbd>
            </button>

            {/* streak + level — only when signed in */}
            {user && !loading && (
              <>
                <span className="flex items-center gap-1 rounded-full border border-hairline bg-white/80 px-3 py-2 text-[12.5px] font-extrabold backdrop-blur-sm">
                  <Flame size={13} className="text-tang" /> {streak.count}
                </span>
                <Link
                  href="/stats"
                  className="flex items-center gap-1 rounded-full bg-ink px-3 py-2 text-[12.5px] font-extrabold text-cream"
                >
                  <Trophy size={13} /> Lv {level}
                </Link>
              </>
            )}

            {/* auth button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-brand-soft text-[14px] font-bold text-brand hover:ring-2 hover:ring-brand/30 transition-all"
                >
                  {profile.name?.[0]?.toUpperCase() ?? user.displayName?.[0] ?? user.email?.[0] ?? "U"}
                </button>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 z-50 w-52 overflow-hidden rounded-2xl border border-hairline bg-white shadow-float">
                      <div className="border-b border-hairline px-4 py-3">
                        <p className="text-[13px] font-bold truncate">
                          {profile.name || "User"}
                        </p>
                        <p className="text-[12px] text-muted truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-[13.5px] font-bold hover:bg-paper"
                      >
                        <Settings size={14} /> Profile
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setUserMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-[13.5px] font-bold text-rose hover:bg-rose-soft"
                      >
                        <LogOut size={14} /> Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="flex items-center gap-1.5 rounded-full border border-hairline bg-white/80 px-3.5 py-2 text-[13px] font-bold backdrop-blur-sm hover:border-ink transition-all"
              >
                <LogIn size={14} /> Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── floating dock ── */}
      <nav className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
        <div
          onMouseLeave={() => mouseX.set(Infinity)}
          className="flex items-end gap-1 rounded-[28px] border border-hairline/80 bg-white/90 px-3 py-2.5 shadow-float backdrop-blur-2xl relative"
        >
          <CommandPalette
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
          />

          {DOCK_ITEMS.map((item) => (
            <DockIcon
              key={item.href}
              item={item}
              mouseX={mouseX}
              active={isActive(item.href)}
            />
          ))}

          <div className="mx-1 h-8 w-px bg-hairline" />

          <div style={{ width: 44 }} className="flex items-center justify-center">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="flex h-[44px] w-[44px] items-center justify-center rounded-2xl text-ink-soft hover:text-ink transition-all hover:scale-110"
              title="Search"
            >
              <Search size={18} />
            </button>
          </div>

          <Link
            href="/lesson/home-row-1"
            className="flex items-center gap-2 rounded-2xl bg-brand px-4 py-2.5 text-[13px] font-extrabold text-white hover:brightness-110 transition-all ml-1"
          >
            <Zap size={14} />
            <span className="hidden sm:inline">Start</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
