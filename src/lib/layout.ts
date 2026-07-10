/**
 * スクロールリストの動的な最大高さ（px）を計算する。
 *
 * available（ビューポート残り高さ = window.innerHeight − リスト上端top − 下に確保する余白）を
 * 丸め、その結果が正であればそのまま採用し、0以下（リスト上端が画面外に押し出された等、
 * またはリサイズ中のサブピクセル値が丸めで0になった場合）なら minListHeight にフォールバックする。
 * 判定を丸め後の値に対して行うのは、0 < available < 1 のようなサブピクセル値が
 * `available > 0` の判定だけを素通りして `Math.round` で0に潰れ、minListHeight の
 * 下限保証を破ってしまうのを防ぐため。
 *
 * 呼び出し側（DayEditor）は available が「正だが minListHeight 未満」の場合でも、
 * available をそのまま使うことでスマホ幅でのコメント欄見切れ（GitHub Issue #41）を防ぐ。
 * かつて `Math.max(minListHeight, available)` だった旧実装は、この区間で
 * minListHeight に切り上げてしまい、下の余白（コメント欄）を画面外に押し出していた。
 *
 * @param available ビューポート高さ − リスト上端top − 下に確保する余白
 * @param minListHeight 丸め後の available が0以下のときに使う下限
 */
export function computeDayEditorMaxHeight(available: number, minListHeight: number): number {
  const rounded = Math.round(available)
  return rounded > 0 ? rounded : minListHeight
}
