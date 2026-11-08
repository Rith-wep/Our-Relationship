import { PenLine, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { useLetters } from '@/app/providers/useLetters'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataSectionError } from '@/components/ui/DataSectionError'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/PageSkeleton'
import { ComposeLetterDialog } from '@/features/letters/components/ComposeLetterDialog'
import { AuthenticatedIdentity } from '@/features/letters/components/AuthenticatedIdentity'
import { DeletedLetters } from '@/features/letters/components/DeletedLetters'
import { LetterCard } from '@/features/letters/components/LetterCard'
import { LetterReader } from '@/features/letters/components/LetterReader'
import { LetterTabs } from '@/features/letters/components/LetterTabs'
import type {
  LetterDraftInput,
  LoveLetter,
  PartnerId,
} from '@/features/letters/types'
import type { LetterBox } from '@/features/letters/view-types'
import { MemoryDialog } from '@/features/timeline/components/MemoryDialog'
import { useAuth } from '@/features/auth/useAuth'
import { useCoupleSession } from '@/features/onboarding/useCoupleSession'

const emptyStates: Record<LetterBox, { title: string; description: string }> = {
  inbox: {
    title: 'Your inbox is quiet',
    description: 'New letters appear here.',
  },
  sent: {
    title: 'No letters sent yet',
    description: 'Send your first letter.',
  },
  drafts: {
    title: 'No unfinished letters',
    description: 'Start a new draft.',
  },
}

export function LettersPage() {
  const {
    letters,
    createDraft,
    updateDraft,
    deleteDraft,
    sendLetter,
    createAndSendLetter,
    markAsRead,
    toggleFavorite,
    softDelete,
    restoreLetter,
    loading,
    error,
    retry,
  } = useLetters()
  const auth = useAuth()
  const coupleSession = useCoupleSession()
  const currentPartnerId: PartnerId = auth.user?.id ?? ''
  const [box, setBox] = useState<LetterBox>('inbox')
  const [showDeleted, setShowDeleted] = useState(false)
  const [composeLetter, setComposeLetter] = useState<
    LoveLetter | null | undefined
  >()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [letterToDelete, setLetterToDelete] = useState<LoveLetter | null>(null)
  const otherPartner = coupleSession.couple?.members.find(
    (member) => member.userId !== currentPartnerId,
  )

  const activeLetters = useMemo(
    () => letters.filter((letter) => !letter.deletedAt),
    [letters],
  )
  const deletedLetters = useMemo(
    () =>
      letters.filter(
        (letter) =>
          letter.deletedAt &&
          (letter.senderId === currentPartnerId ||
            letter.recipientId === currentPartnerId),
      ),
    [currentPartnerId, letters],
  )
  const inbox = useMemo(
    () =>
      activeLetters.filter(
        (letter) =>
          letter.status === 'sent' && letter.recipientId === currentPartnerId,
      ),
    [activeLetters, currentPartnerId],
  )
  const sent = useMemo(
    () =>
      activeLetters.filter(
        (letter) =>
          letter.status === 'sent' && letter.senderId === currentPartnerId,
      ),
    [activeLetters, currentPartnerId],
  )
  const drafts = useMemo(
    () =>
      activeLetters.filter(
        (letter) =>
          letter.status === 'draft' && letter.senderId === currentPartnerId,
      ),
    [activeLetters, currentPartnerId],
  )
  const lettersByBox = { inbox, sent, drafts }
  const visibleLetters = [...lettersByBox[box]].sort((first, second) => {
    const firstDate = first.sentAt ?? first.updatedAt
    const secondDate = second.sentAt ?? second.updatedAt
    return secondDate.localeCompare(firstDate)
  })
  const selectedLetter =
    activeLetters.find((letter) => letter.id === selectedId) ?? null

  const handleOpenLetter = (letter: LoveLetter) => {
    if (letter.status === 'draft') {
      setComposeLetter(letter)
      return
    }
    if (letter.recipientId === currentPartnerId && !letter.readAt) {
      void markAsRead(letter.id, currentPartnerId)
    }
    setSelectedId(letter.id)
  }

  const handleSaveDraft = async (input: LetterDraftInput) => {
    if (composeLetter)
      await updateDraft(composeLetter.id, currentPartnerId, input)
    else await createDraft(input)
    setComposeLetter(undefined)
    setBox('drafts')
  }

  const handleSend = async (input: LetterDraftInput) => {
    if (composeLetter) {
      await updateDraft(composeLetter.id, currentPartnerId, input)
      await sendLetter(composeLetter.id, currentPartnerId)
    } else {
      await createAndSendLetter(input)
    }
    setComposeLetter(undefined)
    setBox('sent')
  }

  const handleEdit = (letter: LoveLetter) => {
    setSelectedId(null)
    setComposeLetter(letter)
  }

  const handleDeleteRequest = (letter: LoveLetter) => {
    setSelectedId(null)
    setLetterToDelete(letter)
  }

  const handleConfirmDelete = async () => {
    if (!letterToDelete) return
    if (letterToDelete.status === 'draft')
      await deleteDraft(letterToDelete.id, currentPartnerId)
    else await softDelete(letterToDelete.id, currentPartnerId)
    setLetterToDelete(null)
  }

  return (
    <section className="py-2 pb-5">
      <PageHeader
        title="Love Letters"
        description="Write from the heart."
        action={
          <Button
            size="sm"
            disabled={!otherPartner || loading}
            onClick={() => setComposeLetter(null)}
          >
            <PenLine aria-hidden="true" className="size-4" />
            Compose
          </Button>
        }
      />

      <div className="mt-5">
        <AuthenticatedIdentity
          displayName={coupleSession.displayName ?? 'Partner'}
        />
      </div>

      <div className="mt-6">
        <LetterTabs
          selected={box}
          counts={{
            inbox: inbox.length,
            sent: sent.length,
            drafts: drafts.length,
          }}
          onChange={(nextBox) => {
            setBox(nextBox)
            setShowDeleted(false)
          }}
        />
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="space-y-3" aria-label="Loading letters">
            <Skeleton className="h-28 w-full rounded-card" />
            <Skeleton className="h-28 w-full rounded-card" />
            <Skeleton className="h-28 w-full rounded-card" />
          </div>
        ) : error ? (
          <DataSectionError
            message="Your letters could not be loaded."
            onRetry={retry}
          />
        ) : showDeleted ? (
          <DeletedLetters
            letters={deletedLetters}
            currentPartnerId={currentPartnerId}
            onRestore={(id) => void restoreLetter(id, currentPartnerId)}
          />
        ) : visibleLetters.length > 0 ? (
          <div className="space-y-3">
            {visibleLetters.map((letter) => (
              <LetterCard
                key={letter.id}
                letter={letter}
                box={box}
                onOpen={handleOpenLetter}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-border bg-surface">
            <EmptyState
              title={emptyStates[box].title}
              description={emptyStates[box].description}
              icon={<PenLine aria-hidden="true" className="size-5" />}
              action={
                box !== 'inbox' ? (
                  <Button onClick={() => setComposeLetter(null)}>
                    Write a letter
                  </Button>
                ) : undefined
              }
            />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowDeleted((current) => !current)}
        disabled={loading}
        className="mt-5 min-h-11 rounded-control px-2 text-sm font-semibold text-text-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 aria-hidden="true" className="mr-1.5 inline size-4" />
        {showDeleted
          ? 'Back to letters'
          : `Recently Deleted (${deletedLetters.length})`}
      </button>

      <ComposeLetterDialog
        key={composeLetter?.id ?? `${currentPartnerId}-new`}
        open={composeLetter !== undefined}
        letter={composeLetter ?? undefined}
        senderId={currentPartnerId}
        recipientId={otherPartner?.userId ?? ''}
        recipientName={otherPartner?.displayName ?? 'Your partner'}
        onClose={() => setComposeLetter(undefined)}
        onSaveDraft={(input) => void handleSaveDraft(input)}
        onSend={(input) => void handleSend(input)}
      />

      <LetterReader
        letter={selectedLetter}
        currentPartnerId={currentPartnerId}
        onClose={() => setSelectedId(null)}
        onFavorite={(letter) =>
          void toggleFavorite(letter.id, currentPartnerId)
        }
        onDelete={handleDeleteRequest}
        onEdit={handleEdit}
      />

      <MemoryDialog
        open={Boolean(letterToDelete)}
        title="Move to Recently Deleted?"
        description="Restore it anytime."
        onClose={() => setLetterToDelete(null)}
        size="compact"
      >
        <div className="p-5">
          <p className="text-sm leading-6 text-text-secondary">
            {letterToDelete
              ? `“${letterToDelete.title}” will be hidden from your letter boxes.`
              : null}
          </p>
          <div className="mt-5 flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setLetterToDelete(null)}
            >
              Cancel
            </Button>
            <Button fullWidth onClick={() => void handleConfirmDelete()}>
              Delete
            </Button>
          </div>
        </div>
      </MemoryDialog>
    </section>
  )
}
