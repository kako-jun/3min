import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGear,
  faXmark,
  faPalette,
  faSun,
  faMoon,
  faLanguage,
  faCalendarWeek,
  faCalendarDay,
  faGlobe,
  faStore,
  faImage,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { useCalendarStore } from '../lib/store'
import { SUPPORTED_COUNTRIES, type CountryCode } from '../lib/holidays'
import { APP_THEMES, type AppTheme } from '../lib/types'
import { processImageFile } from '../lib/image'

const APP_THEME_IDS: AppTheme[] = ['light', 'dark']
const LANGUAGES = ['ja', 'en'] as const

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { t, i18n } = useTranslation()
  const settings = useCalendarStore((state) => state.settings)
  const updateSettings = useCalendarStore((state) => state.updateSettings)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // モーダルが開いている間、背景のスクロールを無効化
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const appTheme = APP_THEMES[settings.appTheme]

  const handleLanguageChange = (lang: 'ja' | 'en') => {
    updateSettings({ language: lang })
  }

  const handleCountryChange = (country: CountryCode) => {
    updateSettings({ country })
  }

  const handleAppThemeChange = (theme: AppTheme) => {
    updateSettings({ appTheme: theme })
  }

  const handleShopNameChange = (shopName: string) => {
    updateSettings({ shopName })
  }

  const handleShowHolidaysChange = (show: boolean) => {
    updateSettings({ showHolidays: show })
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const webpDataUrl = await processImageFile(file)
      updateSettings({ backgroundImage: webpDataUrl })
    } catch (error) {
      console.error('Failed to process image:', error)
    }

    // 同じファイルを再選択できるようにリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = () => {
    updateSettings({ backgroundImage: null })
  }

  const handleOpacityChange = (opacity: number) => {
    updateSettings({ backgroundOpacity: opacity })
  }

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const webpDataUrl = await processImageFile(file)
      updateSettings({ shopLogo: webpDataUrl })
    } catch (error) {
      console.error('Failed to process logo:', error)
    }

    if (logoInputRef.current) {
      logoInputRef.current.value = ''
    }
  }

  const handleRemoveLogo = () => {
    updateSettings({ shopLogo: null })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg p-6"
        style={{ backgroundColor: appTheme.surface, color: appTheme.text }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <FontAwesomeIcon icon={faGear} />
            {t('actions.settings')}
          </h2>
          <button
            onClick={onClose}
            style={{ color: appTheme.textMuted }}
            className="hover:opacity-70"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="space-y-6">
          {/* アプリ設定 */}
          <div className="space-y-3">
            {/* アプリの外観 */}
            <div className="flex items-center justify-between">
              <span
                className="flex items-center gap-2 text-sm"
                style={{ color: appTheme.textMuted }}
              >
                <FontAwesomeIcon icon={faPalette} className="w-4" />
                {t('settings.appTheme')}
              </span>
              <div className="flex gap-2">
                {APP_THEME_IDS.map((themeId) => (
                  <button
                    key={themeId}
                    onClick={() => handleAppThemeChange(themeId)}
                    className={`flex items-center gap-1 rounded px-3 py-1 text-sm transition-colors ${
                      settings.appTheme === themeId ? 'ring-2' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: APP_THEMES[themeId].bg,
                      color: APP_THEMES[themeId].text,
                      // @ts-expect-error CSS custom property for Tailwind ring color
                      '--tw-ring-color': appTheme.accent,
                    }}
                  >
                    <FontAwesomeIcon icon={themeId === 'light' ? faSun : faMoon} />
                    {t(`appThemes.${themeId}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* 言語設定 */}
            <div>
              <label
                className="mb-1 flex items-center gap-2 text-sm"
                style={{ color: appTheme.textMuted }}
              >
                <FontAwesomeIcon icon={faLanguage} className="w-4" />
                {t('settings.language')}
              </label>
              <select
                value={settings.language}
                onChange={(e) => handleLanguageChange(e.target.value as 'ja' | 'en')}
                className="w-full rounded border px-3 py-2"
                style={{
                  backgroundColor: appTheme.bg,
                  borderColor: appTheme.textMuted,
                  color: appTheme.text,
                }}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {t(`languages.${lang}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 区切り線 */}
          <hr style={{ borderColor: appTheme.textMuted, opacity: 0.3 }} />

          {/* カレンダー設定 */}
          <div className="space-y-3">
            {/* 週の開始日 */}
            <div className="flex items-center justify-between">
              <span
                className="flex items-center gap-2 text-sm"
                style={{ color: appTheme.textMuted }}
              >
                <FontAwesomeIcon icon={faCalendarWeek} className="w-4" />
                {t('settings.weekStart')}
              </span>
              <div className="flex items-center gap-2">
                <span
                  style={{
                    color: settings.weekStartsOn === 0 ? appTheme.text : appTheme.textMuted,
                  }}
                >
                  {t('settings.sunday')}
                </span>
                <button
                  onClick={() =>
                    updateSettings({ weekStartsOn: settings.weekStartsOn === 0 ? 1 : 0 })
                  }
                  className="relative h-6 w-11 rounded-full transition-colors"
                  style={{
                    backgroundColor: settings.weekStartsOn === 1 ? appTheme.accent : appTheme.bg,
                  }}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      settings.weekStartsOn === 1 ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span
                  style={{
                    color: settings.weekStartsOn === 1 ? appTheme.text : appTheme.textMuted,
                  }}
                >
                  {t('settings.monday')}
                </span>
              </div>
            </div>

            {/* 祝日表示 */}
            <div className="flex items-center justify-between">
              <span
                className="flex items-center gap-2 text-sm"
                style={{ color: appTheme.textMuted }}
              >
                <FontAwesomeIcon icon={faCalendarDay} className="w-4" />
                {t('settings.showHolidays')}
              </span>
              <button
                onClick={() => handleShowHolidaysChange(!settings.showHolidays)}
                className="relative h-6 w-11 rounded-full transition-colors"
                style={{
                  backgroundColor: settings.showHolidays ? appTheme.accent : appTheme.bg,
                }}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    settings.showHolidays ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 国/地域設定（祝日表示がオンの場合のみ有効） */}
            <div
              className={`transition-opacity ${settings.showHolidays ? '' : 'pointer-events-none opacity-40'}`}
            >
              <label
                className="mb-1 flex items-center gap-2 text-sm"
                style={{ color: appTheme.textMuted }}
              >
                <FontAwesomeIcon icon={faGlobe} className="w-4" />
                {t('settings.country')}
              </label>
              <select
                value={settings.country}
                onChange={(e) => handleCountryChange(e.target.value as CountryCode)}
                disabled={!settings.showHolidays}
                className="w-full rounded border px-3 py-2"
                style={{
                  backgroundColor: appTheme.bg,
                  borderColor: appTheme.textMuted,
                  color: appTheme.text,
                }}
              >
                {SUPPORTED_COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {i18n.language === 'ja' ? country.name : country.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 区切り線 */}
          <hr style={{ borderColor: appTheme.textMuted, opacity: 0.3 }} />

          {/* 表示設定 */}
          <div className="space-y-3">
            {/* 店名設定 */}
            <div>
              <label
                className="mb-1 flex items-center gap-2 text-sm"
                style={{ color: appTheme.textMuted }}
              >
                <FontAwesomeIcon icon={faStore} className="w-4" />
                {t('settings.shopName')}
              </label>
              <input
                type="text"
                value={settings.shopName}
                onChange={(e) => handleShopNameChange(e.target.value)}
                className="w-full rounded border px-3 py-2"
                style={{
                  backgroundColor: appTheme.bg,
                  borderColor: appTheme.textMuted,
                  color: appTheme.text,
                }}
                placeholder={t('settings.shopName')}
              />
            </div>

            {/* 店名ロゴ設定 */}
            <div>
              <label
                className="mb-1 flex items-center gap-2 text-sm"
                style={{ color: appTheme.textMuted }}
              >
                <FontAwesomeIcon icon={faImage} className="w-4" />
                {t('settings.shopLogo')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelect}
                  className="hidden"
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="rounded px-3 py-2 text-sm transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: appTheme.bg,
                    color: appTheme.text,
                    border: `1px solid ${appTheme.textMuted}`,
                  }}
                >
                  {t('settings.selectImage')}
                </button>
                {settings.shopLogo && (
                  <button
                    onClick={handleRemoveLogo}
                    className="flex items-center gap-1 rounded px-3 py-2 text-sm transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    {t('settings.removeImage')}
                  </button>
                )}
              </div>
              {settings.shopLogo && (
                <div className="mt-2">
                  <img
                    src={settings.shopLogo}
                    alt="Logo preview"
                    className="h-16 w-16 rounded object-contain"
                    style={{ border: `1px solid ${appTheme.textMuted}` }}
                  />
                </div>
              )}
            </div>

            {/* 背景画像設定 */}
            <div>
              <label
                className="mb-1 flex items-center gap-2 text-sm"
                style={{ color: appTheme.textMuted }}
              >
                <FontAwesomeIcon icon={faImage} className="w-4" />
                {t('settings.backgroundImage')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded px-3 py-2 text-sm transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: appTheme.bg,
                    color: appTheme.text,
                    border: `1px solid ${appTheme.textMuted}`,
                  }}
                >
                  {t('settings.selectImage')}
                </button>
                {settings.backgroundImage && (
                  <button
                    onClick={handleRemoveImage}
                    className="flex items-center gap-1 rounded px-3 py-2 text-sm transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    {t('settings.removeImage')}
                  </button>
                )}
              </div>
              {settings.backgroundImage && (
                <div className="mt-2">
                  <img
                    src={settings.backgroundImage}
                    alt="Background preview"
                    className="h-16 w-16 rounded object-cover"
                    style={{ border: `1px solid ${appTheme.textMuted}` }}
                  />
                </div>
              )}
            </div>

            {/* 背景の濃さ（画像が設定されている場合のみ有効） */}
            <div
              className={`transition-opacity ${settings.backgroundImage ? '' : 'pointer-events-none opacity-40'}`}
            >
              <label
                className="mb-1 flex items-center gap-2 text-sm"
                style={{ color: appTheme.textMuted }}
              >
                {t('settings.backgroundOpacity')}
              </label>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={settings.backgroundOpacity}
                onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                disabled={!settings.backgroundImage}
                className="w-full"
              />
              <div className="mt-1 text-right text-xs" style={{ color: appTheme.textMuted }}>
                {Math.round(settings.backgroundOpacity * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
