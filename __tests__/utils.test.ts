import { describe, it, expect } from 'vitest'
import { calculateStreak } from '../lib/utils'
import { startOfDay, subDays, format } from 'date-fns'

function dateStr(daysAgo: number, base = new Date()): string {
  return format(subDays(startOfDay(base), daysAgo), 'yyyy-MM-dd')
}

describe('calculateStreak', () => {
  it('returns 0 when no dates', () => {
    expect(calculateStreak(new Set())).toBe(0)
  })

  it('returns 1 when only today is completed', () => {
    const today = new Set([dateStr(0)])
    expect(calculateStreak(today)).toBe(1)
  })

  it('counts consecutive days back from today', () => {
    const dates = new Set([dateStr(0), dateStr(1), dateStr(2)])
    expect(calculateStreak(dates)).toBe(3)
  })

  it('stops at a gap', () => {
    // today + 2 days ago (gap at day 1)
    const dates = new Set([dateStr(0), dateStr(2)])
    expect(calculateStreak(dates)).toBe(1)
  })

  it('returns 0 when only yesterday is completed (no today)', () => {
    const dates = new Set([dateStr(1), dateStr(2)])
    expect(calculateStreak(dates)).toBe(0)
  })

  it('handles a long streak correctly', () => {
    const dates = new Set(Array.from({ length: 30 }, (_, i) => dateStr(i)))
    expect(calculateStreak(dates)).toBe(30)
  })

  it('ignores future dates', () => {
    const tomorrow = format(subDays(startOfDay(new Date()), -1), 'yyyy-MM-dd')
    const dates = new Set([tomorrow, dateStr(0)])
    expect(calculateStreak(dates)).toBe(1)
  })

  it('uses the provided today argument instead of current date', () => {
    const fakeToday = new Date('2024-03-15T12:00:00')
    const dates = new Set(['2024-03-15', '2024-03-14', '2024-03-13'])
    expect(calculateStreak(dates, fakeToday)).toBe(3)
  })

  it('is not affected by timezone parsing of date strings', () => {
    // Regression: new Date('2024-01-01') parses as UTC midnight which is
    // the previous day in negative-offset timezones. calculateStreak must
    // use startOfDay(today) to stay in local time.
    const fakeToday = new Date('2024-01-01T10:00:00') // local noon, safe
    const dates = new Set(['2024-01-01', '2023-12-31'])
    expect(calculateStreak(dates, fakeToday)).toBe(2)
  })
})
