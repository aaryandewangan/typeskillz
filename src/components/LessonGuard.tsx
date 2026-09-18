"use client";

import { useAuth } from "@/components/AuthProvider";
import SignInGate from "@/components/SignInGate";
import type { Lesson } from "@/lib/lessons";

export default function LessonGuard({
  lesson,
  children,
}: {
  lesson: Lesson;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (!user) {
    return <SignInGate loading={loading}>{children}</SignInGate>;
  }

  return <>{children}</>;
}
