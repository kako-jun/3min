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
import { SUPPORTED_LANGUAGES } from './index'

const CATALOGS: Record<string, typeof ja> = { ja, en, zh, ko, ne, th, vi, tl, es, pt, fr }

describe('pwaInstall i18n完備', () => {
  it('全SUPPORTED_LANGUAGES分のカタログを検証している', () => {
    expect(Object.keys(CATALOGS).sort()).toEqual([...SUPPORTED_LANGUAGES].sort())
  })

  it.each(['message', 'install', 'later'] as const)(
    'pwaInstall.%s は全対応言語で空でない文言を持つ',
    (key) => {
      for (const [lang, catalog] of Object.entries(CATALOGS)) {
        const value = catalog.pwaInstall?.[key]
        expect(value, `${lang}.pwaInstall.${key} が欠落している`).toBeTypeOf('string')
        expect(value!.length, `${lang}.pwaInstall.${key} が空文字`).toBeGreaterThan(0)
      }
    }
  )
})
