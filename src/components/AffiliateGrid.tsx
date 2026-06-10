import { useTranslation } from 'react-i18next'
import { useCalendarStore } from '../lib/store'
import { APP_THEMES } from '../lib/types'
import { AFFILIATE_PRODUCTS } from '../lib/affiliateProducts'

// machigai-salad の AffiliateGrid を 3min (React + Tailwind + react-i18next) 向けに移植。
// データ層は lib/affiliateProducts.ts に分離。色は APP_THEMES (light / dark) を使用する。
// 円形 orb 画像 × 3 を横並びにし、下に「ここから買えば応援になる」ヒントを置く。

export function AffiliateGrid() {
  const { t } = useTranslation()
  const appThemeId = useCalendarStore((state) => state.settings.appTheme)
  const appTheme = APP_THEMES[appThemeId]

  return (
    <section aria-label={t('about.amazonSupport')} className="w-full">
      <ul className="m-0 grid w-full list-none grid-cols-3 gap-3 p-0 sm:gap-4">
        {AFFILIATE_PRODUCTS.map((p) => (
          <li key={p.url}>
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer sponsored nofollow"
              title={p.title}
              className="group block focus-visible:outline-none"
            >
              {/* 円形 orb 画像 */}
              <div
                className="relative mx-auto aspect-square w-full overflow-hidden rounded-full transition-transform duration-200 ease-out group-hover:scale-105"
                style={{
                  backgroundColor: appTheme.bg,
                  boxShadow: 'inset 0 0 14px rgba(0,0,0,0.3), 0 0 10px rgba(0,0,0,0.12)',
                }}
              >
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  loading="lazy"
                  decoding="async"
                  width={120}
                  height={120}
                  className="absolute inset-0 h-full w-full scale-110 object-cover transition-transform duration-200 ease-out group-hover:scale-[1.18]"
                  onError={(e) => {
                    ;(e.currentTarget as HTMLImageElement).style.visibility = 'hidden'
                  }}
                />
              </div>
              {/* キャプション + タイトル */}
              <div className="mt-2 text-center">
                {p.caption && (
                  <div className="text-xs leading-tight" style={{ color: appTheme.textMuted }}>
                    {p.caption}
                  </div>
                )}
                <div
                  className="mt-0.5 text-xs leading-tight"
                  style={{ color: appTheme.textMuted, opacity: 0.7 }}
                >
                  {p.title}
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
      <p
        className="mt-3 whitespace-pre-line text-center text-xs"
        style={{ color: appTheme.textMuted, opacity: 0.7 }}
      >
        {t('about.amazonHint')}
      </p>
    </section>
  )
}
