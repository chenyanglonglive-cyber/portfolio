import type { Metadata } from "next";
import "./globals.css";
import TopProgressBar from "@/components/TopProgressBar";
import Navbar from "@/components/Navbar";
import SakuraBackground from "@/components/SakuraBackground";
import Socials from "@/components/Socials";
import LoadingScreen from "@/components/LoadingScreen";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Portfolio | Shiro Style",
  description: "A minimalist portfolio inspired by Shiro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="antialiased selection:bg-accent-pink selection:text-white">
        <LoadingScreen />
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        <SakuraBackground />
        <Navbar />
        <main className="relative z-10 pt-32 pb-32 min-h-screen">
          {children}
        </main>
        <Socials />
      </body>
    </html>
  );
}
