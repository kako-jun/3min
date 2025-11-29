import { useCalendarStore } from '../lib/store'

interface MonthSelectorProps {
  title: string
}

export function MonthSelector({ title }: MonthSelectorProps) {
  const goToPrevMonth = useCalendarStore((state) => state.goToPrevMonth)
  const goToNextMonth = useCalendarStore((state) => state.goToNextMonth)
  const goToToday = useCalendarStore((state) => state.goToToday)

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={goToPrevMonth}
        className="rounded px-4 py-2 text-2xl hover:bg-gray-700"
        aria-label="前月"
      >
        ◀
      </button>

      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <button
          onClick={goToToday}
          className="rounded bg-gray-700 px-3 py-1 text-sm hover:bg-gray-600"
        >
          今日
        </button>
      </div>

      <button
        onClick={goToNextMonth}
        className="rounded px-4 py-2 text-2xl hover:bg-gray-700"
        aria-label="翌月"
      >
        ▶
      </button>
    </div>
  )
}
