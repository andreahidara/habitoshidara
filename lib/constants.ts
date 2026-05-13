export const MOODS = [
  { emoji: "😫", label: "Agotado" },
  { emoji: "😔", label: "Triste" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "🙂", label: "Bien" },
  { emoji: "😀", label: "Excelente" },
] as const;

export type MoodEmoji = typeof MOODS[number]["emoji"];

export function moodToLevel(mood: string): 0 | 1 | 2 | 3 | 4 {
  switch (mood) {
    case "😫": return 1;
    case "😔": return 2;
    case "😐": return 3;
    case "🙂": return 3;
    case "😀": return 4;
    default:   return 0;
  }
}
