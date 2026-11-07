import { Heart } from 'lucide-react'
import { Navigate, Outlet, useLocation } from 'react-router'

import { useAuth } from '@/features/auth/useAuth'

export function ProtectedRoute() {
  const auth = useAuth()
  const location = useLocation()

  if (auth.loading) {
    return (
      <main
        className="flex min-h-dvh items-center justify-center bg-background"
        role="status"
      >
        <div className="text-center">
          <Heart
            className="mx-auto size-6 fill-current text-primary"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm text-text-secondary">
            Opening your space…
          </p>
        </div>
      </main>
    )
  }

  if (!auth.session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  return <Outlet />
}
