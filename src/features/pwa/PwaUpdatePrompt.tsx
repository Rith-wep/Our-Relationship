import { RefreshCw, X } from 'lucide-react'

import { Button } from '@/components/ui/Button'

export function PwaUpdatePrompt({
  open,
  onLater,
  onUpdate,
}: {
  open: boolean
  onLater: () => void
  onUpdate: () => void
}) {
  if (!open) return null

  return (
    <aside
      aria-labelledby="pwa-update-title"
      className="fixed right-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] left-4 z-[80] mx-auto max-w-sm rounded-card border border-border-strong bg-card p-4 text-text-primary shadow-shell"
      role="status"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-button">
          <RefreshCw aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="pwa-update-title" className="font-semibold">
            A new version is ready
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Update when you have finished editing.
          </p>
        </div>
        <button
          type="button"
          aria-label="Update later"
          onClick={onLater}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-text-secondary hover:bg-surface"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>
      <div className="mt-4 flex gap-3">
        <Button variant="secondary" fullWidth onClick={onLater}>
          Later
        </Button>
        <Button fullWidth onClick={onUpdate}>
          Update now
        </Button>
      </div>
    </aside>
  )
}
