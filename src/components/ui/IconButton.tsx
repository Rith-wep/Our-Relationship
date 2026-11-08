import type { ComponentProps, ReactNode } from 'react'

interface IconButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  label: string
  children: ReactNode
}

export function IconButton({
  label,
  children,
  className = '',
  type = 'button',
  disabled,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      disabled={disabled}
      className={[
        'inline-flex size-11 shrink-0 items-center justify-center rounded-full text-text-secondary',
        'transition-[color,background-color,transform] duration-150 hover:bg-surface hover:text-text-primary active:scale-[0.94] motion-reduce:transition-none',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
