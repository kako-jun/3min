/**
 * 六曜（ろくよう）の計算
 * 旧暦の月日から六曜を算出
 */

export type RokuyoType = 'sensho' | 'tomobiki' | 'senbu' | 'butsumetsu' | 'taian' | 'shakko'

export interface RokuyoInfo {
  type: RokuyoType
  name: string
  shortName: string
}

const ROKUYO_LIST: RokuyoInfo[] = [
  { type: 'sensho', name: '先勝', shortName: '先勝' },
  { type: 'tomobiki', name: '友引', shortName: '友引' },
  { type: 'senbu', name: '先負', shortName: '先負' },
  { type: 'butsumetsu', name: '仏滅', shortName: '仏滅' },
  { type: 'taian', name: '大安', shortName: '大安' },
  { type: 'shakko', name: '赤口', shortName: '赤口' },
]

/**
 * グレゴリオ暦から旧暦（太陰太陽暦）への変換
 * 簡易計算版 - 完全な精度ではないが実用上十分
 */
function getLunarDate(date: Date): { month: number; day: number } {
  // 基準日: 2000年1月6日 = 旧暦1999年12月1日
  const baseDate = new Date(2000, 0, 6)
  const baseLunarMonth = 12
  const baseLunarDay = 1

  // 朔望月（新月から新月）の平均日数
  const SYNODIC_MONTH = 29.530588853

  // 基準日からの経過日数
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))

  // 経過した朔望月の数
  const lunarMonths = Math.floor(diffDays / SYNODIC_MONTH)

  // 現在の旧暦月内での日数
  const daysInCurrentMonth = diffDays - Math.floor(lunarMonths * SYNODIC_MONTH)

  // 旧暦の月と日を計算
  let lunarMonth = (baseLunarMonth + lunarMonths) % 12
  if (lunarMonth === 0) lunarMonth = 12
  const lunarDay = baseLunarDay + daysInCurrentMonth

  return { month: lunarMonth, day: Math.floor(lunarDay) }
}

/**
 * 日付から六曜を取得
 */
export function getRokuyo(date: Date): RokuyoInfo {
  const lunar = getLunarDate(date)
  // 六曜 = (旧暦月 + 旧暦日) % 6
  const index = (lunar.month + lunar.day) % 6
  return ROKUYO_LIST[index] as RokuyoInfo
}

/**
 * 六曜の名前を取得（短縮形）
 */
export function getRokuyoName(date: Date): string {
  return getRokuyo(date).shortName
}
