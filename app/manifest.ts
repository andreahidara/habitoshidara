import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mi Habit Tracker",
    short_name: "Habits",
    description: "Tu centro personal de hábitos, tareas y bienestar diario.",
    start_url: "/",
    display: "standalone",
    background_color: "#e9e0d8",
    theme_color: "#3a5a40",
    orientation: "portrait",
    lang: "es",
    categories: ["health", "lifestyle", "productivity"],
    icons: [
      // SVG fallback (modern browsers)
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      // PNG icons required for Android install prompt and maskable
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
