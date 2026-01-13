import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useCalendarStore } from './lib/store'
import { APP_THEMES } from './lib/types'
import { Calendar } from './components/Calendar'
import { QRPage } from './components/QRPage'
import { useLanguageFont } from './hooks/useLanguageFont'

function App() {
  const initialize = useCalendarStore((state) => state.initialize)
  const settings = useCalendarStore((state) => state.settings)
  const initialized = useCalendarStore((state) => state.initialized)

  // 言語に応じたフォントを動的に読み込む
  useLanguageFont(settings.language)

  useEffect(() => {
    initialize()
  }, [initialize])

  // 訪問者カウントをインクリメント（非表示、1日1回制限あり）
  useEffect(() => {
    fetch('https://api.nostalgic.llll-ll.com/visit?action=increment&id=3min-ffe7299f').catch(
      () => {}
    )
  }, [])

  const appTheme = APP_THEMES[settings.appTheme]

  // html/bodyの背景色をテーマに合わせる
  useEffect(() => {
    document.documentElement.style.backgroundColor = appTheme.bg
    document.body.style.backgroundColor = appTheme.bg
  }, [appTheme.bg])

  if (!initialized) {
    return (
      <div
        className="flex h-full items-center justify-center"
        style={{ backgroundColor: appTheme.bg }}
      >
        <div style={{ color: appTheme.text }}>Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-full pb-8" style={{ backgroundColor: appTheme.bg, color: appTheme.text }}>
      <Routes>
        <Route path="/" element={<Navigate to="/calendar" replace />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/qr" element={<QRPage />} />
      </Routes>
    </div>
  )
}

export default App
