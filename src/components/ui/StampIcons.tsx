interface IconProps {
  size?: number
}

export function CircleIcon({ size = 14 }: IconProps) {
  const strokeWidth = size > 10 ? 2 : 1.5
  const r = (size - strokeWidth * 2) / 2
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    >
      <circle cx={size / 2} cy={size / 2} r={r} />
    </svg>
  )
}

export function TriangleIcon({ size = 14 }: IconProps) {
  const strokeWidth = size > 10 ? 2 : 1.5
  const margin = strokeWidth
  const top = margin
  const bottom = size - margin
  const left = margin
  const right = size - margin
  const midX = size / 2
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    >
      <path d={`M${midX} ${top}L${right} ${bottom}H${left}Z`} strokeLinejoin="round" />
    </svg>
  )
}

export function XIcon({ size = 14 }: IconProps) {
  const strokeWidth = size > 10 ? 2 : 1.5
  const margin = size * 0.2
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    >
      <path
        d={`M${margin} ${margin}L${size - margin} ${size - margin}M${size - margin} ${margin}L${margin} ${size - margin}`}
        strokeLinecap="round"
      />
    </svg>
  )
}

// キーに応じたアイコンコンポーネントを返す
export const STAMP_ICONS: Record<string, React.ComponentType<IconProps>> = {
  available: CircleIcon,
  few: TriangleIcon,
  reserved: XIcon,
}
