import { Link } from 'react-router-dom'
import { useCalendarStore } from '../lib/store'
import { APP_THEMES } from '../lib/types'

export function NotFound() {
  const settings = useCalendarStore((state) => state.settings)
  const appTheme = APP_THEMES[settings.appTheme]

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4"
      style={{ backgroundColor: appTheme.bg, color: appTheme.text }}
    >
      <h1 className="text-6xl font-bold" style={{ color: appTheme.textMuted }}>
        404
      </h1>
      <p className="text-lg" style={{ color: appTheme.textMuted }}>
        Page not found
      </p>
      <Link
        to="/calendar"
        className="mt-4 rounded px-6 py-2 text-white transition-opacity hover:opacity-80"
        style={{ backgroundColor: appTheme.accent }}
      >
        Go to Calendar
      </Link>
    </div>
  )
}
