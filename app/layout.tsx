import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mi-habit-tracker.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Mi Habit Tracker",
    template: "%s | Mi Habit Tracker",
  },
  description:
    "Tu centro personal de hábitos, tareas y bienestar diario. Registra, visualiza y mejora tus rutinas con un tracker sencillo y motivador.",
  keywords: [
    "habit tracker",
    "hábitos",
    "productividad",
    "bienestar",
    "rutinas",
    "tareas diarias",
    "seguimiento de hábitos",
  ],
  authors: [{ name: "andreahidara" }],
  creator: "andreahidara",
  manifest: "/manifest.json",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: APP_URL,
    siteName: "Mi Habit Tracker",
    title: "Mi Habit Tracker",
    description:
      "Tu centro personal de hábitos, tareas y bienestar diario. Registra, visualiza y mejora tus rutinas.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mi Habit Tracker — preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mi Habit Tracker",
    description:
      "Tu centro personal de hábitos, tareas y bienestar diario.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3a5a40" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f0a" },
  ],
};

import { ThemeProvider } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
