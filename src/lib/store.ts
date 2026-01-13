import { create } from 'zustand'
import i18n from './i18n'
import type { DayEntry, CalendarState, Settings, CalendarThemeId, GridStyle } from './types'
import { defaultSettings } from './types'
import {
  loadEntries,
  loadSettings,
  loadCalendarComments,
  loadCalendarThemes,
  loadCalendarGridStyles,
  saveEntry,
  saveSettings,
  saveCalendarComments,
  saveCalendarThemes,
  saveCalendarGridStyles,
  StorageError,
} from './storage'
import { initHolidays } from './holidays'

interface CalendarActions {
  // 初期化
  initialize: () => Promise<void>
  initError: string | null

  // 表示制御
  setView: (year: number, month: number) => void
  goToPrevMonth: () => void
  goToNextMonth: () => void
  goToToday: () => void

  // 選択日
  setSelectedDate: (date: string | null) => void

  // エントリ操作
  updateEntry: (date: string, updates: Partial<Omit<DayEntry, 'date'>>) => Promise<void>
  getEntry: (date: string) => DayEntry | undefined
  getEntryText: (date: string) => string

  // 先月からコピー
  copyFromPreviousMonth: () => Promise<void>

  // 設定
  updateSettings: (settings: Partial<Settings>) => Promise<void>

  // カレンダーコメント
  getCalendarComment: (year: number, month: number) => string
  updateCalendarComment: (year: number, month: number, comment: string) => Promise<void>

  // カレンダーテーマ
  getCalendarTheme: (year: number, month: number) => CalendarThemeId
  updateCalendarTheme: (year: number, month: number, theme: CalendarThemeId) => Promise<void>

  // カレンダーグリッドスタイル
  getCalendarGridStyle: (year: number, month: number) => GridStyle
  updateCalendarGridStyle: (year: number, month: number, gridStyle: GridStyle) => Promise<void>
}

const now = new Date()

export const useCalendarStore = create<
  CalendarState & CalendarActions & { selectedDate: string | null }
>((set, get) => ({
  // 初期状態
  view: {
    year: now.getFullYear(),
    month: now.getMonth(),
  },
  entries: [],
  calendarComments: {},
  calendarThemes: {},
  calendarGridStyles: {},
  settings: defaultSettings,
  initialized: false,
  selectedDate: null,
  initError: null,

  // 初期化
  initialize: async () => {
    if (get().initialized) return

    try {
      const [entries, calendarComments, calendarThemes, calendarGridStyles, settings] =
        await Promise.all([
          loadEntries(),
          loadCalendarComments(),
          loadCalendarThemes(),
          loadCalendarGridStyles(),
          loadSettings(),
        ])

      // データの整合性チェック - 有効なデータのみ使用
      const validEntries = Array.isArray(entries) ? entries : []
      const validCalendarComments =
        calendarComments && typeof calendarComments === 'object' ? calendarComments : {}
      const validCalendarThemes =
        calendarThemes && typeof calendarThemes === 'object' ? calendarThemes : {}
      const validCalendarGridStyles =
        calendarGridStyles && typeof calendarGridStyles === 'object' ? calendarGridStyles : {}
      const validSettings = settings && typeof settings === 'object' ? settings : defaultSettings

      // 言語を設定
      i18n.changeLanguage(validSettings.language)

      // 祝日ライブラリを初期化
      initHolidays(validSettings.country)

      set({
        entries: validEntries,
        calendarComments: validCalendarComments,
        calendarThemes: validCalendarThemes,
        calendarGridStyles: validCalendarGridStyles,
        settings: validSettings,
        initialized: true,
        initError: null,
      })

      console.log(`Storage loaded: ${validEntries.length} entries`)
    } catch (error) {
      console.error('Failed to initialize storage:', error)

      // StorageErrorの場合はユーザーに通知
      const errorMessage =
        error instanceof StorageError
          ? error.message
          : 'データの読み込みに失敗しました。ブラウザを再起動してください。'

      // エラー状態を設定（空データで上書きせず、エラーを表示）
      set({
        initError: errorMessage,
        initialized: true, // 初期化済みフラグは立てるが、データは空のまま
      })

      // ユーザーに警告
      alert(errorMessage)
    }
  },

  // 表示制御
  setView: (year, month) => {
    set({ view: { year, month } })
  },

  goToPrevMonth: () => {
    const { year, month } = get().view
    // 令和元年5月（2019年5月）より前には戻れない
    if (year === 2019 && month <= 4) return
    if (year < 2019) return
    if (month === 0) {
      set({ view: { year: year - 1, month: 11 } })
    } else {
      set({ view: { year, month: month - 1 } })
    }
  },

  goToNextMonth: () => {
    const { year, month } = get().view
    if (month === 11) {
      set({ view: { year: year + 1, month: 0 } })
    } else {
      set({ view: { year, month: month + 1 } })
    }
  },

  goToToday: () => {
    const today = new Date()
    set({ view: { year: today.getFullYear(), month: today.getMonth() } })
  },

  // 選択日
  setSelectedDate: (date) => {
    set({ selectedDate: date })
  },

  // エントリ操作
  updateEntry: async (date, updates) => {
    const existing = get().entries.find((e) => e.date === date)
    const entry: DayEntry = {
      date,
      text: updates.text ?? existing?.text ?? '',
      symbol: updates.symbol !== undefined ? updates.symbol : existing?.symbol,
      stamp: updates.stamp !== undefined ? updates.stamp : existing?.stamp,
      timeFrom: updates.timeFrom !== undefined ? updates.timeFrom : existing?.timeFrom,
      timeTo: updates.timeTo !== undefined ? updates.timeTo : existing?.timeTo,
    }
    await saveEntry(entry)
    set((state) => {
      const existingEntry = state.entries.find((e) => e.date === date)
      if (existingEntry) {
        return {
          entries: state.entries.map((e) => (e.date === date ? entry : e)),
        }
      }
      return { entries: [...state.entries, entry] }
    })
  },

  getEntry: (date) => {
    return get().entries.find((e) => e.date === date)
  },

  getEntryText: (date) => {
    const entry = get().entries.find((e) => e.date === date)
    return entry?.text ?? ''
  },

  // 設定
  updateSettings: async (newSettings) => {
    const settings = { ...get().settings, ...newSettings }
    await saveSettings(settings)

    // 言語が変更された場合
    if (newSettings.language) {
      i18n.changeLanguage(newSettings.language)
    }

    // 国が変更された場合
    if (newSettings.country) {
      initHolidays(newSettings.country)
    }

    set({ settings })
  },

  // カレンダーコメント
  getCalendarComment: (year, month) => {
    const key = `${year}-${String(month + 1).padStart(2, '0')}`
    return get().calendarComments[key] ?? ''
  },

  updateCalendarComment: async (year, month, comment) => {
    const key = `${year}-${String(month + 1).padStart(2, '0')}`
    const calendarComments = { ...get().calendarComments }
    if (comment.trim()) {
      calendarComments[key] = comment
    } else {
      delete calendarComments[key]
    }
    await saveCalendarComments(calendarComments)
    set({ calendarComments })
  },

  // カレンダーテーマ
  getCalendarTheme: (year, month) => {
    const key = `${year}-${String(month + 1).padStart(2, '0')}`
    return get().calendarThemes[key] ?? get().settings.calendarTheme
  },

  updateCalendarTheme: async (year, month, theme) => {
    const key = `${year}-${String(month + 1).padStart(2, '0')}`
    const calendarThemes = { ...get().calendarThemes }
    calendarThemes[key] = theme
    await saveCalendarThemes(calendarThemes)
    set({ calendarThemes })
  },

  getCalendarGridStyle: (year, month) => {
    const key = `${year}-${String(month + 1).padStart(2, '0')}`
    return get().calendarGridStyles[key] ?? 'rounded'
  },

  updateCalendarGridStyle: async (year, month, gridStyle) => {
    const key = `${year}-${String(month + 1).padStart(2, '0')}`
    const calendarGridStyles = { ...get().calendarGridStyles }
    calendarGridStyles[key] = gridStyle
    await saveCalendarGridStyles(calendarGridStyles)
    set({ calendarGridStyles })
  },

  // 先月からコピー（曜日パターンを推測して適用）
  copyFromPreviousMonth: async () => {
    const { view, entries } = get()
    const { format, getDaysInMonth } = await import('date-fns')

    // 先月の年月を計算
    const prevYear = view.month === 0 ? view.year - 1 : view.year
    const prevMonth = view.month === 0 ? 11 : view.month - 1

    // 先月のエントリをフィルタリング（何かしらのデータがあるもの）
    const prevMonthPrefix = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-`
    const prevMonthEntries = entries.filter((e) => {
      if (!e.date.startsWith(prevMonthPrefix)) return false
      // いずれかのフィールドに値があればコピー対象
      return (
        e.text.trim() !== '' ||
        e.symbol !== null ||
        e.stamp !== null ||
        e.timeFrom !== '' ||
        e.timeTo !== ''
      )
    })

    if (prevMonthEntries.length === 0) {
      return // 先月のデータがなければ何もしない
    }

    // 曜日ごとに各フィールドを集計（0=日曜〜6=土曜）
    type FieldCounts = Record<string, number>
    type WeekdayCounts = Record<number, FieldCounts>
    const textCounts: WeekdayCounts = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {} }
    const symbolCounts: WeekdayCounts = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {} }
    const stampCounts: WeekdayCounts = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {} }
    const timeFromCounts: WeekdayCounts = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {} }
    const timeToCounts: WeekdayCounts = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {} }

    for (const entry of prevMonthEntries) {
      // "YYYY-MM-DD"をローカル時間としてパース（new Date()はUTCとして解釈するため曜日がずれる）
      const parts = entry.date.split('-').map(Number)
      const date = new Date(parts[0] ?? 0, (parts[1] ?? 1) - 1, parts[2] ?? 1)
      const dayOfWeek = date.getDay()

      if (entry.text.trim()) {
        const counts = textCounts[dayOfWeek]
        if (counts) counts[entry.text] = (counts[entry.text] || 0) + 1
      }
      if (entry.symbol) {
        const counts = symbolCounts[dayOfWeek]
        if (counts) counts[entry.symbol] = (counts[entry.symbol] || 0) + 1
      }
      if (entry.stamp) {
        const counts = stampCounts[dayOfWeek]
        if (counts) counts[entry.stamp] = (counts[entry.stamp] || 0) + 1
      }
      if (entry.timeFrom) {
        const counts = timeFromCounts[dayOfWeek]
        if (counts) counts[entry.timeFrom] = (counts[entry.timeFrom] || 0) + 1
      }
      if (entry.timeTo) {
        const counts = timeToCounts[dayOfWeek]
        if (counts) counts[entry.timeTo] = (counts[entry.timeTo] || 0) + 1
      }
    }

    // 各曜日で最も多く使われた値を取得するヘルパー
    const getMostCommon = (counts: FieldCounts): string | null => {
      let maxCount = 0
      let mostCommon: string | null = null
      for (const [value, count] of Object.entries(counts)) {
        if (count > maxCount) {
          maxCount = count
          mostCommon = value
        }
      }
      return mostCommon
    }

    // 各曜日のデフォルト値を計算
    type WeekdayDefaults = Record<
      number,
      {
        text?: string
        symbol?: string | null
        stamp?: string | null
        timeFrom?: string
        timeTo?: string
      }
    >
    const weekdayDefaults: WeekdayDefaults = {}

    for (let dow = 0; dow < 7; dow++) {
      const text = getMostCommon(textCounts[dow] ?? {})
      const symbol = getMostCommon(symbolCounts[dow] ?? {})
      const stamp = getMostCommon(stampCounts[dow] ?? {})
      const timeFrom = getMostCommon(timeFromCounts[dow] ?? {})
      const timeTo = getMostCommon(timeToCounts[dow] ?? {})

      // 全曜日のパターンを設定（先月に予定がない曜日は空でクリア）
      weekdayDefaults[dow] = {
        text: text ?? '',
        symbol: symbol,
        stamp: stamp,
        timeFrom: timeFrom ?? '',
        timeTo: timeTo ?? '',
      }
    }

    // 今月の各日に適用
    const daysInMonth = getDaysInMonth(new Date(view.year, view.month))

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(view.year, view.month, day)
      const dayOfWeek = date.getDay()
      const defaults = weekdayDefaults[dayOfWeek]
      if (defaults) {
        const dateString = format(date, 'yyyy-MM-dd')
        await get().updateEntry(dateString, defaults)
      }
    }
  },
}))
