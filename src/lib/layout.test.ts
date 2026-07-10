import { describe, it, expect } from 'vitest'
import { computeDayEditorMaxHeight } from './layout'

/**
 * Characterization tests for computeDayEditorMaxHeight (GitHub Issue #41).
 *
 * Regression coverage: the old implementation was
 * `Math.max(minListHeight, Math.round(available))`, which clamped ANY
 * available value below minListHeight up to minListHeight — even when
 * available was still positive. On narrow mobile viewports this pushed the
 * comment box (reserveBottom) off-screen. The fix only falls back to
 * minListHeight when available is <= 0; otherwise it uses available as-is.
 */
describe('computeDayEditorMaxHeight', () => {
  const MIN = 180

  it('falls back to minListHeight when available is negative', () => {
    expect(computeDayEditorMaxHeight(-50, MIN)).toBe(180)
  })

  it('falls back to minListHeight when available is exactly 0 (boundary: > vs >=)', () => {
    expect(computeDayEditorMaxHeight(0, MIN)).toBe(180)
  })

  it('falls back to minListHeight when available rounds to 0 (0 < available < 1, subpixel value)', () => {
    // Guards against checking `available > 0` on the pre-rounded value: 0.3 > 0 is
    // true, but Math.round(0.3) is 0, which must still fall back to minListHeight
    // instead of returning maxHeight: 0.
    expect(computeDayEditorMaxHeight(0.3, MIN)).toBe(180)
  })

  it('uses available as-is just above the zero boundary (available=1)', () => {
    expect(computeDayEditorMaxHeight(1, MIN)).toBe(1)
  })

  it('uses available just below minListHeight (available=179, old impl would give 180)', () => {
    expect(computeDayEditorMaxHeight(179, MIN)).toBe(179)
  })

  it('uses available exactly at minListHeight (old and new implementations agree)', () => {
    expect(computeDayEditorMaxHeight(180, MIN)).toBe(180)
  })

  it('uses available just above minListHeight (available=181)', () => {
    expect(computeDayEditorMaxHeight(181, MIN)).toBe(181)
  })

  it('scales to large available values (available=1000)', () => {
    expect(computeDayEditorMaxHeight(1000, MIN)).toBe(1000)
  })

  it('rounds a fractional available value (available=799.6 -> 800)', () => {
    expect(computeDayEditorMaxHeight(799.6, MIN)).toBe(800)
  })

  it.each([
    ['negative', -50, 180],
    ['zero', 0, 180],
    ['positive below MIN', 100, 100],
    ['positive at MIN', 180, 180],
    ['positive above MIN', 300, 300],
  ])('decision table: %s available=%d -> %d', (_label, available, expected) => {
    expect(computeDayEditorMaxHeight(available, MIN)).toBe(expected)
  })
})
