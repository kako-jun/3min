import { useRef } from 'react'
import { useCalendarStore } from '../lib/store'
import { formatYearMonth } from '../lib/calendar'
import { MonthSelector } from './MonthSelector'
import { SettingsBar } from './SettingsBar'
import { CalendarGrid } from './CalendarGrid'
import { DayEditor } from './DayEditor'
import { ActionButtons } from './ActionButtons'

export function Calendar() {
  const view = useCalendarStore((state) => state.view)
  const title = formatYearMonth(view.year, view.month)
  const calendarRef = useRef<HTMLDivElement>(null)

  const filename = `calendar-${view.year}-${String(view.month + 1).padStart(2, '0')}`

  return (
    <div className="mx-auto max-w-6xl p-4">
      <MonthSelector title={title} />
      <div className="mt-2">
        <SettingsBar />
      </div>
      {/* レスポンシブ: モバイルは縦並び、デスクトップは横並び */}
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* カレンダーグリッド + アクションボタン（常にセンタリング） */}
        <div className="flex flex-col items-center gap-4 lg:w-1/2">
          <CalendarGrid ref={calendarRef} />
          <ActionButtons calendarRef={calendarRef} filename={filename} />
        </div>
        {/* 日ごとの編集領域 */}
        <div className="lg:w-1/2">
          <DayEditor />
        </div>
      </div>
    </div>
  )
}
