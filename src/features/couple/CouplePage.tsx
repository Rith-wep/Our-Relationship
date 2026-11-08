import { useState } from 'react'

import { useCouple } from '@/app/providers/useCouple'
import { Button } from '@/components/ui/Button'
import { CoupleProfile } from '@/features/couple/components/CoupleProfile'
import { BackgroundSettings } from '@/features/couple/components/BackgroundSettings'
import { CoupleSettings } from '@/features/couple/components/CoupleSettings'
import { ConnectionSettingsForm } from '@/features/couple/components/ConnectionSettingsForm'
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
import { useAuth } from '@/features/auth/useAuth'
import { InvitePartnerCard } from '@/features/onboarding/InvitePartnerCard'
import { applyBackgroundPreference } from '@/features/couple/backgrounds'

export function CouplePage() {
  const couple = useCouple()
  const auth = useAuth()
  const [editProfile, setEditProfile] = useState(false)
  const [editConnection, setEditConnection] = useState(false)
  const [editBackground, setEditBackground] = useState(false)
  const [dreamForm, setDreamForm] = useState<Dream | null | undefined>()
  const [dreamToDelete, setDreamToDelete] = useState<Dream | null>(null)
  const [dateForm, setDateForm] = useState<ImportantDate | null | undefined>()
  const [dateToDelete, setDateToDelete] = useState<ImportantDate | null>(null)
  const [signOutError, setSignOutError] = useState<string | null>(null)

  const saveDream = (draft: DreamDraft) => {
    if (dreamForm) void couple.updateDream(dreamForm.id, draft)
    else void couple.createDream(draft)
    setDreamForm(undefined)
  }
  const saveDate = (draft: SpecialDateDraft) => {
    if (dateForm) void couple.updateSpecialDate(dateForm.id, draft)
    else void couple.createSpecialDate(draft)
    setDateForm(undefined)
  }
  const closeBackground = () => {
    applyBackgroundPreference(couple.profile.background)
    setEditBackground(false)
  }

  return (
    <div className="space-y-9 py-2 pb-5">
      <header>
        <p className="text-xs font-semibold tracking-wide text-primary uppercase">
          Our shared space
        </p>
        <h1 className="page-title-outlined mt-1 text-[1.75rem] leading-9 font-semibold tracking-[-0.02em]">
          Us
        </h1>
      </header>
      <CoupleProfile
        profile={couple.profile}
        onEdit={() => setEditProfile(true)}
      />
      <DreamsList
        dreams={couple.dreams}
        onAdd={() => setDreamForm(null)}
        onEdit={setDreamForm}
        onToggle={(id) => void couple.toggleDream(id)}
        onDelete={setDreamToDelete}
      />
      <ImportantDates
        dates={couple.importantDates}
        onAdd={() => setDateForm(null)}
        onEdit={setDateForm}
        onDelete={setDateToDelete}
      />
      <CoupleSettings
        onEdit={() => setEditProfile(true)}
        onConnection={() => setEditConnection(true)}
        onBackground={() => setEditBackground(true)}
      />
      <InvitePartnerCard />
      <div>
        {signOutError ? (
          <p
            className="mb-3 text-center text-sm text-primary-strong"
            role="alert"
          >
            {signOutError}
          </p>
        ) : null}
        <Button
          variant="secondary"
          fullWidth
          onClick={() => {
            setSignOutError(null)
            void auth.signOut().then((result) => {
              if (result.error) setSignOutError(result.error)
            })
          }}
        >
          Sign out
        </Button>
      </div>

      <MemoryDialog
        open={editProfile}
        title="Edit Couple Profile"
        description="Update your details."
        onClose={() => setEditProfile(false)}
      >
        <EditCoupleProfile
          profile={couple.profile}
          editablePartnerId={auth.user?.id ?? ''}
          uploading={couple.uploadingPhoto}
          uploadProgress={couple.photoUploadProgress}
          onUploadPhoto={(file) => void couple.uploadProfilePhoto(file)}
          onRemovePhoto={() => void couple.removeProfilePhoto()}
          onCancel={() => setEditProfile(false)}
          onSave={(profile) => {
            void couple.updateProfile(profile)
            setEditProfile(false)
          }}
        />
      </MemoryDialog>
      <MemoryDialog
        open={editConnection}
        title="Distance & time"
        onClose={() => setEditConnection(false)}
      >
        <ConnectionSettingsForm
          profile={couple.profile}
          userId={auth.user?.id ?? ''}
          onCancel={() => setEditConnection(false)}
          onSave={(profile) => {
            void couple.updateProfile(profile)
            setEditConnection(false)
          }}
        />
      </MemoryDialog>
      <MemoryDialog
        open={editBackground}
        title="Application background"
        onClose={closeBackground}
      >
        <BackgroundSettings
          value={couple.profile.background}
          onCancel={closeBackground}
          onSave={(preference) => {
            void couple.updateBackground(preference)
            setEditBackground(false)
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
        description="This cannot be undone."
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
                if (dreamToDelete) void couple.deleteDream(dreamToDelete.id)
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
        description="This cannot be undone."
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
                if (dateToDelete) void couple.deleteSpecialDate(dateToDelete.id)
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
