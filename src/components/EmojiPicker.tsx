import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSmile } from '@fortawesome/free-solid-svg-icons'
import { APP_THEMES, type AppTheme } from '../lib/types'

/** 絵文字カテゴリ定義 */
const EMOJI_CATEGORIES = {
  events: ['🎉', '🎊', '🎁', '🎂', '🎃', '🎄', '🎅', '🐰', '🐣', '🎍', '🎋', '🎆'],
  food: ['☕', '🍵', '🍻', '🍺', '🍷', '🍴', '🍜', '🍕', '🍔', '🍰', '🍩', '🍦'],
  beauty: ['💈', '💇', '💆', '💅', '✂️', '🪮', '💄', '👗', '👠', '👜', '💍', '🎀'],
  nature: ['🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '🍀', '🌴', '🌈', '☀️', '🌙', '⭐'],
  symbols: ['❤️', '💕', '✨', '🔥', '💯', '⭐', '⚡', '💡', '📢', '📌', '📍', '🆕'],
  status: ['⭕', '❌', '⚠️', '🚫', '✅', '🔴', '🟢', '🟡', '🔵', '⬛', '⬜', 'ℹ️'],
  faces: ['😊', '😄', '🥰', '😍', '🤗', '😋', '🤤', '😎', '🥳', '😴', '🤔', '👋'],
  hands: ['👍', '👎', '👏', '🙏', '🤝', '✌️', '🤞', '👌', '✋', '👊', '💪', '🙌'],
}

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  appTheme: AppTheme
}

export function EmojiPicker({ onSelect, appTheme }: EmojiPickerProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof EMOJI_CATEGORIES>('events')
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const theme = APP_THEMES[appTheme]

  // ポップアップ位置を計算。
  // 高さは固定見積もりだと言語(タブの flex-wrap 行数)や幅でズレてボタンから浮くため、
  // 描画後の実寸を useLayoutEffect で測ってボタンのすぐ上に配置する（描画前に補正＝ちらつき無し）。
  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current || !popupRef.current) return

    const rect = buttonRef.current.getBoundingClientRect()
    const popupWidth = popupRef.current.offsetWidth || 256 // w-64 = 256px
    const popupHeight = popupRef.current.offsetHeight // 実測（タブ折返しで可変）

    // ボタンのすぐ上に出す
    let top = rect.top - popupHeight - 4
    let left = rect.right - popupWidth

    // 上に収まらない場合は下に表示
    if (top < 0) {
      top = rect.bottom + 4
    }

    // 左端からはみ出る場合は調整
    if (left < 8) {
      left = 8
    }

    setPopupPosition({ top, left })
  }, [isOpen, selectedCategory])

  // クリック外側で閉じる
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        popupRef.current &&
        !popupRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const categoryKeys = Object.keys(EMOJI_CATEGORIES) as (keyof typeof EMOJI_CATEGORIES)[]

  const handleEmojiClick = (emoji: string) => {
    onSelect(emoji)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* トリガーボタン */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="rounded px-2 py-0.5 text-sm transition-opacity hover:opacity-80"
        style={{ backgroundColor: theme.bg, color: theme.text }}
        title={t('emoji.title')}
      >
        <FontAwesomeIcon icon={faSmile} />
      </button>

      {/* ポップアップ（Portal経由でbodyに描画） */}
      {isOpen &&
        createPortal(
          <div
            ref={popupRef}
            className="fixed z-50 w-64 rounded-lg shadow-xl"
            style={{
              top: popupPosition.top,
              left: popupPosition.left,
              backgroundColor: theme.surface,
              border: `1px solid ${theme.textMuted}`,
            }}
          >
            {/* カテゴリタブ */}
            <div
              className="flex flex-wrap justify-center gap-1 border-b p-2"
              style={{ borderColor: theme.textMuted }}
            >
              {categoryKeys.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="rounded px-2 py-1 text-xs transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: selectedCategory === cat ? theme.accent : theme.bg,
                    color: selectedCategory === cat ? '#ffffff' : theme.text,
                  }}
                >
                  {t(`emoji.categories.${cat}`)}
                </button>
              ))}
            </div>

            {/* 絵文字グリッド */}
            <div className="grid max-h-40 grid-cols-6 gap-1 overflow-y-auto p-2">
              {EMOJI_CATEGORIES[selectedCategory].map((emoji, index) => (
                <button
                  key={`${emoji}-${index}`}
                  onClick={() => handleEmojiClick(emoji)}
                  className="rounded p-1 text-xl transition-colors hover:bg-opacity-50"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.bg)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
