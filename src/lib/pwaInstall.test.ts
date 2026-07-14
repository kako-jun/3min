import { describe, it, expect } from 'vitest'
import { isInstallPromptSuppressed, PWA_INSTALL_DISMISS_DURATION_MS } from './pwaInstall'

describe('isInstallPromptSuppressed', () => {
  it('returns false when never dismissed (dismissedAt is null)', () => {
    expect(isInstallPromptSuppressed(null, Date.now())).toBe(false)
  })

  it('returns true immediately after dismissal', () => {
    const now = 1_700_000_000_000
    expect(isInstallPromptSuppressed(now, now)).toBe(true)
  })

  it('returns true just before the 7-day suppression window elapses', () => {
    const now = 1_700_000_000_000
    const dismissedAt = now - (PWA_INSTALL_DISMISS_DURATION_MS - 1)
    expect(isInstallPromptSuppressed(dismissedAt, now)).toBe(true)
  })

  it('returns false exactly at the 7-day boundary', () => {
    const now = 1_700_000_000_000
    const dismissedAt = now - PWA_INSTALL_DISMISS_DURATION_MS
    expect(isInstallPromptSuppressed(dismissedAt, now)).toBe(false)
  })

  it('returns false well after the 7-day window has passed', () => {
    const now = 1_700_000_000_000
    const dismissedAt = now - PWA_INSTALL_DISMISS_DURATION_MS * 2
    expect(isInstallPromptSuppressed(dismissedAt, now)).toBe(false)
  })
})
