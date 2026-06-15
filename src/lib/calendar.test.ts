import { describe, it, expect } from 'vitest'
import { getCalendarDays, getWeekdayHeaders, getYearMonthParams, isSameDayUtil } from './calendar'

/**
 * Characterization tests for the calendar grid builder.
 *
 * getCalendarDays(year, month0Based, weekStartsOn) returns full weeks
 * (date-fns startOfWeek..endOfWeek over the month), so the grid spills into
 * the previous/next month. Grids are 35 or 42 cells depending on alignment.
 */
describe('getCalendarDays', () => {
  it('builds full weeks aligned to weekStartsOn=0 (Sunday) for Jan 2025', () => {
    const days = getCalendarDays(2025, 0, 0)
    expect(days).toHaveLength(35)
    expect(days[0]!.dateString).toBe('2024-12-29') // first cell = prev month
    expect(days[0]!.date.getDay()).toBe(0) // Sunday
    expect(days[days.length - 1]!.dateString).toBe('2025-02-01')
    expect(days[days.length - 1]!.date.getDay()).toBe(6) // Saturday
    // 31 days in January belong to the current month
    expect(days.filter((d) => d.isCurrentMonth)).toHaveLength(31)
  })

  it('aligns to weekStartsOn=1 (Monday)', () => {
    const days = getCalendarDays(2025, 0, 1)
    expect(days).toHaveLength(35)
    expect(days[0]!.dateString).toBe('2024-12-30')
    expect(days[0]!.date.getDay()).toBe(1) // Monday
    expect(days[days.length - 1]!.date.getDay()).toBe(0) // Sunday
  })

  it('handles a leap February (Feb 2024 has 29 current-month days)', () => {
    const days = getCalendarDays(2024, 1, 0)
    expect(days).toHaveLength(35)
    expect(days.filter((d) => d.isCurrentMonth)).toHaveLength(29)
  })

  it('handles a non-leap February (Feb 2025 has 28 current-month days)', () => {
    const days = getCalendarDays(2025, 1, 0)
    expect(days.filter((d) => d.isCurrentMonth)).toHaveLength(28)
  })

  it('produces a 42-cell grid when the month needs six weeks (June 2025, Monday start)', () => {
    const days = getCalendarDays(2025, 5, 1)
    expect(days).toHaveLength(42)
    expect(days[0]!.dateString).toBe('2025-05-26')
    expect(days[days.length - 1]!.dateString).toBe('2025-07-06')
    expect(days.filter((d) => d.isCurrentMonth)).toHaveLength(30)
  })

  it('produces a 35-cell grid for June 2025 with Sunday start (no overflow week)', () => {
    const days = getCalendarDays(2025, 5, 0)
    expect(days).toHaveLength(35)
    expect(days[0]!.dateString).toBe('2025-06-01')
  })

  it('defaults to weekStartsOn=0 when omitted', () => {
    expect(getCalendarDays(2025, 0)).toEqual(getCalendarDays(2025, 0, 0))
  })

  it('exposes the right shape per cell (day number + dateString)', () => {
    const days = getCalendarDays(2025, 0, 0)
    const jan1 = days.find((d) => d.dateString === '2025-01-01')!
    expect(jan1.day).toBe(1)
    expect(jan1.isCurrentMonth).toBe(true)
    expect(typeof jan1.isToday).toBe('boolean')
  })
})

describe('getWeekdayHeaders', () => {
  it('returns Sunday-first order by default', () => {
    const h = getWeekdayHeaders(0)
    expect(h.map((x) => x.dayOfWeek)).toEqual([0, 1, 2, 3, 4, 5, 6])
    expect(h[0]!.labelKey).toBe('weekdays.sun')
  })

  it('rotates Sunday to the end for Monday start', () => {
    const h = getWeekdayHeaders(1)
    expect(h.map((x) => x.dayOfWeek)).toEqual([1, 2, 3, 4, 5, 6, 0])
    expect(h[0]!.labelKey).toBe('weekdays.mon')
    expect(h[6]!.labelKey).toBe('weekdays.sun')
  })

  it('defaults to Sunday-first', () => {
    expect(getWeekdayHeaders()).toEqual(getWeekdayHeaders(0))
  })
})

describe('getYearMonthParams', () => {
  it('converts the 0-based month to 1-based for display', () => {
    expect(getYearMonthParams(2025, 0)).toEqual({ year: 2025, month: 1 })
    expect(getYearMonthParams(2025, 11)).toEqual({ year: 2025, month: 12 })
  })
})

describe('isSameDayUtil', () => {
  it('is true for the same calendar day regardless of time', () => {
    expect(isSameDayUtil(new Date(2025, 5, 15, 1, 0), new Date(2025, 5, 15, 23, 0))).toBe(true)
  })

  it('is false for different days', () => {
    expect(isSameDayUtil(new Date(2025, 5, 15), new Date(2025, 5, 16))).toBe(false)
  })
})
