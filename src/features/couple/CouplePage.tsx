import { useState } from 'react'

import { useCouple } from '@/app/providers/useCouple'
import { Button } from '@/components/ui/Button'
import { CoupleProfile } from '@/features/couple/components/CoupleProfile'
import { CoupleSettings } from '@/features/couple/components/CoupleSettings'
import { DreamForm } from '@/features/couple/components/DreamForm'
import { DreamsList } from '@/features/couple/components/DreamsList'
import { EditCoupleProfile } from '@/features/couple/components/EditCoupleProfile'
import { ImportantDates } from '@/features/couple/components/ImportantDates'
import { SpecialDateForm } from '@/features/couple/components/SpecialDateForm'
import type {
  Dream,
  DreamDraft,
  ImportantDate,
  SpecialDateDraft,
} from '@/features/couple/types'
import { MemoryDialog } from '@/features/timeline/components/MemoryDialog'

export function CouplePage() {
  const couple = useCouple()
  const [editProfile, setEditProfile] = useState(false)
  const [dreamForm, setDreamForm] = useState<Dream | null | undefined>()
  const [dreamToDelete, setDreamToDelete] = useState<Dream | null>(null)
  const [dateForm, setDateForm] = useState<ImportantDate | null | undefined>()
  const [dateToDelete, setDateToDelete] = useState<ImportantDate | null>(null)

  const saveDream = (draft: DreamDraft) => {
    if (dreamForm) couple.updateDream(dreamForm.id, draft)
    else couple.createDream(draft)
    setDreamForm(undefined)
  }
  const saveDate = (draft: SpecialDateDraft) => {
    if (dateForm) couple.updateSpecialDate(dateForm.id, draft)
    else couple.createSpecialDate(draft)
    setDateForm(undefined)
  }

  return (
    <div className="space-y-9 py-2 pb-5">
      <header>
        <p className="text-xs font-semibold tracking-wide text-primary uppercase">
          Our shared space
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-[-0.02em]">Us</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Our story, our plans, and the days we keep close.
        </p>
      </header>
      <CoupleProfile
        profile={couple.profile}
        onEdit={() => setEditProfile(true)}
      />
      <DreamsList
        dreams={couple.dreams}
        onAdd={() => setDreamForm(null)}
        onEdit={setDreamForm}
        onToggle={couple.toggleDream}
        onDelete={setDreamToDelete}
      />
      <ImportantDates
        dates={couple.importantDates}
        onAdd={() => setDateForm(null)}
        onEdit={setDateForm}
        onDelete={setDateToDelete}
      />
      <CoupleSettings
        startDate={couple.profile.relationshipStartDate}
        onEdit={() => setEditProfile(true)}
      />
      <p className="text-center text-[11px] leading-4 text-text-muted">
        Profile, dreams, and dates are stored only for this session and reset on
        refresh.
      </p>

      <MemoryDialog
        open={editProfile}
        title="Edit Couple Profile"
        description="Keep your shared details up to date."
        onClose={() => setEditProfile(false)}
      >
        <EditCoupleProfile
          profile={couple.profile}
          onCancel={() => setEditProfile(false)}
          onSave={(profile) => {
            couple.updateProfile(profile)
            setEditProfile(false)
          }}
        />
      </MemoryDialog>
      <MemoryDialog
        open={dreamForm !== undefined}
        title={dreamForm ? 'Edit dream' : 'Add a dream'}
        onClose={() => setDreamForm(undefined)}
      >
        <DreamForm
          key={dreamForm?.id ?? 'new-dream'}
          dream={dreamForm ?? undefined}
          onCancel={() => setDreamForm(undefined)}
          onSave={saveDream}
        />
      </MemoryDialog>
      <MemoryDialog
        open={dateForm !== undefined}
        title={dateForm ? 'Edit special date' : 'Add special date'}
        onClose={() => setDateForm(undefined)}
      >
        <SpecialDateForm
          key={dateForm?.id ?? 'new-date'}
          date={dateForm ?? undefined}
          onCancel={() => setDateForm(undefined)}
          onSave={saveDate}
        />
      </MemoryDialog>
      <MemoryDialog
        open={Boolean(dreamToDelete)}
        title="Delete this dream?"
        description="This cannot be undone during the current session."
        onClose={() => setDreamToDelete(null)}
        size="compact"
      >
        <div className="p-5">
          <p className="text-sm text-text-secondary">{dreamToDelete?.title}</p>
          <div className="mt-5 flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setDreamToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              onClick={() => {
                if (dreamToDelete) couple.deleteDream(dreamToDelete.id)
                setDreamToDelete(null)
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </MemoryDialog>
      <MemoryDialog
        open={Boolean(dateToDelete)}
        title="Delete this special date?"
        description="This custom date will be removed."
        onClose={() => setDateToDelete(null)}
        size="compact"
      >
        <div className="p-5">
          <p className="text-sm text-text-secondary">{dateToDelete?.title}</p>
          <div className="mt-5 flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setDateToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              onClick={() => {
                if (dateToDelete) couple.deleteSpecialDate(dateToDelete.id)
                setDateToDelete(null)
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </MemoryDialog>
    </div>
  )
}
