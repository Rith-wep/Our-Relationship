import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { X } from 'lucide-react'
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
} from 'react'
import { createPortal } from 'react-dom'

import { IconButton } from '@/components/ui/IconButton'

interface MemoryDialogProps {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
  size?: 'sheet' | 'compact' | 'viewer' | 'detail' | 'letter'
}

const sizeStyles = {
  sheet:
    'm-auto max-h-[min(90dvh,48rem)] w-[calc(100%-2rem)] max-w-app rounded-card',
  compact: 'm-auto w-[calc(100%-2rem)] max-w-sm rounded-card',
  viewer:
    'm-auto h-full w-full bg-dark text-on-dark sm:h-auto sm:max-h-[92dvh] sm:max-w-3xl sm:rounded-card',
  detail:
    'm-0 h-full w-full max-w-app sm:m-auto sm:h-[min(92dvh,50rem)] sm:rounded-card',
  letter:
    'm-0 h-full w-full max-w-app bg-card sm:m-auto sm:h-[min(92dvh,50rem)] sm:rounded-card',
} as const

const focusableSelector = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function MemoryDialog({
  open,
  title,
  description,
  children,
  onClose,
  size = 'sheet',
}: MemoryDialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (!open) return

    returnFocusRef.current = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const frame = requestAnimationFrame(() => {
      const firstFocusable =
        panelRef.current?.querySelector<HTMLElement>(focusableSelector)
      firstFocusable?.focus()
    })

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleEscape)
      returnFocusRef.current?.focus()
    }
  }, [onClose, open])

  const handleFocusTrap = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return

    const focusable = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
    )
    if (focusable.length === 0) {
      event.preventDefault()
      return
    }

    const first = focusable[0]
    const last = focusable.at(-1)

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex bg-black/45"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.16 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose()
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            onKeyDown={handleFocusTrap}
            className={[
              'relative overflow-hidden bg-card shadow-shell',
              sizeStyles[size],
            ].join(' ')}
            initial={
              shouldReduceMotion
                ? false
                : size === 'sheet'
                  ? { opacity: 0, y: 12, scale: 0.985 }
                  : { opacity: 0, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : size === 'sheet'
                  ? { opacity: 0, y: 10, scale: 0.985 }
                  : { opacity: 0, scale: 0.98 }
            }
            transition={{
              duration: shouldReduceMotion ? 0 : 0.18,
              ease: 'easeOut',
            }}
          >
            {size === 'viewer' || size === 'letter' ? (
              <div className="sr-only">
                <h2 id={titleId}>{title}</h2>
                {description ? <p id={descriptionId}>{description}</p> : null}
              </div>
            ) : (
              <div className="flex items-start gap-3 border-b border-border px-5 py-4">
                <div className="min-w-0 flex-1">
                  <h2
                    id={titleId}
                    className="text-lg font-semibold text-text-primary"
                  >
                    {title}
                  </h2>
                  {description ? (
                    <p id={descriptionId} className="sr-only">
                      {description}
                    </p>
                  ) : null}
                </div>
                <IconButton
                  label="Close dialog"
                  onClick={onClose}
                  className="-m-2"
                >
                  <X aria-hidden="true" className="size-5" />
                </IconButton>
              </div>
            )}
            {size === 'viewer' ? (
              <IconButton
                label="Close photo preview"
                onClick={onClose}
                className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 z-10 bg-black/55 text-white hover:bg-black/70 hover:text-white"
              >
                <X aria-hidden="true" className="size-5" />
              </IconButton>
            ) : null}
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
