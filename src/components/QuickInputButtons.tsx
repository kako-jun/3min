import { useTranslation } from 'react-i18next'
import { QUICK_INPUT_STYLES } from '../lib/types'
import { STAMP_ICONS } from './ui/StampIcons'

interface QuickInputButtonsProps {
  selectedStamp: string | null
  onSelect: (stampKey: string | null) => void
}

/**
 * 定型入力ボタン（休/◯/△/✕/満）
 * 選択状態がわかるトグルボタン形式
 */
export function QuickInputButtons({ selectedStamp, onSelect }: QuickInputButtonsProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap justify-center gap-1">
      {QUICK_INPUT_STYLES.map((style) => {
        const IconComponent = STAMP_ICONS[style.key]
        const displayValue = IconComponent ? null : t(`quickInput.${style.key}`)
        const isSelected = selectedStamp === style.key
        return (
          <button
            key={style.key}
            onClick={() => onSelect(isSelected ? null : style.key)}
            className={`rounded px-2 py-1 text-sm transition-all ${
              isSelected ? 'shadow-inner ring-2 ring-offset-1' : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: style.bgColor,
              color: style.textColor,
              opacity: isSelected ? 1 : 0.7,
              transform: isSelected ? 'scale(1.1)' : 'scale(1)',
              // @ts-expect-error ring-offset-color
              '--tw-ring-color': style.bgColor,
              '--tw-ring-offset-color': 'white',
            }}
          >
            {IconComponent ? <IconComponent /> : displayValue}
          </button>
        )
      })}
    </div>
  )
}
