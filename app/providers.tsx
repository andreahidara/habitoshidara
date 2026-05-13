"use client"

import { useEffect, type ComponentProps } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('[SW] Error al registrar el service worker:', err);
      });
    }
  }, []);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
