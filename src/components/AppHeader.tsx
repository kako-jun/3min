import { useTranslation } from 'react-i18next'
import { useCalendarStore } from '../lib/store'
import { APP_THEMES } from '../lib/types'

export function AppHeader() {
  const { t } = useTranslation()
  const settings = useCalendarStore((state) => state.settings)
  const appTheme = APP_THEMES[settings.appTheme]

  return (
    <header className="text-left">
      <h1 className="text-sm font-bold leading-none" style={{ color: appTheme.text }}>
        {t('app.title')}
      </h1>
    </header>
  )
}
