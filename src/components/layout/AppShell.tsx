import { WifiOff } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'

import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { useCouple } from '@/app/providers/useCouple'
import { useLetters } from '@/app/providers/useLetters'
import { useMemories } from '@/app/providers/useMemories'
import { Button } from '@/components/ui/Button'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { applyBackgroundPreference } from '@/features/couple/backgrounds'

export function AppShell() {
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()
  const couple = useCouple()
  const memories = useMemories()
  const letters = useLetters()
  const loading = couple.loading || memories.loading || letters.loading
  const error = couple.error ?? memories.error ?? letters.error
  const reconnecting = [
    couple.realtimeState,
    memories.realtimeState,
    letters.realtimeState,
  ].includes('reconnecting')

  useEffect(() => {
    void Promise.all([
      import('@/features/home/HomePage'),
      import('@/features/timeline/TimelinePage'),
      import('@/features/memories/MemoriesPage'),
      import('@/features/letters/LettersPage'),
      import('@/features/couple/CouplePage'),
    ])
  }, [])

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
          {reconnecting ? (
            <div
              className="sticky top-0 z-20 mb-3 flex min-h-10 items-center justify-center gap-2 rounded-control bg-primary-soft px-3 text-xs font-semibold text-primary-strong shadow-soft"
              role="status"
            >
              <WifiOff aria-hidden="true" className="size-4" />
              Reconnecting sync…
            </div>
          ) : null}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -3 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.18,
                ease: 'easeOut',
              }}
              className="mx-auto min-h-full w-full max-w-content"
            >
              {loading ? (
                <PageSkeleton />
              ) : error ? (
                <div className="flex min-h-[70dvh] items-center justify-center">
                  <div className="w-full rounded-card bg-card p-5 text-center shadow-soft">
                    <h1 className="page-title-outlined text-xl font-semibold">
                      We couldn’t load your data
                    </h1>
                    <p
                      className="mt-2 text-sm leading-6 text-text-secondary"
                      role="alert"
                    >
                      {error}
                    </p>
                    <Button
                      className="mt-5"
                      onClick={() => {
                        void Promise.all([
                          couple.retry(),
                          memories.retry(),
                          letters.retry(),
                        ])
                      }}
                    >
                      Try again
                    </Button>
                  </div>
                </div>
              ) : (
                <Outlet />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <BottomNavigation />
      </div>
    </div>
  )
}
