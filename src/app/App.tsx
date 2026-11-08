import { RouterProvider } from 'react-router'

import { ThemeInitializer } from '@/components/layout/ThemeToggle'
import { CoupleProvider } from '@/app/providers/CoupleProvider'
import { LettersProvider } from '@/app/providers/LettersProvider'
import { MemoriesProvider } from '@/app/providers/MemoriesProvider'
import { router } from '@/app/router'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { CoupleSessionProvider } from '@/features/onboarding/CoupleSessionProvider'
import { PwaProvider } from '@/features/pwa/PwaProvider'

export function App() {
  return (
    <PwaProvider>
      <AuthProvider>
        <ThemeInitializer />
        <CoupleSessionProvider>
          <CoupleProvider>
            <LettersProvider>
              <MemoriesProvider>
                <RouterProvider router={router} />
              </MemoriesProvider>
            </LettersProvider>
          </CoupleProvider>
        </CoupleSessionProvider>
      </AuthProvider>
    </PwaProvider>
  )
}
