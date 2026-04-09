import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { useCalendarStore } from '../lib/store'
import { APP_THEMES } from '../lib/types'
import { loadOnboardingDismissed, saveOnboardingDismissed } from '../lib/storage'

const PAGES = [
  { path: '/calendar', titleKey: 'app.title' },
  { path: '/qr', titleKey: 'app.titleQR' },
] as const

const TIP_KEYS: Record<string, string> = {
  '/calendar': 'qrTip',
  '/qr': 'calendarTip',
}

const TIP_TRANSLATION_KEYS: Record<string, string> = {
  '/calendar': 'onboarding.qrTip',
  '/qr': 'onboarding.calendarTip',
}

export function AppHeader() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const settings = useCalendarStore((state) => state.settings)
  const appTheme = APP_THEMES[settings.appTheme]
  const [isOpen, setIsOpen] = useState(false)
  const [showQrTip, setShowQrTip] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentPage = PAGES.find((p) => p.path === location.pathname) || PAGES[0]

  // 外側クリックで閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // オンボーディング dismissed 状態のキャッシュ
  const dismissedRef = useRef<Record<string, boolean>>({})

  // 初回のみツールチップを表示（各ページで兄弟機能を案内）
  useEffect(() => {
    const tipKey = TIP_KEYS[location.pathname]
    if (!tipKey) {
      setShowQrTip(false)
      return
    }

    let cancelled = false

    const checkAndShow = async () => {
      try {
        const dismissed = await loadOnboardingDismissed()
        dismissedRef.current = dismissed
        if (cancelled || dismissed[tipKey]) return

        setShowQrTip(true)
      } catch {
        // DB読み込み失敗時はツールチップを出さない
      }
    }
    checkAndShow()

    const timer = setTimeout(() => {
      if (!cancelled) {
        setShowQrTip(false)
        dismissedRef.current[tipKey] = true
        saveOnboardingDismissed(dismissedRef.current)
      }
    }, 5000)

    return () => {
      cancelled = true
      clearTimeout(timer)
      if (dismissedRef.current[tipKey] !== true) {
        dismissedRef.current[tipKey] = true
        saveOnboardingDismissed(dismissedRef.current)
      }
    }
  }, [location.pathname])

  const dismissTip = () => {
    setShowQrTip(false)
    const tipKey = TIP_KEYS[location.pathname]
    if (tipKey) {
      dismissedRef.current[tipKey] = true
      saveOnboardingDismissed(dismissedRef.current)
    }
  }

  const handleSelect = (path: string) => {
    navigate(path)
    setIsOpen(false)
  }

  return (
    <header className="text-left">
      <div className="flex">
        <img
          src="/logo.webp"
          alt=""
          className="mt-[4px] h-9 w-9"
          style={{
            filter: settings.appTheme === 'light' ? 'brightness(0)' : 'brightness(0) invert(1)',
          }}
        />
        <div>
          <div className="relative inline-block" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1 text-sm font-bold leading-tight transition-opacity hover:opacity-80"
              style={{ color: appTheme.text }}
            >
              {t(currentPage.titleKey)}
              <FontAwesomeIcon
                icon={faChevronDown}
                className="animate-gentle-bounce text-xs"
                style={{ color: appTheme.accent }}
              />
            </button>

            {isOpen && (
              <div
                className="absolute left-0 top-full z-50 mt-1 min-w-max rounded shadow-lg"
                style={{ backgroundColor: appTheme.surface }}
              >
                {PAGES.map((page) => (
                  <button
                    key={page.path}
                    onClick={() => handleSelect(page.path)}
                    className="block w-full px-4 py-2 text-left text-sm transition-opacity hover:opacity-70"
                    style={{
                      color: appTheme.text,
                      backgroundColor: page.path === currentPage.path ? appTheme.bg : 'transparent',
                    }}
                  >
                    {t(page.titleKey)}
                  </button>
                ))}
              </div>
            )}

            {/* 初回のみQRコード機能の存在を案内するツールチップ */}
            {showQrTip && !isOpen && (
              <button
                onClick={dismissTip}
                className="absolute left-0 top-full z-40 mt-2 whitespace-nowrap rounded px-3 py-1.5 text-xs font-bold shadow-lg transition-opacity"
                style={{ backgroundColor: appTheme.accent, color: '#ffffff' }}
              >
                <span
                  className="absolute -top-1.5 left-3 h-3 w-3 rotate-45"
                  style={{ backgroundColor: appTheme.accent }}
                />
                {t(TIP_TRANSLATION_KEYS[location.pathname] ?? 'onboarding.qrTip')}
              </button>
            )}
          </div>
          <p className="mt-0.5 text-[10px] leading-tight" style={{ color: appTheme.textMuted }}>
            {t('app.tagline')}
          </p>
        </div>
      </div>
    </header>
  )
}
