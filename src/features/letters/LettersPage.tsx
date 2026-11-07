import { PenLine, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { useLetters } from '@/app/providers/useLetters'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ComposeLetterDialog } from '@/features/letters/components/ComposeLetterDialog'
import { DeletedLetters } from '@/features/letters/components/DeletedLetters'
import { LetterCard } from '@/features/letters/components/LetterCard'
import { LetterReader } from '@/features/letters/components/LetterReader'
import { LetterTabs } from '@/features/letters/components/LetterTabs'
import { PartnerSwitcher } from '@/features/letters/components/PartnerSwitcher'
import {
  demoPartners,
  getOtherPartner,
} from '@/features/letters/data/demoLetters'
import type {
  LetterDraftInput,
  LoveLetter,
  PartnerId,
} from '@/features/letters/types'
import type { LetterBox } from '@/features/letters/view-types'
import { MemoryDialog } from '@/features/timeline/components/MemoryDialog'

const emptyStates: Record<LetterBox, { title: string; description: string }> = {
  inbox: {
    title: 'Your inbox is quiet',
    description: 'Letters sent to this partner will be kept here.',
  },
  sent: {
    title: 'No letters sent yet',
    description: 'Words you send to your partner will appear here.',
  },
  drafts: {
    title: 'No unfinished letters',
    description:
      'Save a thought as a draft and return when the words feel right.',
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
  } = useLetters()
  const [currentPartnerId, setCurrentPartnerId] =
    useState<PartnerId>('partner-a')
  const [box, setBox] = useState<LetterBox>('inbox')
  const [showDeleted, setShowDeleted] = useState(false)
  const [composeLetter, setComposeLetter] = useState<
    LoveLetter | null | undefined
  >()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [letterToDelete, setLetterToDelete] = useState<LoveLetter | null>(null)
  const otherPartner = getOtherPartner(currentPartnerId)

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

  const handleIdentityChange = (partnerId: PartnerId) => {
    setCurrentPartnerId(partnerId)
    setSelectedId(null)
    setComposeLetter(undefined)
    setShowDeleted(false)
  }

  const handleOpenLetter = (letter: LoveLetter) => {
    if (letter.status === 'draft') {
      setComposeLetter(letter)
      return
    }
    markAsRead(letter.id, currentPartnerId)
    setSelectedId(letter.id)
  }

  const handleSaveDraft = (input: LetterDraftInput) => {
    if (composeLetter) updateDraft(composeLetter.id, currentPartnerId, input)
    else createDraft(input)
    setComposeLetter(undefined)
    setBox('drafts')
  }

  const handleSend = (input: LetterDraftInput) => {
    if (composeLetter) {
      updateDraft(composeLetter.id, currentPartnerId, input)
      sendLetter(composeLetter.id, currentPartnerId)
    } else {
      createAndSendLetter(input)
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

  const handleConfirmDelete = () => {
    if (!letterToDelete) return
    if (letterToDelete.status === 'draft')
      deleteDraft(letterToDelete.id, currentPartnerId)
    else softDelete(letterToDelete.id, currentPartnerId)
    setLetterToDelete(null)
  }

  return (
    <section className="py-2 pb-5">
      <PageHeader
        title="Love Letters"
        description="Some feelings deserve more than a message."
        action={
          <Button size="sm" onClick={() => setComposeLetter(null)}>
            <PenLine aria-hidden="true" className="size-4" />
            Compose
          </Button>
        }
      />

      <div className="mt-5">
        <PartnerSwitcher
          partners={demoPartners}
          currentPartnerId={currentPartnerId}
          onChange={handleIdentityChange}
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
        {showDeleted ? (
          <DeletedLetters
            letters={deletedLetters}
            currentPartnerId={currentPartnerId}
            onRestore={(id) => restoreLetter(id, currentPartnerId)}
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
        className="mt-5 min-h-11 rounded-control px-2 text-sm font-semibold text-text-secondary hover:text-text-primary"
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
        recipientId={otherPartner.id}
        onClose={() => setComposeLetter(undefined)}
        onSaveDraft={handleSaveDraft}
        onSend={handleSend}
      />

      <LetterReader
        letter={selectedLetter}
        currentPartnerId={currentPartnerId}
        onClose={() => setSelectedId(null)}
        onFavorite={(letter) => toggleFavorite(letter.id, currentPartnerId)}
        onDelete={handleDeleteRequest}
        onEdit={handleEdit}
      />

      <MemoryDialog
        open={Boolean(letterToDelete)}
        title="Move to Recently Deleted?"
        description="You can restore this letter later during the current session."
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
            <Button fullWidth onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </MemoryDialog>
    </section>
  )
}
