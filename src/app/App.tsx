import { RouterProvider } from 'react-router'

import { MemoriesProvider } from '@/app/providers/MemoriesProvider'
import { router } from '@/app/router'

export function App() {
  return (
    <MemoriesProvider>
      <RouterProvider router={router} />
    </MemoriesProvider>
  )
}
