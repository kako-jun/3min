import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import i18n from './lib/i18n'
import App from './App'
import './index.css'

// SW更新ループ防止用のcooldown（更新直後の再検知を無視する）
const SW_UPDATE_KEY = '3min-sw-update-time'
const COOLDOWN_MS = 10000 // 10秒

function shouldSkipUpdate(): boolean {
  const lastUpdate = sessionStorage.getItem(SW_UPDATE_KEY)
  if (!lastUpdate) return false
  const elapsed = Date.now() - parseInt(lastUpdate, 10)
  return elapsed < COOLDOWN_MS
}

// テキスト入力中は即reloadすると困るため、入力欄にフォーカスがある間はreloadをdeferする
function isEditingActiveElement(): boolean {
  const el = document.activeElement
  if (!el) return false
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return true
  return (el as HTMLElement).isContentEditable === true
}

const DEFER_CHECK_INTERVAL_MS = 3000
const MAX_DEFER_MS = 60000 // 入力中がずっと続いても最大1分で強制更新する

// Service Workerを登録し、更新検知時のハンドリングを行う
const updateSW = registerSW({
  immediate: true,
  onRegistered(swRegistration) {
    if (swRegistration) {
      // 登録時に即座に更新確認を行う
      swRegistration.update().catch((error) => {
        console.info('SW update check skipped:', error?.message || 'offline')
      })
    }
  },
  onNeedRefresh() {
    // 直前に更新したばかりならスキップ（reloadループ防止）
    if (shouldSkipUpdate()) {
      console.info('SW update skipped (cooldown)')
      return
    }

    const runUpdate = () => {
      console.info('New version available, reloading...')

      const overlay = document.createElement('div')
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
      `

      const message = document.createElement('div')
      message.style.cssText = `
        color: white;
        font-size: 0.9rem;
        text-align: center;
        padding: 1.5rem 2rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        backdrop-filter: blur(10px);
      `
      message.textContent = i18n.t('pwa.updateRestarting')

      overlay.appendChild(message)
      document.body.appendChild(overlay)

      // 更新タイムスタンプを記録
      sessionStorage.setItem(SW_UPDATE_KEY, Date.now().toString())

      // 新SWが制御を握ったらreload
      const reloadOnControllerChange = () => {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload()
        })
      }

      // 1.5秒後にreload処理を開始
      setTimeout(async () => {
        try {
          // updateSW呼び出し前にリスナーを設定しておく
          reloadOnControllerChange()
          // skipWaitingをトリガー → controllerchangeイベントが発火するはず
          await updateSW(true)
          // フォールバック: 2秒以内にcontrollerchangeが来なければ強制reload
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        } catch (e) {
          console.error('SW update failed:', e)
          window.location.reload()
        }
      }, 1500)
    }

    // 入力フォーム操作中は即reloadせず、フォーカスが外れるまで待つ
    let deferredMs = 0
    const waitForIdle = () => {
      if (isEditingActiveElement() && deferredMs < MAX_DEFER_MS) {
        deferredMs += DEFER_CHECK_INTERVAL_MS
        setTimeout(waitForIdle, DEFER_CHECK_INTERVAL_MS)
        return
      }
      runUpdate()
    }

    waitForIdle()
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
