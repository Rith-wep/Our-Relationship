import { Button } from '@/components/ui/Button'

interface DataSectionErrorProps {
  message?: string
  onRetry: () => Promise<void>
}

export function DataSectionError({
  message = 'This section could not be loaded.',
  onRetry,
}: DataSectionErrorProps) {
  return (
    <div
      className="rounded-card border border-border bg-card px-5 py-6 text-center shadow-soft"
      role="alert"
    >
      <p className="text-sm text-text-secondary">{message}</p>
      <Button
        size="sm"
        variant="secondary"
        className="mt-3"
        onClick={() => void onRetry()}
      >
        Try again
      </Button>
    </div>
  )
}
