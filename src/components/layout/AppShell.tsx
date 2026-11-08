import { WifiOff } from 'lucide-react'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'

import { useCouple } from '@/app/providers/useCouple'
import { useLetters } from '@/app/providers/useLetters'
import { useMemories } from '@/app/providers/useMemories'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { useAuth } from '@/features/auth/useAuth'
import { applyBackgroundPreference } from '@/features/couple/backgrounds'
import { usePwa } from '@/features/pwa/usePwa'

export function AppShell() {
  const location = useLocation()
  const auth = useAuth()
  const couple = useCouple()
  const memories = useMemories()
  const letters = useLetters()
  const pwa = usePwa()
  const reconnecting = [
    couple.realtimeState,
    memories.realtimeState,
    letters.realtimeState,
  ].includes('reconnecting')
  const unreadLetterCount = letters.letters.filter(
    (letter) =>
      letter.status === 'sent' &&
      letter.recipientId === auth.user?.id &&
      !letter.readAt &&
      !letter.deletedAt,
  ).length

  useEffect(() => {
    applyBackgroundPreference(couple.profile.background)
  }, [couple.profile.background])

  return (
    <div className="flex min-h-dvh justify-center bg-app-surround sm:p-4 lg:p-6">
      <div className="relative h-dvh w-full max-w-app overflow-hidden bg-background sm:h-[calc(100dvh-2rem)] sm:rounded-app-shell sm:border sm:border-border sm:shadow-shell lg:h-[calc(100dvh-3rem)]">
        <main
          id="main-content"
          className="h-full overflow-x-hidden overflow-y-auto overscroll-y-contain px-5 pt-app-safe pb-app-nav [scrollbar-gutter:stable]"
        >
          {reconnecting && pwa.isOnline ? (
            <div
              className="sticky top-0 z-20 mb-3 flex min-h-10 items-center justify-center gap-2 rounded-control bg-primary-soft px-3 text-xs font-semibold text-primary-strong shadow-soft"
              role="status"
            >
              <WifiOff aria-hidden="true" className="size-4" />
              Reconnecting sync…
            </div>
          ) : null}
          <div
            key={location.pathname}
            className="route-enter mx-auto min-h-full w-full max-w-content"
          >
            <Outlet />
          </div>
        </main>

        <BottomNavigation unreadLetters={unreadLetterCount} />
      </div>
    </div>
  )
}
