import { useCalendarStore } from '../lib/store'
import { APP_THEMES } from '../lib/types'

interface MonthSelectorProps {
  title: string
}

// 令和元年5月（2019年5月）が下限
const MIN_YEAR = 2019
const MIN_MONTH = 4 // 0-indexed

export function MonthSelector({ title }: MonthSelectorProps) {
  const view = useCalendarStore((state) => state.view)
  const goToPrevMonth = useCalendarStore((state) => state.goToPrevMonth)
  const goToNextMonth = useCalendarStore((state) => state.goToNextMonth)
  const settings = useCalendarStore((state) => state.settings)
  const appTheme = APP_THEMES[settings.appTheme]

  // 下限に達しているかチェック
  const isAtMinMonth = view.year === MIN_YEAR && view.month <= MIN_MONTH

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={goToPrevMonth}
        disabled={isAtMinMonth}
        className="px-1 text-lg transition-opacity hover:opacity-70 disabled:opacity-30"
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
