import { Heart } from 'lucide-react'

export function AppLaunchScreen() {
  return (
    <main
      className="flex min-h-dvh items-center justify-center bg-background px-6"
      aria-busy="true"
    >
      <div
        className="flex -translate-y-8 flex-col items-center text-center"
        role="status"
        aria-label="Opening Our Little Universe"
      >
        <div className="launch-heart flex size-16 items-center justify-center rounded-full bg-primary text-white shadow-button">
          <Heart aria-hidden="true" className="size-8 fill-current" />
        </div>

        <p className="mt-6 text-xs font-bold tracking-[0.18em] text-primary uppercase">
          A private place for two
        </p>
        <h1 className="font-romantic mt-2 text-4xl leading-tight font-bold text-primary">
          Our Little Universe
        </h1>

        <div className="mt-8 flex items-center gap-1.5" aria-hidden="true">
          <span className="launch-dot size-2 rounded-full bg-primary" />
          <span className="launch-dot size-2 rounded-full bg-primary [animation-delay:150ms]" />
          <span className="launch-dot size-2 rounded-full bg-primary [animation-delay:300ms]" />
        </div>
        <span className="sr-only">Opening your private space</span>
      </div>
    </main>
  )
}
