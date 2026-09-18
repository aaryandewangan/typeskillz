import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import FloatingNavbar from "@/components/FloatingNavbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import { UserDataProvider } from "@/components/UserDataProvider";

const display = Inter_Tight({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "TypeSkillz — Learn Touch Typing Faster Than Ever",
  description:
    "The most advanced typing school: 2,395+ lessons, code typing, realtime races, 25 languages, 10 keyboard layouts, and analytics down to the finger.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-paper text-ink antialiased">
        <AuthProvider>
          <UserDataProvider>
            <FloatingNavbar />
            <div className="flex-1 pt-16 pb-28">{children}</div>
            <Footer />
          </UserDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
