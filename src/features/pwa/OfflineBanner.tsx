import { WifiOff } from 'lucide-react'

export function OfflineBanner({ visible }: { visible: boolean }) {
  if (!visible) return null

  return (
    <div
      className="fixed top-[max(0.75rem,env(safe-area-inset-top))] right-4 left-4 z-[90] mx-auto flex min-h-11 max-w-sm items-center justify-center gap-2 rounded-control border border-border-strong bg-card px-4 text-center text-sm font-semibold text-text-primary shadow-shell"
      role="status"
      aria-live="polite"
    >
      <WifiOff aria-hidden="true" className="size-4 text-primary" />
      You’re offline. Changes need a connection.
    </div>
  )
}
