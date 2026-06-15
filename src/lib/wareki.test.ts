import { describe, it, expect } from 'vitest'
import { getWareki, getWarekiYear, getWarekiFullYear } from './wareki'

/**
 * Characterization tests for 和暦 (Japanese era) conversion.
 *
 * The era year is computed as: date.getFullYear() - era.startYear + 1.
 * This is CALENDAR-year based, not anniversary based — so the era year
 * increments on Jan 1, regardless of the era's start month/day. The first
 * (year === 1) year is rendered as "元年" (gannen). Dates before 明治
 * 1868-01-25 fall through to a plain Western-year representation.
 */
describe('getWareki — era boundaries', () => {
  it.each([
    // 令和: starts 2019-05-01
    ['令和 day 1 (2019-05-01)', new Date(2019, 4, 1), '令和', 1, '令和元年'],
    ['day before 令和 (2019-04-30) is still 平成', new Date(2019, 3, 30), '平成', 31, '平成31年'],
    ['令和元年 end (2019-12-31)', new Date(2019, 11, 31), '令和', 1, '令和元年'],
    ['令和2 starts on Jan 1 (2020-01-01)', new Date(2020, 0, 1), '令和', 2, '令和2年'],
    ['2025-06-15 -> 令和7', new Date(2025, 5, 15), '令和', 7, '令和7年'],
    // 平成: starts 1989-01-08
    ['平成 day 1 (1989-01-08)', new Date(1989, 0, 8), '平成', 1, '平成元年'],
    ['day before 平成 (1989-01-07) is 昭和64', new Date(1989, 0, 7), '昭和', 64, '昭和64年'],
    // 昭和: starts 1926-12-25
    ['昭和 day 1 (1926-12-25)', new Date(1926, 11, 25), '昭和', 1, '昭和元年'],
    ['day before 昭和 (1926-12-24) is 大正15', new Date(1926, 11, 24), '大正', 15, '大正15年'],
    // 大正: starts 1912-07-30
    ['大正 day 1 (1912-07-30)', new Date(1912, 6, 30), '大正', 1, '大正元年'],
    // 明治: starts 1868-01-25
    ['明治 day 1 (1868-01-25)', new Date(1868, 0, 25), '明治', 1, '明治元年'],
  ])('%s', (_label, date, era, year, full) => {
    const w = getWareki(date as Date)
    expect(w.era).toBe(era)
    expect(w.year).toBe(year)
    expect(w.fullName).toBe(full)
  })

  it('pre-明治 dates fall through to the plain Western year', () => {
    expect(getWareki(new Date(1868, 0, 24))).toEqual({
      era: '',
      year: 1868,
      fullName: '1868年',
    })
    expect(getWareki(new Date(1800, 5, 1))).toEqual({
      era: '',
      year: 1800,
      fullName: '1800年',
    })
  })
})

describe('getWarekiYear', () => {
  it.each([
    ['令和元 (2019-05-01)', new Date(2019, 4, 1), '令和元'],
    ['令和7 (2025-06-15)', new Date(2025, 5, 15), '令和7'],
    ['平成元 (1989-01-08)', new Date(1989, 0, 8), '平成元'],
  ])('%s', (_label, date, expected) => {
    expect(getWarekiYear(date as Date)).toBe(expected)
  })

  it('renders pre-明治 dates as the bare year string (no era prefix)', () => {
    expect(getWarekiYear(new Date(1800, 5, 1))).toBe('1800')
  })
})

describe('getWarekiFullYear', () => {
  it('matches getWareki().fullName', () => {
    const date = new Date(2025, 5, 15)
    expect(getWarekiFullYear(date)).toBe(getWareki(date).fullName)
    expect(getWarekiFullYear(date)).toBe('令和7年')
  })
})
