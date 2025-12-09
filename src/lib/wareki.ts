/**
 * 和暦（Japanese Era）の変換
 */

export interface WarekiInfo {
  era: string
  year: number
  fullName: string
}

interface EraDefinition {
  name: string
  startDate: Date
}

// 元号の定義（新しい順）
const ERAS: EraDefinition[] = [
  { name: '令和', startDate: new Date(2019, 4, 1) }, // 2019年5月1日〜
  { name: '平成', startDate: new Date(1989, 0, 8) }, // 1989年1月8日〜
  { name: '昭和', startDate: new Date(1926, 11, 25) }, // 1926年12月25日〜
  { name: '大正', startDate: new Date(1912, 6, 30) }, // 1912年7月30日〜
  { name: '明治', startDate: new Date(1868, 0, 25) }, // 1868年1月25日〜
]

/**
 * 西暦から和暦を取得
 */
export function getWareki(date: Date): WarekiInfo {
  for (const era of ERAS) {
    if (date >= era.startDate) {
      const year = date.getFullYear() - era.startDate.getFullYear() + 1
      return {
        era: era.name,
        year,
        fullName: `${era.name}${year === 1 ? '元' : year}年`,
      }
    }
  }

  // 明治以前は西暦のまま
  return {
    era: '',
    year: date.getFullYear(),
    fullName: `${date.getFullYear()}年`,
  }
}

/**
 * 和暦の年を取得（例: "令和7"）
 */
export function getWarekiYear(date: Date): string {
  const wareki = getWareki(date)
  if (!wareki.era) return `${wareki.year}`
  return `${wareki.era}${wareki.year === 1 ? '元' : wareki.year}`
}

/**
 * 和暦の完全表記を取得（例: "令和7年"）
 */
export function getWarekiFullYear(date: Date): string {
  return getWareki(date).fullName
}
