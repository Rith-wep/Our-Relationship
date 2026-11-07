import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0">
        <h1 className="page-title-outlined text-[1.75rem] leading-9 font-semibold tracking-[-0.02em]">
          {title}
        </h1>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  )
}
