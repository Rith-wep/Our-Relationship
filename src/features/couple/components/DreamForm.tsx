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
  const field = 'form-control'

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
        <label htmlFor="dream-title" className="form-label">
          Dream title
        </label>
        <input
          id="dream-title"
          name="dream-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="A dream for us"
          autoComplete="off"
          className={field}
        />
      </div>
      <div>
        <label htmlFor="dream-description" className="form-label">
          Description
        </label>
        <textarea
          id="dream-description"
          name="dream-description"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What would make it special?"
          className={`${field} py-3`}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2">
        <div>
          <label htmlFor="dream-category" className="form-label">
            Category
          </label>
          <select
            id="dream-category"
            name="dream-category"
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
          <label htmlFor="dream-target-date" className="form-label">
            Target date
          </label>
          <input
            id="dream-target-date"
            name="dream-target-date"
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
