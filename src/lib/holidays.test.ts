import { describe, it, expect } from 'vitest'
import { initHolidays, isHoliday, getHolidayName, SUPPORTED_COUNTRIES } from './holidays'

/**
 * Characterization tests for the holiday module.
 *
 * QUIRK PINNED (#39 will likely change this): holidays.ts keeps a
 * module-level mutable singleton `hd`. Until initHolidays(country) is called,
 * `hd` is null, so isHoliday() returns false for EVERY date and
 * getHolidayName() returns null for every date — even real holidays.
 *
 * Because the singleton is module-scoped and Vitest isolates each test file in
 * its own module instance, the "before initialization" assertions below MUST
 * run first (they appear first in this file). Once initHolidays() is called,
 * the singleton is populated for the remainder of this file.
 */
describe('holidays — uninitialized singleton (runs before any initHolidays)', () => {
  it('isHoliday returns false for a real holiday before init', () => {
    // 2025-01-01 is New Year's Day in JP, but no country is initialized yet.
    expect(isHoliday(new Date(2025, 0, 1))).toBe(false)
  })

  it('isHoliday returns false for an ordinary day before init', () => {
    expect(isHoliday(new Date(2025, 5, 15))).toBe(false)
  })

  it('getHolidayName returns null before init', () => {
    expect(getHolidayName(new Date(2025, 0, 1))).toBeNull()
  })
})

describe('holidays — after initHolidays("JP")', () => {
  // From here on the module singleton is initialized to JP.
  it('isHoliday is true for fixed holidays', () => {
    initHolidays('JP')
    expect(isHoliday(new Date(2025, 0, 1))).toBe(true) // 元日
    expect(isHoliday(new Date(2025, 4, 5))).toBe(true) // こどもの日
    expect(isHoliday(new Date(2025, 7, 11))).toBe(true) // 山の日
  })

  it('isHoliday is true for Happy-Monday holidays', () => {
    initHolidays('JP')
    // 成人の日 = 2nd Monday of January (2025-01-13)
    expect(isHoliday(new Date(2025, 0, 13))).toBe(true)
  })

  it('isHoliday is true for substitute holidays (振替休日)', () => {
    initHolidays('JP')
    // 2025-05-06 is the substitute holiday for みどりの日
    expect(isHoliday(new Date(2025, 4, 6))).toBe(true)
    // 2024-02-12 is the substitute holiday for 建国記念の日
    expect(isHoliday(new Date(2024, 1, 12))).toBe(true)
  })

  it('isHoliday is false for an ordinary weekday', () => {
    initHolidays('JP')
    expect(isHoliday(new Date(2025, 5, 15))).toBe(false)
  })

  it('getHolidayName returns a non-empty name for a holiday and null otherwise', () => {
    initHolidays('JP')
    const name = getHolidayName(new Date(2025, 0, 1))
    expect(name).toBeTruthy()
    expect(typeof name).toBe('string')
    expect(getHolidayName(new Date(2025, 5, 15))).toBeNull()
  })

  it('re-initializing the same country keeps holidays working (no-op guard)', () => {
    initHolidays('JP')
    initHolidays('JP')
    expect(isHoliday(new Date(2025, 0, 1))).toBe(true)
  })

  it('switching country changes the holiday set', () => {
    initHolidays('US')
    // 2025-12-25 is flagged by date-holidays for US (Christmas).
    // NOTE: isHoliday() treats ANY non-empty result array as a holiday,
    // including 'optional'/'observance' types — it does not filter by type.
    expect(isHoliday(new Date(2025, 11, 25))).toBe(true)
    // 山の日 (JP-only, 2025-08-11) is not a US holiday.
    expect(isHoliday(new Date(2025, 7, 11))).toBe(false)
  })
})

describe('SUPPORTED_COUNTRIES', () => {
  it('lists 20 countries with code/name/nameEn and JP first', () => {
    expect(SUPPORTED_COUNTRIES).toHaveLength(20)
    expect(SUPPORTED_COUNTRIES[0]).toEqual({ code: 'JP', name: '日本', nameEn: 'Japan' })
    for (const c of SUPPORTED_COUNTRIES) {
      expect(c).toMatchObject({
        code: expect.any(String),
        name: expect.any(String),
        nameEn: expect.any(String),
      })
    }
  })

  it('has unique country codes', () => {
    const codes = SUPPORTED_COUNTRIES.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
  })
})
