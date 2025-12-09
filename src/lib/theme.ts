import { THEMES, type ThemeId, type ThemeColors } from './types'

/**
 * テーマIDからテーマカラーを取得
 */
export function getTheme(themeId: ThemeId): ThemeColors {
  return THEMES[themeId]
}

/**
 * CSS変数としてテーマを適用
 */
export function applyThemeToDocument(themeId: ThemeId): void {
  const theme = getTheme(themeId)
  const root = document.documentElement
  root.style.setProperty('--color-bg', theme.bg)
  root.style.setProperty('--color-surface', theme.surface)
  root.style.setProperty('--color-text', theme.text)
  root.style.setProperty('--color-text-muted', theme.textMuted)
  root.style.setProperty('--color-accent', theme.accent)
  root.style.setProperty('--color-sunday', theme.sunday)
  root.style.setProperty('--color-saturday', theme.saturday)
  root.style.setProperty('--color-holiday', theme.holiday)
}

/**
 * テーマ名の翻訳キー
 */
export const THEME_NAMES: Record<ThemeId, string> = {
  // 明るい系
  light: 'calendarThemes.light',
  'light-red': 'calendarThemes.light-red',
  'light-orange': 'calendarThemes.light-orange',
  'light-yellow': 'calendarThemes.light-yellow',
  'light-green': 'calendarThemes.light-green',
  'light-blue': 'calendarThemes.light-blue',
  'light-purple': 'calendarThemes.light-purple',
  // 暗い系
  dark: 'calendarThemes.dark',
  'dark-red': 'calendarThemes.dark-red',
  'dark-orange': 'calendarThemes.dark-orange',
  'dark-yellow': 'calendarThemes.dark-yellow',
  'dark-green': 'calendarThemes.dark-green',
  'dark-blue': 'calendarThemes.dark-blue',
  'dark-purple': 'calendarThemes.dark-purple',
}
