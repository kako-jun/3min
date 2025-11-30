/**
 * 画像を縮小してWebP形式に変換するユーティリティ
 */

const MAX_SIZE = 800 // カレンダー画像の背景として十分なサイズ

/**
 * 画像ファイルを縮小してWebP形式のBase64文字列に変換
 */
export async function processImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const dataUrl = e.target?.result as string
        const processed = await resizeAndConvertToWebP(dataUrl)
        resolve(processed)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * DataURLを縮小してWebP形式に変換
 */
async function resizeAndConvertToWebP(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      // 縮小サイズを計算
      let width = img.width
      let height = img.height

      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = Math.round((height * MAX_SIZE) / width)
          width = MAX_SIZE
        } else {
          width = Math.round((width * MAX_SIZE) / height)
          height = MAX_SIZE
        }
      }

      // Canvasで縮小・変換
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      // WebP形式で出力（品質0.8）
      const webpDataUrl = canvas.toDataURL('image/webp', 0.8)
      resolve(webpDataUrl)
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}
