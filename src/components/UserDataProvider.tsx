"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useUserData as useUserDataHook, type Profile, type TypingResult, type StreakData } from "@/lib/useUserData";

interface UserDataContextType {
  user: import("firebase/auth").User | null;
  profile: Profile;
  results: TypingResult[];
  streak: StreakData;
  achievements: string[];
  stats: {
    avgWpm: number;
    bestWpm: number;
    avgAcc: number;
    sessions: number;
    timeMin: number;
    xp: number;
  };
  level: number;
  completedIds: Set<string>;
  loading: boolean;
  synced: boolean;
  saveProfile: (p: Profile) => Promise<void>;
  saveResult: (r: TypingResult) => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | null>(null);

export function useUserData() {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error("useUserData must be used within UserDataProvider");
  return ctx;
}

export function UserDataProvider({ children }: { children: ReactNode }) {
  const data = useUserDataHook();
  return (
    <UserDataContext.Provider value={data}>
      {children}
    </UserDataContext.Provider>
  );
}
