import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "FullPrep - Premium Coding Dashboard",
  description: "Recreated pixel-perfect FullPrep coding dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-bg-page text-text-primary transition-colors duration-300 antialiased selection:bg-brand-orange/30">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

