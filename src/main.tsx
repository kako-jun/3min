import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import i18n from './lib/i18n'
import {
  canStartUpdateFlow,
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

// モジュールレベルの「更新フロー進行中」ガード（reloadループ防止の一次防衛）。
// UPDATE_COOLDOWN_MS(10秒) は MAX_DEFER_MS(60秒) より短いため、sessionStorage
// のcooldownだけでは、入力継続中にcooldownが経過した後もう一度onNeedRefresh
// が発火するケースを防げない（cooldownチェックを素通りして2本目のdefer待機/
// runUpdateフローが並走し、overlayが二重生成される）。このフラグはreloadで
// ページごと消えるので、成功パスではfalseに戻さない
// （machigai-saladのServiceWorkerRegister.tsxと同型）。
let applying = false

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
    // 既に他の更新フローが進行中ならスキップ（並走防止の一次ガード）
    if (!canStartUpdateFlow(applying)) {
      console.info('SW update skipped (already applying)')
      return
    }

    // 直前に更新したばかりならスキップ（reloadループ防止の二次ガード）
    if (isUpdateCooldownActive(readLastUpdatedAt(), Date.now())) {
      console.info('SW update skipped (cooldown)')
      return
    }

    applying = true

    // cooldownはdefer待機に入る前に記録する。defer待機中（入力フォーム操作中など）に
    // onNeedRefreshが複数回発火しても、2回目以降はここで弾かれ、deferループが並走しない。
    markUpdated()

    let deferredMs = 0
    let overlay: HTMLDivElement | null = null
    let reloaded = false

    const showOverlay = () => {
      if (overlay) return
      console.info('New version available, reloading...')

      overlay = document.createElement('div')
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
    }

    // 入力欄にフォーカスが戻っていたらoverlayを隠し、再度defer待機に戻る。
    // 呼び出し元がリトライ役（waitForIdle/triggerSkipWaiting/attemptReloadの
    // いずれか）を渡し、DEFER_CHECK_INTERVAL_MS後に同じチェックポイントへ戻す。
    const deferAgain = (retry: () => void) => {
      overlay?.remove()
      overlay = null
      deferredMs += DEFER_CHECK_INTERVAL_MS
      setTimeout(retry, DEFER_CHECK_INTERVAL_MS)
    }

    // controllerchange経由のreloadとfallback timerのreloadが両方発火しうるが、
    // 実際にreloadするのは一度だけにする
    const reloadOnce = () => {
      if (reloaded) return
      reloaded = true
      window.location.reload()
    }

    // reload直前の最終チェックポイント（controllerchangeハンドラ / fallback
    // タイマーの両方がここを経由する）。ここでも再入力を検知したらreloadせず
    // defer側へ戻る — skipWaitingは既にトリガー済みなので再送しない。
    //
    // 注意（ベストエフォート）: このチェックはほぼ機能しない。vite-plugin-pwaの
    // registerSW()が内部でonNeedRefresh発火時に navigator.serviceWorker の
    // controllerchangeへ無条件reloadリスナーを登録済みで、それが本ハンドラより
    // 先に発火し reload を確定させてしまうため（詳細: docs/architecture.md
    // 「再入力チェックの既知の制約」）。3minは入力欄がデバウンス無し都度保存
    // なのでデータ損失はしないが、入力中に画面が暗転する割り込みは残る。
    const attemptReload = () => {
      if (shouldContinueDeferring(document.activeElement, deferredMs)) {
        deferAgain(attemptReload)
        return
      }
      showOverlay()
      reloadOnce()
    }

    // skipWaiting送信直前のチェックポイント。ここで再入力を検知したら
    // defer側へ戻り、同じチェックポイントを再試行する。
    const triggerSkipWaiting = () => {
      if (shouldContinueDeferring(document.activeElement, deferredMs)) {
        deferAgain(triggerSkipWaiting)
        return
      }

      showOverlay()

      // 新SWが制御を握ったら（このタイミングでも再チェックする）reload判定へ。
      // ただしvite-plugin-pwa自身がonNeedRefresh発火時に無条件reloadリスナーを
      // 先に登録済みのため、実際にはそちらが先に発火し本チェックは通らないことが
      // ほとんど（ベストエフォート。docs/architecture.md参照）
      navigator.serviceWorker.addEventListener('controllerchange', attemptReload, { once: true })

      updateSW(true)
        .then(() => {
          // フォールバック: 2秒以内にcontrollerchangeが来なければ強制的にreload判定へ
          // （こちらも上と同じ理由でベストエフォート）
          setTimeout(attemptReload, FALLBACK_RELOAD_MS)
        })
        .catch((e) => {
          console.error('SW update failed:', e)
          attemptReload()
        })
    }

    // 入力フォーム操作中は即reloadせず、フォーカスが外れるまで待つ
    const waitForIdle = () => {
      if (shouldContinueDeferring(document.activeElement, deferredMs)) {
        deferredMs += DEFER_CHECK_INTERVAL_MS
        setTimeout(waitForIdle, DEFER_CHECK_INTERVAL_MS)
        return
      }
      showOverlay()
      setTimeout(triggerSkipWaiting, OVERLAY_DELAY_MS)
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
