import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AppearanceProvider } from "@/providers/AppearanceProvider";
import { SessionProvider } from "@/providers/SessionProvider";
import ToastNotification from "@/components/ui/ToastNotification";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "FullPrep - Premium Coding Platform",
  description: "The ultimate platform for coding interviews and competitive programming. Practice problems, get AI-powered hints, and track your progress.",
  openGraph: {
    title: "FullPrep - Premium Coding Platform",
    description: "The ultimate platform for coding interviews and competitive programming. Practice problems, get AI-powered hints, and track your progress.",
    url: "/",
    siteName: "FullPrep",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FullPrep Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FullPrep - Premium Coding Platform",
    description: "The ultimate platform for coding interviews and competitive programming. Practice problems, get AI-powered hints, and track your progress.",
    images: ["/og-image.png"],
  },
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
  manifest: "/site.webmanifest",
};

export const viewport = {
  themeColor: "#050816",
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
          <AppearanceProvider>
            <SessionProvider>
              {children}
              <ToastNotification />
            </SessionProvider>
          </AppearanceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

