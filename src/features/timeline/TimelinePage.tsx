import { Plus, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { demoMemories } from '@/features/timeline/data/demoMemories'
import { MemoryDialog } from '@/features/timeline/components/MemoryDialog'
import { MemoryForm } from '@/features/timeline/components/MemoryForm'
import { PhotoViewer } from '@/features/timeline/components/PhotoViewer'
import { TimelineList } from '@/features/timeline/components/TimelineList'
import type { MemoryDraft, TimelineMemory } from '@/features/timeline/types'

export function TimelinePage() {
  const [memories, setMemories] = useState<TimelineMemory[]>(demoMemories)
  const [formMemory, setFormMemory] = useState<
    TimelineMemory | null | undefined
  >()
  const [memoryToDelete, setMemoryToDelete] = useState<TimelineMemory | null>(
    null,
  )
  const [photoMemory, setPhotoMemory] = useState<TimelineMemory | null>(null)

  const sortedMemories = useMemo(
    () =>
      [...memories].sort((first, second) =>
        first.date.localeCompare(second.date),
      ),
    [memories],
  )

  const closeForm = useCallback(() => setFormMemory(undefined), [])
  const closeDeleteDialog = useCallback(() => setMemoryToDelete(null), [])
  const closePhoto = useCallback(() => setPhotoMemory(null), [])

  const handleSave = (draft: MemoryDraft) => {
    const now = new Date().toISOString()

    if (formMemory) {
      setMemories((current) =>
        current.map((memory) =>
          memory.id === formMemory.id
            ? { ...memory, ...draft, updatedAt: now }
            : memory,
        ),
      )
    } else {
      setMemories((current) => [
        ...current,
        {
          ...draft,
          id: crypto.randomUUID(),
          createdBy: 'Local user',
          createdAt: now,
          updatedAt: now,
        },
      ])
    }

    closeForm()
  }

  const handleConfirmDelete = () => {
    if (!memoryToDelete) return
    setMemories((current) =>
      current.filter((memory) => memory.id !== memoryToDelete.id),
    )
    closeDeleteDialog()
  }

  return (
    <section className="py-2">
      <PageHeader
        title="Our Story"
        description="Every moment brought us closer."
      />
      <p className="mt-3 text-xs leading-5 text-text-muted">
        Demo memories are stored only in this browser session.
      </p>

      <TimelineList
        memories={sortedMemories}
        onAdd={() => setFormMemory(null)}
        onEdit={setFormMemory}
        onDelete={setMemoryToDelete}
        onViewPhoto={setPhotoMemory}
      />

      <button
        type="button"
        onClick={() => setFormMemory(null)}
        aria-label="Add memory"
        className="timeline-fab fixed z-30 flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_8px_24px_rgb(244_63_94/0.32)] transition-colors hover:bg-primary-strong active:bg-primary-strong motion-reduce:transition-none"
      >
        <Plus aria-hidden="true" className="size-6" strokeWidth={2.5} />
      </button>

      <MemoryDialog
        open={formMemory !== undefined}
        title={formMemory ? 'Edit memory' : 'Add a memory'}
        description={
          formMemory
            ? 'Update this moment in your timeline.'
            : 'Save a moment from your story.'
        }
        onClose={closeForm}
      >
        <MemoryForm
          key={formMemory?.id ?? 'new-memory'}
          memory={formMemory ?? undefined}
          onCancel={closeForm}
          onSave={handleSave}
        />
      </MemoryDialog>

      <MemoryDialog
        open={Boolean(memoryToDelete)}
        title="Delete this memory?"
        description="This removes it from the current session. This action cannot be undone."
        onClose={closeDeleteDialog}
        size="compact"
      >
        <div className="p-5">
          <p className="text-sm leading-6 text-text-secondary">
            {memoryToDelete
              ? `“${memoryToDelete.title}” will be removed from the timeline.`
              : null}
          </p>
          <div className="mt-5 flex gap-3">
            <Button variant="secondary" fullWidth onClick={closeDeleteDialog}>
              Cancel
            </Button>
            <Button
              fullWidth
              onClick={handleConfirmDelete}
              className="bg-primary hover:bg-primary-strong"
            >
              <Trash2 aria-hidden="true" className="size-4" />
              Delete
            </Button>
          </div>
        </div>
      </MemoryDialog>

      <PhotoViewer memory={photoMemory} onClose={closePhoto} />
    </section>
  )
}
