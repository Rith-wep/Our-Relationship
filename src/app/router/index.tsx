import { createBrowserRouter } from 'react-router'

import { AppShell } from '@/components/layout/AppShell'
import { CouplePage } from '@/features/couple/CouplePage'
import { HomePage } from '@/features/home/HomePage'
import { LettersPage } from '@/features/letters/LettersPage'
import { MemoriesPage } from '@/features/memories/MemoriesPage'
import { TimelinePage } from '@/features/timeline/TimelinePage'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'timeline', element: <TimelinePage /> },
      { path: 'memories', element: <MemoriesPage /> },
      { path: 'letters', element: <LettersPage /> },
      { path: 'us', element: <CouplePage /> },
    ],
  },
])
