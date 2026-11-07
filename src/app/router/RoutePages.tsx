import { lazy, Suspense, type ReactNode } from 'react'

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

function RouteSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-48 items-center justify-center"
          role="status"
        >
          <span className="text-sm text-text-secondary">Loading…</span>
        </div>
      }
    >
      {children}
    </Suspense>
  )
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
