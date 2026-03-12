import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Macro Dashboard MVP",
  description:
    "Guided self-serve macro dashboard for discovering metrics, building views, and exporting trusted results.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-slate-100 text-slate-950 antialiased`}
      >
        <div className="min-h-screen">
          <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 sm:px-10">
              <div>
                <Link href="/" className="text-lg font-semibold text-slate-950">
                  Macro Dashboard
                </Link>
                <p className="text-sm text-slate-500">
                  Discover, compare, and export curated macro data.
                </p>
              </div>
              <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-700">
                <Link href="/" className="rounded-full px-3 py-2 hover:bg-slate-100">
                  Home
                </Link>
                <Link href="/catalog" className="rounded-full px-3 py-2 hover:bg-slate-100">
                  Catalog
                </Link>
                <Link href="/explore" className="rounded-full px-3 py-2 hover:bg-slate-100">
                  Explore
                </Link>
              </nav>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
