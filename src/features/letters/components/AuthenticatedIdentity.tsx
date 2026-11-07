import { UserRound } from 'lucide-react'

export function AuthenticatedIdentity({
  displayName,
  email,
}: {
  displayName: string
  email: string
}) {
  return (
    <section className="flex items-center gap-3 rounded-card border border-border-strong bg-card p-3 shadow-soft">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-button">
        <UserRound className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-text-muted">Writing as</p>
        <p className="truncate text-sm font-semibold text-text-primary">
          {displayName}
        </p>
        <p className="truncate text-xs text-text-secondary">{email}</p>
      </div>
    </section>
  )
}
