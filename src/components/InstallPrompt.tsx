import { useTranslation } from 'react-i18next'
import { useCalendarStore } from '../lib/store'
import { APP_THEMES } from '../lib/types'
import { usePWAInstall } from '../hooks/usePWAInstall'

/** PWAインストール促しバナー。beforeinstallprompt発火時のみ、ページ最上部（通常フロー）に表示する。 */
export function InstallPrompt() {
  const { t } = useTranslation()
  const settings = useCalendarStore((state) => state.settings)
  const appTheme = APP_THEMES[settings.appTheme]
  const { canInstall, promptInstall, dismiss } = usePWAInstall()

  if (!canInstall) return null

  const handleInstall = async () => {
    const outcome = await promptInstall()
    if (outcome === 'dismissed') {
      dismiss()
    }
  }

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-3 border-b px-2 py-2 text-sm"
      style={{ backgroundColor: appTheme.surface, borderColor: `${appTheme.textMuted}40` }}
    >
      <img src="/icon-192.webp" alt="" width={20} height={20} className="rounded" />
      <span style={{ color: appTheme.text }}>{t('pwaInstall.message')}</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleInstall}
          className="rounded px-3 py-1 text-xs font-bold transition-opacity hover:opacity-80"
          style={{ backgroundColor: appTheme.accent, color: '#ffffff' }}
        >
          {t('pwaInstall.install')}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="rounded border px-3 py-1 text-xs transition-opacity hover:opacity-70"
          style={{ borderColor: appTheme.textMuted, color: appTheme.textMuted }}
        >
          {t('pwaInstall.later')}
        </button>
      </div>
    </div>
  )
}
