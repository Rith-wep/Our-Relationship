import { createBrowserRouter } from 'react-router'

import {
  CoupleRoute,
  HomeRoute,
  LettersRoute,
  MemoriesRoute,
  TimelineRoute,
} from '@/app/router/RoutePages'
import { AppShell } from '@/components/layout/AppShell'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <HomeRoute /> },
      { path: 'timeline', element: <TimelineRoute /> },
      { path: 'memories', element: <MemoriesRoute /> },
      { path: 'letters', element: <LettersRoute /> },
      { path: 'us', element: <CoupleRoute /> },
    ],
  },
])
