"use client";

import { useState, useCallback } from "react";
import FloatingNavbar from "@/components/FloatingNavbar";
import Footer from "@/components/Footer";
import Splash from "@/components/Splash";
import { AuthProvider } from "@/components/AuthProvider";
import { UserDataProvider } from "@/components/UserDataProvider";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [splashDone, setSplashDone] = useState(false);

  const handleSplashComplete = useCallback(() => {
    setSplashDone(true);
  }, []);

  return (
    <AuthProvider>
      <UserDataProvider>
        {!splashDone && <Splash onComplete={handleSplashComplete} />}
        <FloatingNavbar />
        <div className="flex-1 pt-16 pb-28">{children}</div>
        <Footer />
      </UserDataProvider>
    </AuthProvider>
  );
}
