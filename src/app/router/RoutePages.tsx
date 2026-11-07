import { lazy, Suspense, type ReactNode } from 'react'

import { PageSkeleton } from '@/components/ui/PageSkeleton'

const CouplePage = lazy(() =>
  import('@/features/couple/CouplePage').then((module) => ({
    default: module.CouplePage,
  })),
)
const HomePage = lazy(() =>
  import('@/features/home/HomePage').then((module) => ({
    default: module.HomePage,
  })),
)
const LettersPage = lazy(() =>
  import('@/features/letters/LettersPage').then((module) => ({
    default: module.LettersPage,
  })),
)
const MemoriesPage = lazy(() =>
  import('@/features/memories/MemoriesPage').then((module) => ({
    default: module.MemoriesPage,
  })),
)
const TimelinePage = lazy(() =>
  import('@/features/timeline/TimelinePage').then((module) => ({
    default: module.TimelinePage,
  })),
)

const LoginPage = lazy(() =>
  import('@/features/auth/LoginPage').then((module) => ({
    default: module.LoginPage,
  })),
)
const RegisterPage = lazy(() =>
  import('@/features/auth/RegisterPage').then((module) => ({
    default: module.RegisterPage,
  })),
)
const ForgotPasswordPage = lazy(() =>
  import('@/features/auth/ForgotPasswordPage').then((module) => ({
    default: module.ForgotPasswordPage,
  })),
)
const ResetPasswordPage = lazy(() =>
  import('@/features/auth/ResetPasswordPage').then((module) => ({
    default: module.ResetPasswordPage,
  })),
)
const OnboardingPage = lazy(() =>
  import('@/features/onboarding/OnboardingPage').then((module) => ({
    default: module.OnboardingPage,
  })),
)

function RouteSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
}

export function HomeRoute() {
  return (
    <RouteSuspense>
      <HomePage />
    </RouteSuspense>
  )
}

export function TimelineRoute() {
  return (
    <RouteSuspense>
      <TimelinePage />
    </RouteSuspense>
  )
}

export function MemoriesRoute() {
  return (
    <RouteSuspense>
      <MemoriesPage />
    </RouteSuspense>
  )
}

export function LettersRoute() {
  return (
    <RouteSuspense>
      <LettersPage />
    </RouteSuspense>
  )
}

export function CoupleRoute() {
  return (
    <RouteSuspense>
      <CouplePage />
    </RouteSuspense>
  )
}

export function LoginRoute() {
  return (
    <RouteSuspense>
      <LoginPage />
    </RouteSuspense>
  )
}

export function RegisterRoute() {
  return (
    <RouteSuspense>
      <RegisterPage />
    </RouteSuspense>
  )
}

export function ForgotPasswordRoute() {
  return (
    <RouteSuspense>
      <ForgotPasswordPage />
    </RouteSuspense>
  )
}

export function ResetPasswordRoute() {
  return (
    <RouteSuspense>
      <ResetPasswordPage />
    </RouteSuspense>
  )
}

export function OnboardingRoute() {
  return (
    <RouteSuspense>
      <OnboardingPage />
    </RouteSuspense>
  )
}
