import { motion, useReducedMotion } from 'motion/react'
import type { ComponentProps, ReactNode } from 'react'

interface IconButtonProps extends Omit<
  ComponentProps<typeof motion.button>,
  'children'
> {
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
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.button
      type={type}
      aria-label={label}
      disabled={disabled}
      whileTap={shouldReduceMotion || disabled ? undefined : { scale: 0.94 }}
      transition={{ duration: 0.1 }}
      className={[
        'inline-flex size-11 shrink-0 items-center justify-center rounded-full text-text-secondary',
        'transition-colors duration-150 hover:bg-surface hover:text-text-primary motion-reduce:transition-none',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </motion.button>
  )
}
