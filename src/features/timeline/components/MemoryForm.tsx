import { ImagePlus, Trash2 } from 'lucide-react'
import { type FormEvent, useId, useState } from 'react'

import { Button } from '@/components/ui/Button'
import {
  milestoneTypes,
  type MemoryDraft,
  type MilestoneType,
  type TimelineMemory,
} from '@/features/timeline/types'

interface MemoryFormProps {
  memory?: TimelineMemory
  onCancel: () => void
  onSave: (draft: MemoryDraft) => void | Promise<void>
  uploading?: boolean
  uploadProgress?: number
}

interface FormErrors {
  title?: string
  date?: string
}

const milestoneLabels: Record<MilestoneType, string> = {
  first_meeting: 'First meeting',
  first_conversation: 'First conversation',
  first_date: 'First date',
  relationship_started: 'Relationship started',
  anniversary: 'Anniversary',
  special_memory: 'Special memory',
  custom_event: 'Custom event',
}

const inputStyles =
  'min-h-11 w-full rounded-control border border-border-strong bg-card px-3.5 text-base text-text-primary placeholder:text-text-muted'

export function MemoryForm({
  memory,
  onCancel,
  onSave,
  uploading = false,
  uploadProgress = 0,
}: MemoryFormProps) {
  const formId = useId()
  const [title, setTitle] = useState(memory?.title ?? '')
  const [date, setDate] = useState(memory?.date ?? '')
  const [milestoneType, setMilestoneType] = useState<MilestoneType>(
    memory?.milestoneType ?? 'special_memory',
  )
  const [description, setDescription] = useState(memory?.description ?? '')
  const [errors, setErrors] = useState<FormErrors>({})
  const [mediaFile, setMediaFile] = useState<File>()
  const [removeMedia, setRemoveMedia] = useState(false)
  const [mediaError, setMediaError] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: FormErrors = {}

    if (!title.trim()) nextErrors.title = 'Enter a title for this memory.'
    if (!date) nextErrors.date = 'Choose the date this memory happened.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    void onSave({
      title: title.trim(),
      date,
      milestoneType,
      description: description.trim(),
      mediaFile,
      removeMedia,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex max-h-[calc(90dvh-5.5rem)] flex-col"
    >
      <div className="space-y-5 overflow-y-auto px-5 py-5">
        <div>
          <label
            htmlFor={`${formId}-title`}
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            Memory title{' '}
            <span aria-hidden="true" className="text-primary">
              *
            </span>
          </label>
          <input
            id={`${formId}-title`}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={
              errors.title ? `${formId}-title-error` : undefined
            }
            autoComplete="off"
            maxLength={100}
            placeholder="A moment worth remembering"
            className={inputStyles}
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

        <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2">
          <div>
            <label
              htmlFor={`${formId}-date`}
              className="mb-1.5 block text-sm font-medium text-text-primary"
            >
              Date{' '}
              <span aria-hidden="true" className="text-primary">
                *
              </span>
            </label>
            <input
              id={`${formId}-date`}
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              aria-invalid={Boolean(errors.date)}
              aria-describedby={
                errors.date ? `${formId}-date-error` : undefined
              }
              className={inputStyles}
            />
            {errors.date ? (
              <p
                id={`${formId}-date-error`}
                className="mt-1.5 text-xs text-primary"
              >
                {errors.date}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor={`${formId}-type`}
              className="mb-1.5 block text-sm font-medium text-text-primary"
            >
              Milestone
            </label>
            <select
              id={`${formId}-type`}
              value={milestoneType}
              onChange={(event) =>
                setMilestoneType(event.target.value as MilestoneType)
              }
              className={inputStyles}
            >
              {milestoneTypes.map((type) => (
                <option key={type} value={type}>
                  {milestoneLabels[type]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor={`${formId}-description`}
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            Description{' '}
            <span className="font-normal text-text-muted">(optional)</span>
          </label>
          <textarea
            id={`${formId}-description`}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="What made this moment special?"
            className={`${inputStyles} resize-y py-3`}
          />
          <p className="mt-1 text-right text-xs text-text-muted">
            {description.length}/1000
          </p>
        </div>

        <div>
          <label
            htmlFor={`${formId}-media`}
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            Photo or video{' '}
            <span className="font-normal text-text-muted">(optional)</span>
          </label>
          <label className="flex min-h-20 cursor-pointer items-center gap-3 rounded-card border border-border bg-surface px-4 hover:border-border-strong">
            <ImagePlus aria-hidden="true" className="size-5 text-primary" />
            <span className="min-w-0 text-sm text-text-secondary">
              {mediaFile?.name ??
                (memory?.media.length && !removeMedia
                  ? 'Replace current media'
                  : 'Choose a photo or video')}
            </span>
            <input
              id={`${formId}-media`}
              type="file"
              className="sr-only"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0]
                setMediaError('')
                if (!file) return
                const allowed = [
                  'image/jpeg',
                  'image/png',
                  'image/webp',
                  'image/gif',
                  'video/mp4',
                  'video/webm',
                ].includes(file.type)
                if (
                  !allowed ||
                  file.size > 25 * 1024 * 1024 ||
                  file.size === 0
                ) {
                  setMediaError(
                    'Choose a supported photo or video smaller than 25 MB.',
                  )
                  event.target.value = ''
                  return
                }
                setMediaFile(file)
                setRemoveMedia(false)
              }}
            />
          </label>
          {memory?.media.length && !removeMedia ? (
            <button
              type="button"
              disabled={uploading}
              onClick={() => {
                setMediaFile(undefined)
                setRemoveMedia(true)
              }}
              className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"
            >
              <Trash2 className="size-4" />
              Remove current media
            </button>
          ) : null}
          {mediaError ? (
            <p role="alert" className="mt-1 text-xs text-primary">
              {mediaError}
            </p>
          ) : null}
          {uploading ? (
            <div className="mt-3" aria-live="polite">
              <div className="h-2 overflow-hidden rounded-full bg-primary-soft">
                <div
                  className="h-full bg-primary transition-[width]"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-text-secondary">
                Uploading securely… {uploadProgress}%
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 gap-3 border-t border-border bg-card px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button
          variant="secondary"
          fullWidth
          onClick={onCancel}
          disabled={uploading}
        >
          Cancel
        </Button>
        <Button type="submit" fullWidth disabled={uploading}>
          {memory ? 'Save changes' : 'Add memory'}
        </Button>
      </div>
    </form>
  )
}
