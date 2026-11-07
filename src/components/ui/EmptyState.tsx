import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-4 py-8 text-center">
      {icon ? (
        <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-primary text-white shadow-button">
          {icon}
        </div>
      ) : null}
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
