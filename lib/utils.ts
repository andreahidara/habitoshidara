import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, subDays, startOfDay, parseISO, differenceInCalendarDays } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateStreak(completedDates: Set<string>, today: Date = new Date()): number {
  let streak = 0
  let cursor = startOfDay(today)
  while (completedDates.has(format(cursor, 'yyyy-MM-dd'))) {
    streak++
    cursor = subDays(cursor, 1)
  }
  return streak
}

export function calculateBestStreak(completedDates: Set<string>): number {
  if (completedDates.size === 0) return 0
  const sorted = Array.from(completedDates).sort()
  let best = 1, current = 1
  for (let i = 1; i < sorted.length; i++) {
    const diff = differenceInCalendarDays(parseISO(sorted[i]), parseISO(sorted[i - 1]))
    if (diff === 1) {
      current++
      if (current > best) best = current
    } else {
      current = 1
    }
  }
  return best
}
