import { ImagePlus, X } from 'lucide-react'
import { type ChangeEvent, type FormEvent, useId, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import {
  milestoneTypes,
  type MemoryDraft,
  type MilestoneType,
  type TimelineMemory,
} from '@/features/timeline/types'

interface MemoryFormProps {
  memory?: TimelineMemory
  onCancel: () => void
  onSave: (draft: MemoryDraft) => void
}

interface FormErrors {
  title?: string
  date?: string
  photo?: string
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
  'min-h-11 w-full rounded-control border border-border-strong bg-background px-3.5 text-base text-text-primary placeholder:text-text-muted focus:border-primary'

export function MemoryForm({ memory, onCancel, onSave }: MemoryFormProps) {
  const formId = useId()
  const [title, setTitle] = useState(memory?.title ?? '')
  const [date, setDate] = useState(memory?.date ?? '')
  const [milestoneType, setMilestoneType] = useState<MilestoneType>(
    memory?.milestoneType ?? 'special_memory',
  )
  const [description, setDescription] = useState(memory?.description ?? '')
  const [photo, setPhoto] = useState(memory?.photo)
  const [errors, setErrors] = useState<FormErrors>({})

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrors((current) => ({
        ...current,
        photo: 'Choose a valid image file.',
      }))
      return
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrors((current) => ({
        ...current,
        photo: 'Choose an image smaller than 8 MB.',
      }))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') return
      setPhoto({
        src: reader.result,
        alt: title.trim()
          ? `Photo for ${title.trim()}`
          : 'Selected memory photo',
      })
      setErrors((current) => ({ ...current, photo: undefined }))
    }
    reader.onerror = () => {
      setErrors((current) => ({
        ...current,
        photo: 'The image could not be read.',
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: FormErrors = {}

    if (!title.trim()) nextErrors.title = 'Enter a title for this memory.'
    if (!date) nextErrors.date = 'Choose the date this memory happened.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSave({
      title: title.trim(),
      date,
      milestoneType,
      description: description.trim(),
      photo: photo
        ? {
            ...photo,
            alt: title.trim() ? `Photo for ${title.trim()}` : photo.alt,
          }
        : undefined,
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
          <span className="mb-1.5 block text-sm font-medium text-text-primary">
            Photo{' '}
            <span className="font-normal text-text-muted">(optional)</span>
          </span>
          {photo ? (
            <div className="relative overflow-hidden rounded-card border border-border bg-surface">
              <img
                src={photo.src}
                alt={photo.alt}
                className="aspect-[16/10] w-full object-cover"
              />
              <IconButton
                label="Remove selected photo"
                onClick={() => setPhoto(undefined)}
                className="absolute top-2 right-2 bg-black/55 text-white hover:bg-black/70 hover:text-white"
              >
                <X aria-hidden="true" className="size-5" />
              </IconButton>
            </div>
          ) : (
            <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-card border border-dashed border-border-strong bg-surface px-4 text-center transition-colors hover:border-primary/50 hover:bg-primary-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary">
              <ImagePlus
                aria-hidden="true"
                className="mb-2 size-5 text-primary"
              />
              <span className="text-sm font-medium text-text-primary">
                Choose a photo
              </span>
              <span className="mt-0.5 text-xs text-text-secondary">
                Image up to 8 MB
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="sr-only"
              />
            </label>
          )}
          {errors.photo ? (
            <p className="mt-1.5 text-xs text-primary">{errors.photo}</p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 gap-3 border-t border-border bg-background px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button variant="secondary" fullWidth onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" fullWidth>
          {memory ? 'Save changes' : 'Add memory'}
        </Button>
      </div>
    </form>
  )
}
