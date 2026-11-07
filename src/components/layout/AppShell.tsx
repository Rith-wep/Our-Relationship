import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Outlet, useLocation } from 'react-router'

import { BottomNavigation } from '@/components/layout/BottomNavigation'

export function AppShell() {
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()

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
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        <BottomNavigation />
      </div>
    </div>
  )
}
