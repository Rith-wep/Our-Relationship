import { createBrowserRouter } from 'react-router'

import {
  CoupleRoute,
  ForgotPasswordRoute,
  HomeRoute,
  LettersRoute,
  LoginRoute,
  MemoriesRoute,
  OnboardingRoute,
  RegisterRoute,
  ResetPasswordRoute,
  TimelineRoute,
} from '@/app/router/RoutePages'
import { AppShell } from '@/components/layout/AppShell'
import { AppErrorFallback } from '@/components/layout/AppErrorFallback'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { CoupleOnboardingGate } from '@/features/onboarding/CoupleOnboardingGate'

export const router = createBrowserRouter([
  { path: 'login', element: <LoginRoute /> },
  { path: 'register', element: <RegisterRoute /> },
  { path: 'forgot-password', element: <ForgotPasswordRoute /> },
  { path: 'reset-password', element: <ResetPasswordRoute /> },
  {
    element: <ProtectedRoute />,
    errorElement: <AppErrorFallback />,
    children: [
      {
        element: <CoupleOnboardingGate />,
        children: [
          { path: 'onboarding', element: <OnboardingRoute /> },
          { path: 'join/:inviteToken', element: <OnboardingRoute /> },
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
        ],
      },
    ],
  },
])
