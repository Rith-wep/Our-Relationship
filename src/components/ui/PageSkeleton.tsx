interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-primary-soft motion-reduce:animate-none ${className}`}
    />
  )
}

export function PageSkeleton({ fullscreen = false }: { fullscreen?: boolean }) {
  const content = (
    <div
      className="mx-auto w-full max-w-content px-5 pt-app-safe pb-8"
      role="status"
      aria-label="Loading page"
    >
      <span className="sr-only">Loading page</span>
      <div className="flex items-center justify-between gap-4 py-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="size-10 rounded-full" />
      </div>

      <div className="mt-6 space-y-4">
        <Skeleton className="h-36 w-full rounded-card" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24 rounded-card" />
          <Skeleton className="h-24 rounded-card" />
        </div>
        <Skeleton className="h-28 w-full rounded-card" />
        <Skeleton className="h-20 w-full rounded-card" />
      </div>
    </div>
  )

  if (fullscreen) {
    return (
      <main className="min-h-dvh bg-background" aria-busy="true">
        {content}
      </main>
    )
  }

  return <div aria-busy="true">{content}</div>
}
