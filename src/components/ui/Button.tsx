import type { ComponentProps, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md'

interface ButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'border border-border bg-primary text-white shadow-button hover:bg-primary-strong',
  secondary:
    'border border-border-strong bg-card text-text-primary hover:bg-surface',
  ghost:
    'bg-transparent text-text-secondary hover:bg-surface hover:text-text-primary',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-3.5 text-sm',
  md: 'min-h-11 px-4 text-sm',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  type = 'button',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-control font-semibold',
        'transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.98] motion-reduce:transition-none',
        'disabled:pointer-events-none disabled:opacity-50',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
