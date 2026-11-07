import { RouterProvider } from 'react-router'

import { CoupleProvider } from '@/app/providers/CoupleProvider'
import { LettersProvider } from '@/app/providers/LettersProvider'
import { MemoriesProvider } from '@/app/providers/MemoriesProvider'
import { router } from '@/app/router'

export function App() {
  return (
    <CoupleProvider>
      <LettersProvider>
        <MemoriesProvider>
          <RouterProvider router={router} />
        </MemoriesProvider>
      </LettersProvider>
    </CoupleProvider>
  )
}
