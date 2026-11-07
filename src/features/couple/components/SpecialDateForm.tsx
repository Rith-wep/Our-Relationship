import { type FormEvent, useState } from 'react'

import { Button } from '@/components/ui/Button'
import type { ImportantDate, SpecialDateDraft } from '@/features/couple/types'

export function SpecialDateForm({
  date,
  onCancel,
  onSave,
}: {
  date?: ImportantDate
  onCancel: () => void
  onSave: (draft: SpecialDateDraft) => void
}) {
  const [title, setTitle] = useState(date?.title ?? '')
  const [value, setValue] = useState(date?.date ?? '')
  const [recurring, setRecurring] = useState(date?.recurringAnnually ?? true)
  const [error, setError] = useState('')
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim() || !value) return setError('Title and date are required.')
    onSave({ title: title.trim(), date: value, recurringAnnually: recurring })
  }
  const field =
    'min-h-11 w-full rounded-control border border-border-strong px-3.5 text-base'
  return (
    <form onSubmit={submit} className="space-y-4 p-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Date title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={field}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Date</label>
        <input
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={field}
        />
      </div>
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={recurring}
          onChange={(e) => setRecurring(e.target.checked)}
          className="size-5 accent-primary"
        />{' '}
        Repeat every year
      </label>
      {error ? <p className="text-sm text-primary">{error}</p> : null}
      <div className="flex gap-3">
        <Button variant="secondary" fullWidth onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" fullWidth>
          Save Date
        </Button>
      </div>
    </form>
  )
}
