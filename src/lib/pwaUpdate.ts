// PWA 更新検知（mypace 方式）の純粋なガード判定だけを持つモジュール。
//
// DOM操作・SW登録（registerSW/overlay/reload）はsrc/main.tsx側の責務。ここは
// 「reloadしていいか」「defer待機を続けるべきか」を判定する純関数と、それに使う定数のみを持つ。
// sessionStorage/document等のI/Oはmain.tsx側で行い、判定結果だけをここに渡す（単体テスト可能にするため）。

/** reloadループ防止のクールダウン（ミリ秒）。 */
export const UPDATE_COOLDOWN_MS = 10_000

/** 直近のSW更新時刻（sessionStorage）を保持するキー。 */
export const SW_UPDATE_STORAGE_KEY = '3min-sw-update-time'

/** defer判定のポーリング間隔（ミリ秒）。 */
export const DEFER_CHECK_INTERVAL_MS = 3_000

/** 入力中がずっと続いても強制的に更新を進めるまでの最大defer時間（ミリ秒）。 */
export const MAX_DEFER_MS = 60_000

/**
 * 直近のクールダウン期間内に既に更新を適用済みか（純関数・テスト可能にnowを引数で受ける）。
 * lastUpdatedAtがnull（未更新）ならfalse。未来時刻（時計巻き戻し等）も保守的に「まだ」とみなす。
 */
export function isUpdateCooldownActive(
  lastUpdatedAt: number | null,
  now: number,
  durationMs: number = UPDATE_COOLDOWN_MS
): boolean {
  if (lastUpdatedAt === null) return false
  const elapsed = now - lastUpdatedAt
  return elapsed >= 0 && elapsed < durationMs
}

/**
 * 渡された要素がテキスト編集中（input/textarea/contentEditable）かどうか。
 * document.activeElementを直接読まず引数で受け取ることでテスト可能にする。
 */
export function isEditingElement(el: Element | null): boolean {
  if (!el) return false
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return true
  return (el as HTMLElement).isContentEditable === true
}

/**
 * defer待機ループを続けるべきか（true=まだ待つ、false=更新処理を進めてよい）。
 * 編集中であっても、deferredMsがmaxDeferMsに達したら強制的に進める（無限defer防止）。
 *
 * main.tsx側はこの関数を「defer待機の初回判定」だけでなく、reload実行直前の
 * 各チェックポイント（skipWaiting送信直前 / controllerchangeハンドラ内 /
 * fallbackタイマー内）でも再評価する。deferredMsが既にmaxDeferMsへ達している
 * 場合はどの時点で呼んでも一貫してfalse（強制続行の判断を後から覆さない）。
 */
export function shouldContinueDeferring(
  el: Element | null,
  deferredMs: number,
  maxDeferMs: number = MAX_DEFER_MS
): boolean {
  return isEditingElement(el) && deferredMs < maxDeferMs
}

/**
 * 新しい onNeedRefresh 呼び出しが、自前の更新フロー（overlay表示〜reload）を
 * 開始してよいか（true=開始してよい, false=既に他の更新フローが進行中なので
 * 何もしない）。
 *
 * これがreloadループ防止の一次ガード。isUpdateCooldownActive()による
 * sessionStorageベースのcooldownだけでは不十分：UPDATE_COOLDOWN_MS(10秒)は
 * MAX_DEFER_MS(60秒)より短いため、入力継続中にcooldownが経過した後もう一度
 * onNeedRefreshが発火すると、cooldownチェックを素通りして1本目のdefer待機と
 * 並走する2本目のrunUpdateフローが開始されてしまう（overlay/SKIP_WAITING/
 * reloadタイマーの二重発生）。呼び出し側（main.tsx）は、進行中フラグを
 * cooldownチェックより先に評価すること。
 */
export function canStartUpdateFlow(isApplying: boolean): boolean {
  return !isApplying
}
