import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FullPrep - Crack Placements. Master DSA. Build Real Skills.",
  description: "FullPrep helps you learn, practice, and master Data Structures and Algorithms with AI-powered hints, contests, and real-time progress tracking.",
  keywords: ["DSA", "Data Structures", "Algorithms", "Interview Prep", "Coding Contests", "AI Hints", "LeetCode", "Placement Prep"],
  appleWebApp: {
    title: "FullPrep",
  },
  icons: {
    icon: [
      { url: "/favicon-96x96.png?v=7", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg?v=7", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico?v=7",
    apple: "/apple-touch-icon.png?v=7",
  },
  manifest: "/site.webmanifest?v=7",
};

export default function RootLayout({
  children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${outfit.variable} ${jetbrainsMono.variable} antialiased`}>
      <body className="min-h-screen bg-[#FAFAFA] bg-[linear-gradient(to_right,#0f172a04_1px,transparent_1px),linear-gradient(to_bottom,#0f172a04_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-[#050816] dark:bg-none text-[#0F172A] dark:text-gray-100 transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
