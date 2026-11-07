import { ImagePlus, Trash2, UserRound } from 'lucide-react'
import { type FormEvent, useState } from 'react'

import { Button } from '@/components/ui/Button'
import type { CoupleProfile } from '@/features/couple/types'

export function EditCoupleProfile({
  profile,
  onCancel,
  onSave,
  editablePartnerId,
  onUploadPhoto,
  onRemovePhoto,
  uploading = false,
  uploadProgress = 0,
}: {
  profile: CoupleProfile
  onCancel: () => void
  onSave: (profile: CoupleProfile) => void
  editablePartnerId: string
  onUploadPhoto: (file: File) => void
  onRemovePhoto: () => void
  uploading?: boolean
  uploadProgress?: number
}) {
  const [draft, setDraft] = useState(profile)
  const [error, setError] = useState('')
  const [photoFile, setPhotoFile] = useState<File>()
  const input =
    'min-h-11 w-full rounded-control border border-border-strong px-3.5 text-base'

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
    if (photoFile) onUploadPhoto(photoFile)
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
              <div className="mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-full border border-border bg-surface text-primary shadow-soft">
                {partner.photo ? (
                  <img
                    src={partner.photo}
                    alt="Profile preview"
                    className="size-full object-cover"
                  />
                ) : (
                  <UserRound aria-hidden="true" className="size-6" />
                )}
              </div>
              <input
                value={partner.name}
                aria-label={`Partner ${index === 0 ? 'A' : 'B'} name`}
                maxLength={50}
                disabled={partner.id !== editablePartnerId}
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
          <label className="mb-1.5 block text-sm font-medium">
            Your profile picture
          </label>
          <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-control border border-border bg-surface px-3.5 text-sm text-text-secondary hover:border-border-strong">
            <ImagePlus className="size-5 text-primary" />
            <span className="truncate">
              {photoFile?.name ?? 'Choose a JPEG, PNG, WebP, or GIF'}
            </span>
            <input
              type="file"
              className="sr-only"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                if (
                  ![
                    'image/jpeg',
                    'image/png',
                    'image/webp',
                    'image/gif',
                  ].includes(file.type) ||
                  file.size === 0 ||
                  file.size > 8 * 1024 * 1024
                ) {
                  setError(
                    'Choose a supported profile picture smaller than 8 MB.',
                  )
                  event.target.value = ''
                  return
                }
                setError('')
                setPhotoFile(file)
              }}
            />
          </label>
          {draft.partners.find((partner) => partner.id === editablePartnerId)
            ?.photo ? (
            <button
              type="button"
              disabled={uploading}
              onClick={onRemovePhoto}
              className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"
            >
              <Trash2 className="size-4" />
              Remove current picture
            </button>
          ) : null}
          {uploading ? (
            <div className="mt-2">
              <div className="h-2 overflow-hidden rounded-full bg-primary-soft">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-text-secondary">
                Uploading securely… {uploadProgress}%
              </p>
            </div>
          ) : null}
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
        <Button
          variant="secondary"
          fullWidth
          onClick={onCancel}
          disabled={uploading}
        >
          Cancel
        </Button>
        <Button type="submit" fullWidth disabled={uploading}>
          Save Profile
        </Button>
      </div>
    </form>
  )
}
