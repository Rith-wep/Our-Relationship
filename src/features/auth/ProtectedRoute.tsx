import { Navigate, Outlet, useLocation } from 'react-router'

import { AppLaunchScreen } from '@/components/layout/AppLaunchScreen'
import { useAuth } from '@/features/auth/useAuth'

export function ProtectedRoute() {
  const auth = useAuth()
  const location = useLocation()

  if (auth.loading) {
    return <AppLaunchScreen />
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
