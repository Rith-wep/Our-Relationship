import { type FormEvent, useState } from 'react'

import { Button } from '@/components/ui/Button'
import type { Dream, DreamCategory, DreamDraft } from '@/features/couple/types'

export function DreamForm({
  dream,
  onCancel,
  onSave,
}: {
  dream?: Dream
  onCancel: () => void
  onSave: (draft: DreamDraft) => void
}) {
  const [title, setTitle] = useState(dream?.title ?? '')
  const [description, setDescription] = useState(dream?.description ?? '')
  const [category, setCategory] = useState<DreamCategory>(
    dream?.category ?? 'experiences',
  )
  const [targetDate, setTargetDate] = useState(dream?.targetDate ?? '')
  const [error, setError] = useState('')
  const field =
    'min-h-11 w-full rounded-control border border-border-strong px-3.5 text-base'

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return setError('Give this dream a title.')
    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      targetDate: targetDate || undefined,
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4 p-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Dream title</label>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={field}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Description</label>
        <textarea
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={`${field} py-3`}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Category</label>
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as DreamCategory)
            }
            className={field}
          >
            <option value="travel">Travel</option>
            <option value="experiences">Experiences</option>
            <option value="food">Food</option>
            <option value="personal_goals">Personal goals</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Target date
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(event) => setTargetDate(event.target.value)}
            className={field}
          />
        </div>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-primary">
          {error}
        </p>
      ) : null}
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" fullWidth onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" fullWidth>
          {dream ? 'Save' : 'Add Dream'}
        </Button>
      </div>
    </form>
  )
}
