import { forwardRef } from 'react'
import { useCalendarStore } from '../lib/store'
import { getCalendarDays, getWeekdayHeaders, formatYearMonth } from '../lib/calendar'

export const CalendarGrid = forwardRef<HTMLDivElement>(function CalendarGrid(_, ref) {
  const view = useCalendarStore((state) => state.view)
  const settings = useCalendarStore((state) => state.settings)
  const entries = useCalendarStore((state) => state.entries)

  const days = getCalendarDays(view.year, view.month, settings.weekStartsOn)
  const weekdays = getWeekdayHeaders(settings.weekStartsOn)
  const title = formatYearMonth(view.year, view.month)

  const getEntryText = (date: string) => {
    const entry = entries.find((e) => e.date === date)
    return entry?.text ?? ''
  }

  return (
    <div ref={ref} className="aspect-square w-full max-w-[500px] rounded-lg bg-gray-800 p-3">
      {/* タイトル */}
      <div className="mb-2 text-center text-lg font-bold text-white">{title}</div>

      {/* 曜日ヘッダー */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {weekdays.map((day) => (
          <div
            key={day.dayOfWeek}
            className={`py-1 text-center text-xs font-semibold ${
              day.dayOfWeek === 0
                ? 'text-red-400'
                : day.dayOfWeek === 6
                  ? 'text-blue-400'
                  : 'text-gray-400'
            }`}
          >
            {day.label}
          </div>
        ))}
      </div>

      {/* 日付グリッド（6行7列、正方形セル） */}
      <div className="grid flex-1 grid-cols-7 grid-rows-6 gap-1">
        {days.map((day) => {
          const dayOfWeek = day.date.getDay()
          const isSunday = dayOfWeek === 0
          const isSaturday = dayOfWeek === 6
          const text = getEntryText(day.dateString)

          return (
            <div
              key={day.dateString}
              className={`aspect-square overflow-hidden rounded p-1 ${
                day.isCurrentMonth ? 'bg-gray-700' : 'bg-gray-800/50'
              } ${day.isToday ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div
                className={`text-right text-[11px] leading-tight ${
                  !day.isCurrentMonth
                    ? 'text-gray-500'
                    : isSunday
                      ? 'text-red-400'
                      : isSaturday
                        ? 'text-blue-400'
                        : 'text-gray-200'
                } ${day.isToday ? 'font-bold' : ''}`}
              >
                {day.day}
              </div>
              {text && (
                <div
                  className="mt-0.5 truncate text-[10px] leading-tight text-gray-300"
                  title={text}
                >
                  {text}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
})
