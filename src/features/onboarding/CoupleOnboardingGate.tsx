import { Navigate, Outlet, useLocation } from 'react-router'

import { AppLaunchScreen } from '@/components/layout/AppLaunchScreen'
import { useCoupleSession } from '@/features/onboarding/useCoupleSession'

export function CoupleOnboardingGate() {
  const session = useCoupleSession()
  const location = useLocation()
  const isOnboardingPath =
    location.pathname === '/onboarding' ||
    location.pathname.startsWith('/join/')

  if (session.loading) {
    return <AppLaunchScreen />
  }

  if (session.error) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background px-5">
        <div className="w-full max-w-sm rounded-card border border-border-strong bg-card p-5 text-center shadow-soft">
          <h1 className="page-title-outlined text-xl font-semibold">
            We couldn’t open your space
          </h1>
          <p
            className="mt-2 text-sm leading-6 text-text-secondary"
            role="alert"
          >
            {session.error}
          </p>
          <button
            type="button"
            className="mt-5 min-h-11 rounded-control bg-primary px-4 text-sm font-semibold text-text-primary"
            onClick={() => void session.refresh()}
          >
            Try again
          </button>
        </div>
      </main>
    )
  }

  if (!session.couple) {
    const destination = `${location.pathname}${location.search}`
    return isOnboardingPath ? (
      <Outlet />
    ) : (
      <Navigate
        to={`/onboarding?next=${encodeURIComponent(destination)}`}
        replace
      />
    )
  }

  if (isOnboardingPath) return <Navigate to="/" replace />
  return <Outlet />
}
