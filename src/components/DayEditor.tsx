import { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react'
import { useCalendarStore } from '../lib/store'
import { format, getDaysInMonth } from 'date-fns'
import type { DayEntry } from '../lib/types'
import { serializeEntry, deserializeEntry } from '../lib/entry'
import { DayRow } from './DayRow'

interface DayEditorProps {
  /** リスト下に確保する余白px（コメント入力欄＋マージン分）。Calendar側が実測して渡す。 */
  reserveBottom?: number
}

/** 極端に低いlandscapeでも最低限の行が見える下限。1行≈88pxなので2行強を確保する。 */
const MIN_LIST_HEIGHT = 180

export function DayEditor({ reserveBottom = 0 }: DayEditorProps) {
  const view = useCalendarStore((state) => state.view)
  const getEntry = useCalendarStore((state) => state.getEntry)
  const updateEntry = useCalendarStore((state) => state.updateEntry)
  const selectedDate = useCalendarStore((state) => state.selectedDate)
  const setSelectedDate = useCalendarStore((state) => state.setSelectedDate)
  const [clipboard, setClipboard] = useState<Partial<DayEntry>>({})
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const selectedRowRef = useRef<HTMLDivElement>(null)
  // 表内の操作（行タップ・入力フォーカス等）由来の選択日を記録する。この日付の選択ではスクロールしない（カレンダー由来と区別）
  const skipScrollDateRef = useRef<string | null>(null)
  // 画面下端まで使い切る動的な最大高さ
  const [maxHeight, setMaxHeight] = useState<number>(MIN_LIST_HEIGHT)

  const handleCopy = useCallback((entry: Partial<DayEntry>) => {
    setClipboard(entry)
    navigator.clipboard.writeText(serializeEntry(entry)).catch(() => {})
  }, [])

  // 実際に貼り付けたら true を返す（DayRow のフィードバック表示用）
  const handlePaste = useCallback(
    async (date: string): Promise<boolean> => {
      try {
        const systemClipboard = await navigator.clipboard.readText()
        if (systemClipboard) {
          const parsed = deserializeEntry(systemClipboard)
          if (parsed) {
            updateEntry(date, parsed)
            return true
          }
        }
      } catch {}
      if (Object.keys(clipboard).length > 0) {
        updateEntry(date, clipboard)
        return true
      }
      return false
    },
    [clipboard, updateEntry]
  )

  const handleRowSelect = useCallback(
    (date: string) => {
      skipScrollDateRef.current = date
      setSelectedDate(date)
    },
    [setSelectedDate]
  )

  // 月の全日を生成（唯一のレンダリング対象）
  const allDaysOfMonth = Array.from(
    { length: getDaysInMonth(new Date(view.year, view.month)) },
    (_, i) => {
      const date = new Date(view.year, view.month, i + 1)
      const dateString = format(date, 'yyyy-MM-dd')
      return {
        date,
        dateString,
        entry: getEntry(dateString),
        isSelected: dateString === selectedDate,
      }
    }
  )

  // 動的な最大高さを計算する。
  // maxHeight = ビューポート高さ − リスト上端top − 下に残す余白（コメント欄＋マージン）。
  // window.innerHeight は 100dvh 相当でモバイルのアドレスバー伸縮に追従する。
  useLayoutEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const recalc = () => {
      const top = container.getBoundingClientRect().top
      const available = window.innerHeight - top - reserveBottom
      // 丸めて同値なら React が setState をバイパスする（微小変動での再描画を避ける）
      setMaxHeight(Math.max(MIN_LIST_HEIGHT, Math.round(available)))
    }

    // body 全体を監視するため入力中の文字変化等でも多発する。1フレームに集約して無駄な再計算を防ぐ
    let rafId = 0
    const scheduleRecalc = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = 0
        recalc()
      })
    }

    recalc()
    window.addEventListener('resize', scheduleRecalc)
    window.addEventListener('orientationchange', scheduleRecalc)

    // テーマ変更等でカレンダー高が変わると top も変わるので、レイアウト変化に追従する
    const ro = new ResizeObserver(scheduleRecalc)
    ro.observe(document.body)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('resize', scheduleRecalc)
      window.removeEventListener('orientationchange', scheduleRecalc)
      ro.disconnect()
    }
  }, [reserveBottom])

  // 選択日が変わったとき、カレンダー由来かつ画面外のときだけスクロールして見せる。
  // 表内の操作由来はスクロールしない。
  // フラグは「一度きり」の意味なので、どの経路でも必ず先頭でクリアする。
  useEffect(() => {
    const fromRowTap = skipScrollDateRef.current === selectedDate
    skipScrollDateRef.current = null
    if (!selectedRowRef.current || !scrollContainerRef.current || fromRowTap) return
    const row = selectedRowRef.current
    const container = scrollContainerRef.current
    const rowRect = row.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const fullyVisible = rowRect.top >= containerRect.top && rowRect.bottom <= containerRect.bottom
    if (!fullyVisible) {
      row.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selectedDate])

  return (
    <div
      ref={scrollContainerRef}
      className="flex flex-col gap-1 overflow-y-auto"
      style={{ maxHeight }}
    >
      {allDaysOfMonth.map(({ date, dateString, entry, isSelected }) => (
        <div key={dateString} ref={isSelected ? selectedRowRef : undefined}>
          <DayRow
            date={date}
            entry={entry}
            isSelected={isSelected}
            onUpdate={updateEntry}
            onCopy={handleCopy}
            onPaste={handlePaste}
            onSelect={handleRowSelect}
          />
        </div>
      ))}
    </div>
  )
}
