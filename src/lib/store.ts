import { create } from 'zustand'
import type { DayEntry, CalendarState, Settings } from './types'
import { defaultSettings } from './types'
import { loadEntries, loadSettings, saveEntry, saveSettings } from './storage'

interface CalendarActions {
  // 初期化
  initialize: () => Promise<void>

  // 表示制御
  setView: (year: number, month: number) => void
  goToPrevMonth: () => void
  goToNextMonth: () => void
  goToToday: () => void

  // エントリ操作
  updateEntry: (date: string, text: string) => Promise<void>
  getEntryText: (date: string) => string

  // 設定
  updateSettings: (settings: Partial<Settings>) => Promise<void>
}

const now = new Date()

export const useCalendarStore = create<CalendarState & CalendarActions>((set, get) => ({
  // 初期状態
  view: {
    year: now.getFullYear(),
    month: now.getMonth(),
  },
  entries: [],
  settings: defaultSettings,
  initialized: false,

  // 初期化
  initialize: async () => {
    if (get().initialized) return
    const [entries, settings] = await Promise.all([loadEntries(), loadSettings()])
    set({ entries, settings, initialized: true })
  },

  // 表示制御
  setView: (year, month) => {
    set({ view: { year, month } })
  },

  goToPrevMonth: () => {
    const { year, month } = get().view
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

  // エントリ操作
  updateEntry: async (date, text) => {
    const entry: DayEntry = { date, text }
    await saveEntry(entry)
    set((state) => {
      const existing = state.entries.find((e) => e.date === date)
      if (existing) {
        return {
          entries: state.entries.map((e) => (e.date === date ? entry : e)),
        }
      }
      return { entries: [...state.entries, entry] }
    })
  },

  getEntryText: (date) => {
    const entry = get().entries.find((e) => e.date === date)
    return entry?.text ?? ''
  },

  // 設定
  updateSettings: async (newSettings) => {
    const settings = { ...get().settings, ...newSettings }
    await saveSettings(settings)
    set({ settings })
  },
}))
