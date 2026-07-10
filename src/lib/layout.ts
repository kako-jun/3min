/**
 * スクロールリストの動的な最大高さ（px）を計算する。
 *
 * available（ビューポート残り高さ = window.innerHeight − リスト上端top − 下に確保する余白）が
 * 正であれば丸めてそのまま採用し、0以下（リスト上端が画面外に押し出された等）なら
 * minListHeight にフォールバックする。
 *
 * 呼び出し側（DayEditor）は available が「正だが minListHeight 未満」の場合でも、
 * available をそのまま使うことでスマホ幅でのコメント欄見切れ（GitHub Issue #41）を防ぐ。
 * かつて `Math.max(minListHeight, available)` だった旧実装は、この区間で
 * minListHeight に切り上げてしまい、下の余白（コメント欄）を画面外に押し出していた。
 *
 * @param available ビューポート高さ − リスト上端top − 下に確保する余白
 * @param minListHeight available<=0 のときに使う下限
 */
export function computeDayEditorMaxHeight(available: number, minListHeight: number): number {
  return available > 0 ? Math.round(available) : minListHeight
}
