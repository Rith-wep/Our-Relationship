import { Camera } from 'lucide-react'
import { type ChangeEvent, type FormEvent, useState } from 'react'

import { Button } from '@/components/ui/Button'
import type { CoupleProfile } from '@/features/couple/types'

export function EditCoupleProfile({
  profile,
  onCancel,
  onSave,
}: {
  profile: CoupleProfile
  onCancel: () => void
  onSave: (profile: CoupleProfile) => void
}) {
  const [draft, setDraft] = useState(profile)
  const [error, setError] = useState('')
  const input =
    'min-h-11 w-full rounded-control border border-border-strong px-3.5 text-base focus:border-primary'

  const handlePhoto = (index: 0 | 1, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 8 * 1024 * 1024) {
      setError('Choose an image file smaller than 8 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') return
      setDraft((current) => {
        const partners = [...current.partners] as CoupleProfile['partners']
        partners[index] = { ...partners[index], photo: reader.result as string }
        return { ...current, partners }
      })
      setError('')
    }
    reader.readAsDataURL(file)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (
      !draft.partners[0].name.trim() ||
      !draft.partners[1].name.trim() ||
      !draft.relationshipStartDate
    ) {
      setError('Both names and the relationship start date are required.')
      return
    }
    onSave({
      ...draft,
      partners: draft.partners.map((partner) => ({
        ...partner,
        name: partner.name.trim(),
        initial: partner.name.trim().charAt(0).toUpperCase(),
      })) as CoupleProfile['partners'],
      description: draft.description.trim(),
    })
  }

  return (
    <form onSubmit={submit} className="flex max-h-[calc(90dvh-5rem)] flex-col">
      <div className="space-y-5 overflow-y-auto p-5">
        <div className="grid grid-cols-2 gap-4">
          {draft.partners.map((partner, index) => (
            <div key={partner.id}>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Partner {index === 0 ? 'A' : 'B'}
              </label>
              <label className="mb-3 flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-border-strong bg-surface text-primary has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary">
                {partner.photo ? (
                  <img
                    src={partner.photo}
                    alt="Profile preview"
                    className="size-full object-cover"
                  />
                ) : (
                  <Camera aria-hidden="true" className="size-6" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => handlePhoto(index as 0 | 1, event)}
                />
              </label>
              <input
                value={partner.name}
                aria-label={`Partner ${index === 0 ? 'A' : 'B'} name`}
                maxLength={50}
                onChange={(event) => {
                  const partners = [
                    ...draft.partners,
                  ] as CoupleProfile['partners']
                  partners[index] = {
                    ...partners[index],
                    name: event.target.value,
                  }
                  setDraft({ ...draft, partners })
                }}
                className={input}
              />
            </div>
          ))}
        </div>
        <div>
          <label
            htmlFor="relationship-start"
            className="mb-1.5 block text-sm font-medium"
          >
            Relationship start date
          </label>
          <input
            id="relationship-start"
            type="date"
            value={draft.relationshipStartDate}
            onChange={(event) =>
              setDraft({ ...draft, relationshipStartDate: event.target.value })
            }
            className={input}
          />
        </div>
        <div>
          <label
            htmlFor="relationship-description"
            className="mb-1.5 block text-sm font-medium"
          >
            Our description
          </label>
          <textarea
            id="relationship-description"
            rows={4}
            maxLength={500}
            value={draft.description}
            onChange={(event) =>
              setDraft({ ...draft, description: event.target.value })
            }
            className={`${input} py-3 leading-6`}
          />
        </div>
        {error ? (
          <p role="alert" className="text-sm text-primary">
            {error}
          </p>
        ) : null}
      </div>
      <div className="flex gap-3 border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button variant="secondary" fullWidth onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" fullWidth>
          Save Profile
        </Button>
      </div>
    </form>
  )
}
