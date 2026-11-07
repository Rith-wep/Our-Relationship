import { RouterProvider } from 'react-router'

import { CoupleProvider } from '@/app/providers/CoupleProvider'
import { LettersProvider } from '@/app/providers/LettersProvider'
import { MemoriesProvider } from '@/app/providers/MemoriesProvider'
import { router } from '@/app/router'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { CoupleSessionProvider } from '@/features/onboarding/CoupleSessionProvider'

export function App() {
  return (
    <AuthProvider>
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
  )
}
