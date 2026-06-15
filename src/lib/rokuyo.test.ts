import { describe, it, expect } from 'vitest'
import { getRokuyo, getRokuyoName } from './rokuyo'

/**
 * Characterization tests for the 六曜 (rokuyo) calculation.
 *
 * IMPORTANT: rokuyo.ts uses a SIMPLIFIED lunar-calendar approximation
 * (a fixed base date 2000-01-06 + average synodic-month floor division).
 * It is NOT astronomically accurate. These tests pin the CURRENT output
 * of that simplified algorithm as a golden master; they do not assert what
 * the "true" rokuyo for a date is. If the algorithm is ever corrected,
 * these expectations are expected to change.
 *
 * Quirk pinned: the base date 2000-01-06 (lunar 12月1日) maps to index
 * (12 + 1) % 6 === 1 === 友引 ("tomobiki"), not 先勝. So the base date is
 * NOT the start of the rokuyo cycle in this implementation.
 */
describe('getRokuyo (simplified golden master)', () => {
  it('returns one of the six valid rokuyo entries with consistent shape', () => {
    const r = getRokuyo(new Date(2025, 5, 15))
    expect(r).toMatchObject({
      type: expect.any(String),
      name: expect.any(String),
      shortName: expect.any(String),
    })
    expect(['sensho', 'tomobiki', 'senbu', 'butsumetsu', 'taian', 'shakko']).toContain(r.type)
  })

  // Pinned golden-master outputs (derived by executing the current algorithm).
  it.each([
    ['base date 2000-01-06 -> 友引 (quirk: not 先勝)', new Date(2000, 0, 6), 'tomobiki', '友引'],
    ['2000-01-07', new Date(2000, 0, 7), 'senbu', '先負'],
    ['2025-01-01', new Date(2025, 0, 1), 'tomobiki', '友引'],
    ['2025-06-15', new Date(2025, 5, 15), 'shakko', '赤口'],
    ['leap day 2024-02-29', new Date(2024, 1, 29), 'tomobiki', '友引'],
    ['before base 1999-12-31', new Date(1999, 11, 31), 'sensho', '先勝'],
    ['synodic boundary 2000-02-05', new Date(2000, 1, 5), 'butsumetsu', '仏滅'],
  ])('%s', (_label, date, expectedType, expectedShort) => {
    const r = getRokuyo(date as Date)
    expect(r.type).toBe(expectedType)
    expect(r.shortName).toBe(expectedShort)
  })

  it('is stable for the same date (deterministic, ignores time of day)', () => {
    const a = getRokuyo(new Date(2025, 5, 15, 0, 0, 0))
    const b = getRokuyo(new Date(2025, 5, 15, 23, 59, 59))
    expect(a.type).toBe(b.type)
  })
})

describe('getRokuyoName', () => {
  it('returns the shortName of getRokuyo for the same date', () => {
    const date = new Date(2025, 0, 1)
    expect(getRokuyoName(date)).toBe(getRokuyo(date).shortName)
    expect(getRokuyoName(date)).toBe('友引')
  })
})
