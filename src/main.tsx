import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import i18n from './lib/i18n'
import {
  DEFER_CHECK_INTERVAL_MS,
  isUpdateCooldownActive,
  shouldContinueDeferring,
  SW_UPDATE_STORAGE_KEY,
} from './lib/pwaUpdate'
import App from './App'
import './index.css'

// overlayを見せてからskipWaitingを送るまでの間（ユーザーに気づかせる猶予）
const OVERLAY_DELAY_MS = 1500
// controllerchangeが来ない場合のfallback reloadまでの猶予
const FALLBACK_RELOAD_MS = 2000

function readLastUpdatedAt(): number | null {
  const raw = sessionStorage.getItem(SW_UPDATE_STORAGE_KEY)
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

function markUpdated(): void {
  sessionStorage.setItem(SW_UPDATE_STORAGE_KEY, String(Date.now()))
}

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
    if (isUpdateCooldownActive(readLastUpdatedAt(), Date.now())) {
      console.info('SW update skipped (cooldown)')
      return
    }

    // cooldownはdefer待機に入る前に記録する。defer待機中（入力フォーム操作中など）に
    // onNeedRefreshが複数回発火しても、2回目以降はここで弾かれ、deferループが並走しない。
    markUpdated()

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

      // controllerchange経由のreloadとfallback timerのreloadが両方発火しうるが、
      // 実際にreloadするのは一度だけにする
      let reloaded = false
      const reloadOnce = () => {
        if (reloaded) return
        reloaded = true
        window.location.reload()
      }

      navigator.serviceWorker.addEventListener('controllerchange', reloadOnce)

      // 1.5秒後にskipWaitingをトリガー
      setTimeout(async () => {
        try {
          await updateSW(true)
          // フォールバック: 2秒以内にcontrollerchangeが来なければ強制reload
          setTimeout(reloadOnce, FALLBACK_RELOAD_MS)
        } catch (e) {
          console.error('SW update failed:', e)
          reloadOnce()
        }
      }, OVERLAY_DELAY_MS)
    }

    // 入力フォーム操作中は即reloadせず、フォーカスが外れるまで待つ
    let deferredMs = 0
    const waitForIdle = () => {
      if (shouldContinueDeferring(document.activeElement, deferredMs)) {
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
