import { Heart } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Outlet, useLocation } from 'react-router'

import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { useCouple } from '@/app/providers/useCouple'
import { useLetters } from '@/app/providers/useLetters'
import { useMemories } from '@/app/providers/useMemories'
import { Button } from '@/components/ui/Button'

export function AppShell() {
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()
  const couple = useCouple()
  const memories = useMemories()
  const letters = useLetters()
  const loading = couple.loading || memories.loading || letters.loading
  const error = couple.error ?? memories.error ?? letters.error

  return (
    <div className="flex min-h-dvh justify-center bg-app-surround sm:p-4 lg:p-6">
      <div className="relative h-dvh w-full max-w-app overflow-hidden bg-background sm:h-[calc(100dvh-2rem)] sm:rounded-app-shell sm:border sm:border-border sm:shadow-shell lg:h-[calc(100dvh-3rem)]">
        <main
          id="main-content"
          className="h-full overflow-x-hidden overflow-y-auto overscroll-y-contain px-5 pt-app-safe pb-app-nav [scrollbar-gutter:stable]"
        >
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
                <div
                  className="flex min-h-[70dvh] items-center justify-center text-center"
                  role="status"
                >
                  <div>
                    <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-primary text-white shadow-button">
                      <Heart
                        className="size-5 fill-current"
                        aria-hidden="true"
                      />
                    </span>
                    <p className="mt-3 text-sm text-text-secondary">
                      Loading your shared space…
                    </p>
                  </div>
                </div>
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
