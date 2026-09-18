"use client";

import { useState } from "react";
import { LogIn, Lock } from "lucide-react";
import AuthModal from "./AuthModal";

interface SignInGateProps {
  children: React.ReactNode;
  loading?: boolean;
}

export default function SignInGate({ children, loading = false }: SignInGateProps) {
  const [authOpen, setAuthOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-hairline border-t-brand" />
      </div>
    );
  }

  return (
    <>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <div className="relative">
        {children}
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[24px] bg-paper/80 backdrop-blur-sm">
          <div className="text-center p-8">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-ink/5 mb-4">
              <Lock size={24} className="text-muted" />
            </div>
            <h3 className="text-xl font-extrabold">Sign in required</h3>
            <p className="mt-1 text-[14px] text-muted max-w-xs mx-auto">
              Create a free account to track your progress, streaks, achievements, and stats across devices.
            </p>
            <button
              onClick={() => setAuthOpen(true)}
              className="mt-4 pill-btn flex items-center gap-2 mx-auto bg-ink text-cream px-6 py-3 text-[14px] font-bold"
            >
              <LogIn size={16} /> Sign in to continue
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
