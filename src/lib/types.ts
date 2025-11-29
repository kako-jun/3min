/** 日ごとのテキストデータ */
export interface DayEntry {
  date: string // YYYY-MM-DD
  text: string
}

/** アプリ設定 */
export interface Settings {
  weekStartsOn: 0 | 1 // 0: 日曜, 1: 月曜
  theme: 'dark' | 'light'
}

/** カレンダーの表示状態 */
export interface CalendarView {
  year: number
  month: number // 0-11
}

/** ストア全体の状態 */
export interface CalendarState {
  // 表示状態
  view: CalendarView
  // データ
  entries: DayEntry[]
  settings: Settings
  // 初期化状態
  initialized: boolean
}

/** デフォルト設定 */
export const defaultSettings: Settings = {
  weekStartsOn: 0,
  theme: 'dark',
}
