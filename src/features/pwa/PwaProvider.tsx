import { useRegisterSW } from 'virtual:pwa-register/react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { PwaContext } from '@/features/pwa/pwa-context'
import { OfflineBanner } from '@/features/pwa/OfflineBanner'
import { PwaUpdatePrompt } from '@/features/pwa/PwaUpdatePrompt'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true)
  )
}

export function PwaProvider({ children }: { children: ReactNode }) {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(isStandalone)
  const [online, setOnline] = useState(() => window.navigator.onLine)
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({ immediate: true })

  useEffect(() => {
    const capturePrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }
    const markInstalled = () => {
      setInstallPrompt(null)
      setInstalled(true)
    }

    window.addEventListener('beforeinstallprompt', capturePrompt)
    window.addEventListener('appinstalled', markInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', capturePrompt)
      window.removeEventListener('appinstalled', markInstalled)
    }
  }, [])

  useEffect(() => {
    const markOnline = () => setOnline(true)
    const markOffline = () => setOnline(false)
    window.addEventListener('online', markOnline)
    window.addEventListener('offline', markOffline)
    return () => {
      window.removeEventListener('online', markOnline)
      window.removeEventListener('offline', markOffline)
    }
  }, [])

  const value = useMemo(
    () => ({
      canInstall: Boolean(installPrompt) && !installed,
      isInstalled: installed,
      isOnline: online,
      install: async () => {
        if (!installPrompt) return false
        await installPrompt.prompt()
        const choice = await installPrompt.userChoice
        setInstallPrompt(null)
        if (choice.outcome === 'accepted') setInstalled(true)
        return choice.outcome === 'accepted'
      },
    }),
    [installPrompt, installed, online],
  )

  return (
    <PwaContext value={value}>
      {children}
      <OfflineBanner visible={!online} />
      <PwaUpdatePrompt
        open={needRefresh}
        onLater={() => setNeedRefresh(false)}
        onUpdate={() => void updateServiceWorker(true)}
      />
    </PwaContext>
  )
}
