import { describe, it, expect } from 'vitest'
import ja from './ja.json'
import en from './en.json'
import zh from './zh.json'
import ko from './ko.json'
import ne from './ne.json'
import th from './th.json'
import vi from './vi.json'
import tl from './tl.json'
import es from './es.json'
import pt from './pt.json'
import fr from './fr.json'

/**
 * Regression coverage for the PWA update overlay's translation key
 * (docs/architecture.md "PWA更新方針", GitHub Issue #43).
 *
 * src/main.tsx renders the overlay message via i18n.t('pwa.updateRestarting').
 * i18next does not fail a build when a key is missing in one locale — it
 * silently falls back (to fallbackLng, or to the raw key path as text), so a
 * translator adding a new locale JSON without the `pwa` block would ship a
 * broken/blank overlay for that language with no test failure elsewhere.
 *
 * Imports the JSON resources directly (not src/lib/i18n/index.ts) so this
 * test doesn't depend on i18next/react-i18next initialization or on
 * navigator.language detection.
 */
describe('pwa.updateRestarting translation key', () => {
  const locales: Record<string, unknown> = { ja, en, zh, ko, ne, th, vi, tl, es, pt, fr }

  it('covers exactly the 11 supported languages (src/lib/i18n/index.ts SUPPORTED_LANGUAGES)', () => {
    expect(Object.keys(locales).sort()).toEqual(
      ['ja', 'en', 'zh', 'ko', 'ne', 'th', 'vi', 'tl', 'es', 'pt', 'fr'].sort()
    )
  })

  it.each(Object.entries(locales))(
    'locale "%s" has a non-empty pwa.updateRestarting string',
    (_code, resource) => {
      const value = (resource as { pwa?: { updateRestarting?: unknown } }).pwa?.updateRestarting
      expect(typeof value).toBe('string')
      expect((value as string).trim().length).toBeGreaterThan(0)
    }
  )
})
