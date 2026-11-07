import { motion, useReducedMotion } from 'motion/react'
import type { ComponentProps, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md'

interface ButtonProps extends Omit<
  ComponentProps<typeof motion.button>,
  'children'
> {
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
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileTap={shouldReduceMotion || disabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.1 }}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-control font-semibold',
        'transition-colors duration-150 motion-reduce:transition-none',
        'disabled:pointer-events-none disabled:opacity-50',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </motion.button>
  )
}
