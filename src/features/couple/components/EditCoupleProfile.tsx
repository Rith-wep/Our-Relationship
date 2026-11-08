import { Camera, ImagePlus, Trash2, UserRound, X } from 'lucide-react'
import { type FormEvent, useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/Button'
import type { CoupleProfile } from '@/features/couple/types'
import { validateProfileFile } from '@/lib/supabase/services/storage-service'

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function EditCoupleProfile({
  profile,
  onCancel,
  onSave,
  editablePartnerId,
  onRemovePhoto,
  uploading = false,
  uploadProgress = 0,
}: {
  profile: CoupleProfile
  onCancel: () => void
  onSave: (profile: CoupleProfile, photoFile?: File) => Promise<void>
  editablePartnerId: string
  onRemovePhoto: () => void
  uploading?: boolean
  uploadProgress?: number
}) {
  const [draft, setDraft] = useState(profile)
  const [error, setError] = useState('')
  const [photoFile, setPhotoFile] = useState<File>()
  const [saving, setSaving] = useState(false)
  const input = 'form-control'

  const previewUrl = useMemo(
    () => (photoFile ? URL.createObjectURL(photoFile) : undefined),
    [photoFile],
  )

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    },
    [previewUrl],
  )

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (
      !draft.partners[0].name.trim() ||
      !draft.partners[1].name.trim() ||
      !draft.relationshipStartDate
    ) {
      setError('Both names and the relationship start date are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave(
        {
          ...draft,
          partners: draft.partners.map((partner) => ({
            ...partner,
            name: partner.name.trim(),
            initial: partner.name.trim().charAt(0).toUpperCase(),
          })) as CoupleProfile['partners'],
          description: draft.description.trim(),
        },
        photoFile,
      )
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Could not save your profile.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="flex min-h-0 max-h-[calc(90dvh-4rem)] flex-col"
    >
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        <div className="grid grid-cols-2 gap-4">
          {draft.partners.map((partner, index) => (
            <div key={partner.id}>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Partner {index === 0 ? 'A' : 'B'}
              </label>
              <div className="mx-auto mb-3 flex aspect-square w-full max-w-32 items-center justify-center overflow-hidden rounded-full border border-border bg-surface text-primary shadow-soft">
                {partner.id === editablePartnerId && previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Selected profile preview"
                    className="size-full object-cover"
                  />
                ) : partner.photo ? (
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
          <label className="group flex min-h-16 cursor-pointer items-center gap-3 rounded-card border border-dashed border-border-strong bg-surface p-3.5 transition-colors hover:border-primary hover:bg-primary-soft/40">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Camera className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-text-primary">
              {photoFile
                ? `${photoFile.name} · ${formatFileSize(photoFile.size)}`
                : 'Choose profile photo'}
            </span>
            <ImagePlus
              className="size-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <input
              type="file"
              className="sr-only"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                try {
                  validateProfileFile(file)
                } catch (caught) {
                  setError(
                    caught instanceof Error
                      ? caught.message
                      : 'Choose a valid image.',
                  )
                  event.target.value = ''
                  return
                }
                setError('')
                setPhotoFile(file)
              }}
            />
          </label>
          {photoFile ? (
            <button
              type="button"
              disabled={uploading || saving}
              onClick={() => setPhotoFile(undefined)}
              className="mt-2 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-text-secondary"
            >
              <X className="size-4" aria-hidden="true" />
              Clear selection
            </button>
          ) : null}
          {draft.partners.find((partner) => partner.id === editablePartnerId)
            ?.photo ? (
            <button
              type="button"
              disabled={uploading || saving}
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
      <div className="flex shrink-0 gap-3 border-t border-border bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button
          variant="secondary"
          fullWidth
          onClick={onCancel}
          disabled={uploading || saving}
        >
          Cancel
        </Button>
        <Button type="submit" fullWidth disabled={uploading || saving}>
          {uploading ? 'Uploading…' : saving ? 'Saving…' : 'Save Profile'}
        </Button>
      </div>
    </form>
  )
}
