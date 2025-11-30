import { useCalendarStore } from '../lib/store'
import { APP_THEMES } from '../lib/types'

interface MonthSelectorProps {
  title: string
}

export function MonthSelector({ title }: MonthSelectorProps) {
  const goToPrevMonth = useCalendarStore((state) => state.goToPrevMonth)
  const goToNextMonth = useCalendarStore((state) => state.goToNextMonth)
  const settings = useCalendarStore((state) => state.settings)
  const appTheme = APP_THEMES[settings.appTheme]

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={goToPrevMonth}
        className="px-1 text-lg transition-opacity hover:opacity-70"
        style={{ color: appTheme.text }}
        aria-label="前月"
      >
        ◀
      </button>

      <h1 className="text-lg font-bold" style={{ color: appTheme.text }}>
        {title}
      </h1>

      <button
        onClick={goToNextMonth}
        className="px-1 text-lg transition-opacity hover:opacity-70"
        style={{ color: appTheme.text }}
        aria-label="翌月"
      >
        ▶
      </button>
    </div>
  )
}
