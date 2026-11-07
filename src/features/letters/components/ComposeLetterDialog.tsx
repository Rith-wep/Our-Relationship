import { Send } from 'lucide-react'
import { type FormEvent, useId, useRef, useState } from 'react'

import { Button } from '@/components/ui/Button'
import type {
  LetterDraftInput,
  LoveLetter,
  PartnerId,
} from '@/features/letters/types'
import { MemoryDialog } from '@/features/timeline/components/MemoryDialog'

interface ComposeLetterDialogProps {
  open: boolean
  letter?: LoveLetter
  senderId: PartnerId
  recipientId: PartnerId
  recipientName: string
  onClose: () => void
  onSaveDraft: (input: LetterDraftInput) => void
  onSend: (input: LetterDraftInput) => void
}

interface FormErrors {
  title?: string
  body?: string
}

const fieldStyles =
  'w-full rounded-control border border-border-strong bg-card px-3.5 text-base text-text-primary placeholder:text-text-muted'

export function ComposeLetterDialog({
  open,
  letter,
  senderId,
  recipientId,
  recipientName,
  onClose,
  onSaveDraft,
  onSend,
}: ComposeLetterDialogProps) {
  const formId = useId()
  const [title, setTitle] = useState(letter?.title ?? '')
  const [body, setBody] = useState(letter?.body ?? '')
  const [errors, setErrors] = useState<FormErrors>({})
  const submittedRef = useRef(false)
  const dirty = title !== (letter?.title ?? '') || body !== (letter?.body ?? '')

  const requestClose = () => {
    if (dirty && !submittedRef.current) {
      const discard = window.confirm('Discard your unsaved changes?')
      if (!discard) return
    }
    onClose()
  }

  const buildInput = (): LetterDraftInput => ({
    title: title.trim(),
    body: body.trim(),
    senderId,
    recipientId,
  })

  const validateTitle = () => {
    if (title.trim()) return true
    setErrors({ title: 'Give this letter a title.' })
    return false
  }

  const handleSaveDraft = () => {
    if (!validateTitle() || submittedRef.current) return
    submittedRef.current = true
    onSaveDraft(buildInput())
  }

  const handleSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: FormErrors = {}
    if (!title.trim()) nextErrors.title = 'Give this letter a title.'
    if (!body.trim())
      nextErrors.body = 'Write something before sending your letter.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || submittedRef.current) return

    submittedRef.current = true
    onSend(buildInput())
  }

  return (
    <MemoryDialog
      open={open}
      title={letter ? 'Edit draft' : 'Write a love letter'}
      description={`A private note for ${recipientName}.`}
      onClose={requestClose}
      size="detail"
    >
      <form
        onSubmit={handleSend}
        noValidate
        className="flex h-[calc(100%-4.75rem)] flex-col"
      >
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div>
            <label
              htmlFor={`${formId}-recipient`}
              className="mb-1.5 block text-sm font-medium text-text-primary"
            >
              To
            </label>
            <input
              id={`${formId}-recipient`}
              value={recipientName}
              readOnly
              className={`${fieldStyles} min-h-11 bg-surface text-text-secondary`}
            />
          </div>

          <div>
            <label
              htmlFor={`${formId}-title`}
              className="mb-1.5 block text-sm font-medium text-text-primary"
            >
              Title{' '}
              <span aria-hidden="true" className="text-primary">
                *
              </span>
            </label>
            <input
              id={`${formId}-title`}
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
                if (errors.title)
                  setErrors((current) => ({ ...current, title: undefined }))
              }}
              maxLength={120}
              autoComplete="off"
              placeholder="What is on your heart?"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={
                errors.title ? `${formId}-title-error` : undefined
              }
              className={`${fieldStyles} min-h-11`}
            />
            {errors.title ? (
              <p
                id={`${formId}-title-error`}
                className="mt-1.5 text-xs text-primary"
              >
                {errors.title}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor={`${formId}-body`}
              className="mb-1.5 block text-sm font-medium text-text-primary"
            >
              Letter{' '}
              <span className="font-normal text-text-muted">
                (required to send)
              </span>
            </label>
            <textarea
              id={`${formId}-body`}
              value={body}
              onChange={(event) => {
                setBody(event.target.value)
                if (errors.body)
                  setErrors((current) => ({ ...current, body: undefined }))
              }}
              maxLength={5000}
              rows={12}
              placeholder="Take your time. This space is yours…"
              aria-invalid={Boolean(errors.body)}
              aria-describedby={
                errors.body ? `${formId}-body-error` : undefined
              }
              className={`${fieldStyles} min-h-64 resize-y py-3.5 leading-7`}
            />
            <div className="mt-1 flex items-start justify-between gap-3">
              {errors.body ? (
                <p id={`${formId}-body-error`} className="text-xs text-primary">
                  {errors.body}
                </p>
              ) : (
                <span />
              )}
              <p className="shrink-0 text-xs text-text-muted">
                {body.length}/5000
              </p>
            </div>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-3 gap-2 border-t border-border bg-card px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button variant="ghost" onClick={requestClose}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={handleSaveDraft}>
            Save Draft
          </Button>
          <Button type="submit">
            <Send aria-hidden="true" className="size-4" />
            Send
          </Button>
        </div>
      </form>
    </MemoryDialog>
  )
}
