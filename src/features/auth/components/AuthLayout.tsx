import { Heart } from 'lucide-react'
import type { ReactNode } from 'react'

export function AuthLayout({
  eyebrow,
  title,
  titleClassName = '',
  description,
  children,
}: {
  eyebrow: string
  title: string
  titleClassName?: string
  description?: string
  children: ReactNode
}) {
  return (
    <main className="min-h-dvh bg-background px-5 pt-app-safe pb-8">
      <div className="mx-auto w-full max-w-sm">
        <div className="flex size-11 items-center justify-center rounded-full bg-primary text-white shadow-button">
          <Heart className="size-5 fill-current" aria-hidden="true" />
        </div>
        <p className="mt-7 text-xs font-semibold tracking-wide text-primary uppercase">
          {eyebrow}
        </p>
        <h1
          className={`page-title-outlined mt-2 text-3xl font-semibold tracking-[-0.03em] ${titleClassName}`}
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {description}
          </p>
        ) : null}
        <div className="mt-7 rounded-card border border-border-strong bg-card p-5 shadow-soft">
          {children}
        </div>
      </div>
    </main>
  )
}
