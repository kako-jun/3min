import { useState, useCallback } from 'react'
import { useCalendarStore } from '../lib/store'
import { format, getDaysInMonth, isToday } from 'date-fns'

interface DayRowProps {
  date: Date
  text: string
  onTextChange: (date: string, text: string) => void
  onCopy: (text: string) => void
  onPaste: (date: string) => void
}

function DayRow({ date, text, onTextChange, onCopy, onPaste }: DayRowProps) {
  const dayOfWeek = date.getDay()
  const isSunday = dayOfWeek === 0
  const isSaturday = dayOfWeek === 6
  const dateString = format(date, 'yyyy-MM-dd')
  const dayNumber = date.getDate()
  const weekdayName = ['日', '月', '火', '水', '木', '金', '土'][dayOfWeek]

  return (
    <div
      className={`flex items-center gap-2 rounded p-2 ${
        isToday(date) ? 'bg-blue-900/50 ring-1 ring-blue-500' : 'bg-gray-800'
      }`}
    >
      {/* 日付表示 */}
      <div
        className={`w-12 shrink-0 text-center text-sm font-medium ${
          isSunday ? 'text-red-400' : isSaturday ? 'text-blue-400' : 'text-gray-300'
        }`}
      >
        <span className="text-lg">{dayNumber}</span>
        <span className="ml-1 text-xs">({weekdayName})</span>
      </div>

      {/* テキスト入力 */}
      <div className="relative min-w-0 flex-1">
        <input
          type="text"
          value={text}
          onChange={(e) => onTextChange(dateString, e.target.value)}
          className="w-full rounded border border-gray-600 bg-gray-700 py-1 pl-2 pr-7 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
        />
        {text && (
          <button
            onClick={() => onTextChange(dateString, '')}
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded px-1 text-gray-400 hover:text-white"
            title="クリア"
          >
            ✕
          </button>
        )}
      </div>

      {/* コピーボタン */}
      <button
        onClick={() => onCopy(text)}
        className="shrink-0 rounded bg-gray-600 px-2 py-1 text-xs hover:bg-gray-500 active:bg-gray-400"
        title="コピー"
      >
        📋
      </button>

      {/* ペーストボタン */}
      <button
        onClick={() => onPaste(dateString)}
        className="shrink-0 rounded bg-gray-600 px-2 py-1 text-xs hover:bg-gray-500 active:bg-gray-400"
        title="ペースト"
      >
        📥
      </button>
    </div>
  )
}

export function DayEditor() {
  const view = useCalendarStore((state) => state.view)
  const entries = useCalendarStore((state) => state.entries)
  const updateEntry = useCalendarStore((state) => state.updateEntry)
  const [clipboard, setClipboard] = useState('')

  const daysInMonth = getDaysInMonth(new Date(view.year, view.month))

  const getEntryText = useCallback(
    (date: string) => {
      const entry = entries.find((e) => e.date === date)
      return entry?.text ?? ''
    },
    [entries]
  )

  const handleCopy = useCallback((text: string) => {
    setClipboard(text)
    // システムクリップボードにもコピー
    navigator.clipboard.writeText(text).catch(() => {
      // フォールバック：内部クリップボードのみ使用
    })
  }, [])

  const handlePaste = useCallback(
    async (date: string) => {
      try {
        // システムクリップボードから取得を試みる
        const systemClipboard = await navigator.clipboard.readText()
        if (systemClipboard) {
          updateEntry(date, systemClipboard)
          return
        }
      } catch {
        // フォールバック：内部クリップボードを使用
      }
      if (clipboard) {
        updateEntry(date, clipboard)
      }
    },
    [clipboard, updateEntry]
  )

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(view.year, view.month, i + 1)
    const dateString = format(date, 'yyyy-MM-dd')
    return {
      date,
      dateString,
      text: getEntryText(dateString),
    }
  })

  return (
    <div className="space-y-1">
      {days.map(({ date, dateString, text }) => (
        <DayRow
          key={dateString}
          date={date}
          text={text}
          onTextChange={updateEntry}
          onCopy={handleCopy}
          onPaste={handlePaste}
        />
      ))}
    </div>
  )
}
