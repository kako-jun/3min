/**
 * 画像キャプチャ・シェア・ダウンロードのユーティリティ
 * カレンダー（Konva Canvas）とQRコード両方で使用
 */

/**
 * dataURLをBlobに変換
 */
export function dataURLToBlob(dataURL: string): Blob {
  const parts = dataURL.split(',')
  const mime = parts[0]?.match(/:(.*?);/)?.[1] ?? 'image/png'
  const bstr = atob(parts[1] ?? '')
  const n = bstr.length
  const u8arr = new Uint8Array(n)
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i)
  }
  return new Blob([u8arr], { type: mime })
}

/**
 * Canvas要素からBlobを取得
 */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to convert canvas to blob'))
      }
    }, 'image/png')
  })
}

/**
 * Blobをダウンロード
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.png') ? filename : `${filename}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Blobをクリップボードにコピー
 */
async function copyBlobToClipboard(blob: Blob): Promise<void> {
  await navigator.clipboard.write([
    new ClipboardItem({
      'image/png': blob,
    }),
  ])
}

/** シェア結果 */
export type ShareResult = 'shared' | 'copied' | 'cancelled'

/**
 * BlobをWeb Share APIで共有（フォールバック付き）
 * @returns 'shared' | 'copied' | 'cancelled'
 */
export async function shareBlob(
  blob: Blob,
  filename: string,
  title?: string
): Promise<ShareResult> {
  const file = new File([blob], filename.endsWith('.png') ? filename : `${filename}.png`, {
    type: 'image/png',
  })
  const shareData = { files: [file], title: title ?? filename }

  // Web Share APIでファイル共有を試行
  if (navigator.share) {
    if (!navigator.canShare || navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        return 'shared'
      } catch (e) {
        // AbortError（ユーザーキャンセル）
        if (e instanceof Error && e.name === 'AbortError') {
          return 'cancelled'
        }
        // その他のエラーはフォールバック
      }
    }
  }

  // フォールバック: クリップボードにコピー
  await copyBlobToClipboard(blob)
  return 'copied'
}
