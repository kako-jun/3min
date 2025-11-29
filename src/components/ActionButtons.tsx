import { useState } from 'react'
import { shareImage, downloadImage, copyImageToClipboard } from '../lib/capture'

interface ActionButtonsProps {
  calendarRef: React.RefObject<HTMLDivElement>
  filename: string
}

export function ActionButtons({ calendarRef, filename }: ActionButtonsProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const showMessage = (text: string) => {
    setMessage(text)
    setTimeout(() => setMessage(null), 2000)
  }

  const handleShare = async () => {
    if (!calendarRef.current || isProcessing) return
    setIsProcessing(true)

    try {
      await shareImage(calendarRef.current, filename)
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'Web Share API is not supported') {
          showMessage('クリップボードにコピーしました')
        } else if (error.name !== 'AbortError') {
          // クリップボードにフォールバック
          try {
            await copyImageToClipboard(calendarRef.current)
            showMessage('クリップボードにコピーしました')
          } catch {
            showMessage('共有に失敗しました')
          }
        }
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = async () => {
    if (!calendarRef.current || isProcessing) return
    setIsProcessing(true)

    try {
      await downloadImage(calendarRef.current, filename)
      showMessage('ダウンロードしました')
    } catch {
      showMessage('ダウンロードに失敗しました')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2">
        {/* シェアボタン */}
        <button
          onClick={handleShare}
          disabled={isProcessing}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50"
        >
          <span>📤</span>
          <span>シェア</span>
        </button>

        {/* ダウンロードボタン */}
        <button
          onClick={handleDownload}
          disabled={isProcessing}
          className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 font-medium text-white hover:bg-gray-500 active:bg-gray-700 disabled:opacity-50"
        >
          <span>💾</span>
          <span>保存</span>
        </button>
      </div>

      {/* メッセージ表示 */}
      {message && <div className="rounded bg-gray-700 px-3 py-1 text-sm text-white">{message}</div>}
    </div>
  )
}
