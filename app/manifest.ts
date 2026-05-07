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
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
