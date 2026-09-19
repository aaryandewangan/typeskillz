"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, ArrowRight, Loader2, Check, AlertCircle } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { claimUsername, isUsernameAvailable, createProfile } from "@/lib/firebase-store";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultMode?: "login" | "signup";
}

export default function AuthModal({
  open,
  onClose,
  defaultMode = "login",
}: AuthModalProps) {
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Debounced username check
  useEffect(() => {
    const normalized = username.toLowerCase().trim();
    if (normalized.length < 3) {
      setUsernameStatus(normalized.length === 0 ? "idle" : "invalid");
      return;
    }
    if (!/^[a-z0-9_]+$/.test(normalized)) {
      setUsernameStatus("invalid");
      return;
    }
    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      const avail = await isUsernameAvailable(normalized);
      setUsernameStatus(avail ? "available" : "taken");
    }, 400);
    return () => clearTimeout(timer);
  }, [username]);

  const resetForm = useCallback(() => {
    setEmail("");
    setPassword("");
    setUsername("");
    setUsernameStatus("idle");
    setError("");
  }, []);

  // Auto-claim username for Google sign-in users
  useEffect(() => {
    if (!user) return;
    // Check if user already has a username
    const checkUsername = async () => {
      const { getUsername } = await import("@/lib/firebase-store");
      const existing = await getUsername(user.uid);
      if (!existing) {
        // No username yet — prompt them (for Google sign-in users)
        // We'll handle this in a future onboarding flow
      }
    };
    checkUsername();
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
      } else {
        // Validate username
        const normalized = username.toLowerCase().trim();
        if (normalized.length < 3 || normalized.length > 20) {
          setError("Username must be 3-20 characters.");
          setLoading(false);
          return;
        }
        if (!/^[a-z0-9_]+$/.test(normalized)) {
          setError("Username can only contain letters, numbers, and underscores.");
          setLoading(false);
          return;
        }
        const avail = await isUsernameAvailable(normalized);
        if (!avail) {
          setError("That username is taken.");
          setLoading(false);
          return;
        }

        // Create Firebase auth account
        const cred = await signUpWithEmail(email, password);

        // Claim username and create profile
        await claimUsername(cred.user.uid, normalized);
        await createProfile(cred.user.uid, {
          displayName: normalized,
          email,
          goal: 60,
          layout: "qwerty",
        });
      }
      resetForm();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg.includes("auth/") ? msg.split("auth/")[1].replace(/-/g, " ") : msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithGoogle();
      const { getUsername } = await import("@/lib/firebase-store");
      const existing = await getUsername(cred.user.uid);
      if (!existing) {
        const baseName = cred.user.email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_]/g, "") ?? "player";
        let username = baseName;
        if (username.length < 3) username = username + "pro";
        let claimed = await claimUsername(cred.user.uid, username);
        if (!claimed) {
          for (let i = 1; i <= 99; i++) {
            const attempt = `${baseName}${i}`;
            if (attempt.length >= 3 && await claimUsername(cred.user.uid, attempt)) {
              username = attempt;
              claimed = true;
              break;
            }
          }
        }
        if (!claimed) username = cred.user.uid.slice(0, 8);
        await createProfile(cred.user.uid, {
          displayName: username,
          email: cred.user.email ?? "",
          goal: 60,
          layout: "qwerty",
        });
      }
      resetForm();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      setError(msg.includes("auth/") ? msg.split("auth/")[1].replace(/-/g, " ") : msg);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  const usernameHint =
    usernameStatus === "checking" ? "Checking availability…" :
    usernameStatus === "available" ? "Username is available!" :
    usernameStatus === "taken" ? "Username is taken." :
    usernameStatus === "invalid" ? "3-20 chars, letters, numbers, _ only." :
    "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-hairline bg-white shadow-float"
          >
            <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
              <div>
                <h2 className="text-xl font-extrabold">
                  {mode === "login" ? "Welcome back" : "Create account"}
                </h2>
                <p className="text-[13px] text-muted">
                  {mode === "login"
                    ? "Sign in to sync your progress"
                    : "Pick a unique username to get started"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-full border border-hairline text-muted hover:text-ink transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5">
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-hairline bg-paper px-4 py-3.5 text-[14.5px] font-bold hover:bg-nested transition-colors disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-hairline" />
                <span className="text-[12px] font-bold text-muted">OR</span>
                <div className="h-px flex-1 bg-hairline" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === "signup" && (
                  <div>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                      <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                        placeholder="Choose a username"
                        maxLength={20}
                        required
                        className={`w-full rounded-2xl border bg-paper pl-10 pr-10 py-3 text-[14.5px] font-medium outline-none ${
                          usernameStatus === "available"
                            ? "border-brand focus:border-brand"
                            : usernameStatus === "taken" || usernameStatus === "invalid"
                              ? "border-rose focus:border-rose"
                              : "border-hairline focus:border-ink"
                        }`}
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {usernameStatus === "checking" && <Loader2 size={14} className="animate-spin text-muted" />}
                        {usernameStatus === "available" && <Check size={14} className="text-brand" />}
                        {(usernameStatus === "taken" || usernameStatus === "invalid") && <AlertCircle size={14} className="text-rose" />}
                      </span>
                    </div>
                    {usernameHint && (
                      <p className={`mt-1 text-[12px] font-medium ${
                        usernameStatus === "available" ? "text-brand" :
                        usernameStatus === "taken" || usernameStatus === "invalid" ? "text-rose" : "text-muted"
                      }`}>
                        {usernameHint}
                      </p>
                    )}
                  </div>
                )}
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    required
                    className="w-full rounded-2xl border border-hairline bg-paper pl-10 pr-4 py-3 text-[14.5px] font-medium outline-none focus:border-ink"
                  />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    minLength={6}
                    className="w-full rounded-2xl border border-hairline bg-paper pl-10 pr-4 py-3 text-[14.5px] font-medium outline-none focus:border-ink"
                  />
                </div>

                {error && (
                  <p className="text-[13px] text-rose font-medium">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || (mode === "signup" && usernameStatus !== "available")}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3.5 text-[14.5px] font-bold text-cream hover:bg-black transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      {mode === "login" ? "Sign in" : "Create account"} <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="border-t border-hairline px-6 py-3.5 text-center text-[13px] text-muted">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button onClick={() => { setMode("signup"); resetForm(); }} className="font-bold text-ink hover:underline">
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button onClick={() => { setMode("login"); resetForm(); }} className="font-bold text-ink hover:underline">
                    Sign in
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
