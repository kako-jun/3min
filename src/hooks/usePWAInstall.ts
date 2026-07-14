import { useState, useEffect, useCallback } from 'react'
import { isInstallPromptSuppressed, type BeforeInstallPromptEvent } from '../lib/pwaInstall'
import { loadPWAInstallDismissedAt, savePWAInstallDismissedAt } from '../lib/storage'

interface UsePWAInstallReturn {
  /** バナーを表示してよいか（プロンプト取得済み・未却下・未インストール・却下状態の読み込み完了） */
  canInstall: boolean
  promptInstall: () => Promise<'accepted' | 'dismissed' | null>
  dismiss: () => void
}

export function usePWAInstall(): UsePWAInstallReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [dismissedLoaded, setDismissedLoaded] = useState(false)

  useEffect(() => {
    // 既にインストール済み（standalone表示）なら何もしない
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    if (isStandalone) {
      setIsInstalled(true)
      return
    }

    // 却下記憶をIndexedDBから読み込む（オンボーディングdismissedと同じ方式）
    loadPWAInstallDismissedAt()
      .then((dismissedAt) => {
        setIsDismissed(isInstallPromptSuppressed(dismissedAt))
      })
      .catch(() => {
        // 読み込み失敗時は抑制せず表示する
      })
      .finally(() => setDismissedLoaded(true))

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | null> => {
    if (!deferredPrompt) return null
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      setDeferredPrompt(null)
      return outcome
    } catch {
      return null
    }
  }, [deferredPrompt])

  const dismiss = useCallback(() => {
    setIsDismissed(true)
    savePWAInstallDismissedAt(Date.now()).catch(() => {})
  }, [])

  return {
    canInstall: dismissedLoaded && !!deferredPrompt && !isDismissed && !isInstalled,
    promptInstall,
    dismiss,
  }
}
