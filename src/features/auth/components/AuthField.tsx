import type { ComponentProps } from 'react'

export function AuthField({
  label,
  ...props
}: ComponentProps<'input'> & { label: string }) {
  const id = props.id ?? props.name
  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-medium text-text-primary">{label}</span>
      <input
        {...props}
        id={id}
        className="mt-2 min-h-11 w-full rounded-control border border-border-strong bg-card px-3.5 text-base text-text-primary placeholder:text-text-muted disabled:opacity-60"
      />
    </label>
  )
}
