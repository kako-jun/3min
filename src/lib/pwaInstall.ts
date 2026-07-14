/**
 * BeforeInstallPromptEvent - ブラウザのPWAインストールプロンプトイベント。
 * 標準DOM型に定義がないため独自に宣言する。
 */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

/** 却下後、再表示を抑制する期間（7日） */
export const PWA_INSTALL_DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000

/**
 * 却下記憶が有効期間内かどうかを判定する（純粋関数）。
 * dismissedAt が null なら一度も却下されていない＝抑制なし。
 * ちょうど7日後の境界では抑制を解除する（< 判定）。
 */
export function isInstallPromptSuppressed(
  dismissedAt: number | null,
  now: number = Date.now()
): boolean {
  if (dismissedAt === null) return false
  return now - dismissedAt < PWA_INSTALL_DISMISS_DURATION_MS
}
