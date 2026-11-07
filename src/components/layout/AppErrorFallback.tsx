import { HeartCrack, RefreshCw } from 'lucide-react'
import { isRouteErrorResponse, useRouteError } from 'react-router'

import { Button } from '@/components/ui/Button'

export function AppErrorFallback() {
  const routeError = useRouteError()
  const message = isRouteErrorResponse(routeError)
    ? routeError.status === 404
      ? 'That page could not be found.'
      : 'The page could not be opened.'
    : 'Something unexpected happened while opening your shared space.'

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm rounded-card bg-card p-6 text-center shadow-soft">
        <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-primary text-white shadow-button">
          <HeartCrack className="size-5" aria-hidden="true" />
        </span>
        <h1 className="page-title-outlined mt-5 text-2xl font-semibold">
          We hit a little snag
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary" role="alert">
          {message}
        </p>
        <Button className="mt-5" onClick={() => window.location.reload()}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      </div>
    </main>
  )
}
