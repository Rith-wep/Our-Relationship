import { Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useMemories } from '@/app/providers/useMemories'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { MemoryDialog } from '@/features/timeline/components/MemoryDialog'
import { MemoryForm } from '@/features/timeline/components/MemoryForm'
import { PhotoViewer } from '@/features/timeline/components/PhotoViewer'
import { TimelineList } from '@/features/timeline/components/TimelineList'
import type { MemoryDraft, TimelineMemory } from '@/features/timeline/types'

export function TimelinePage() {
  const {
    activeMemories,
    createMemory,
    updateMemory,
    deleteMemory,
    uploading,
    uploadProgress,
    fullyLoaded,
    loadAll,
  } = useMemories()
  const [formMemory, setFormMemory] = useState<
    TimelineMemory | null | undefined
  >()
  const [memoryToDelete, setMemoryToDelete] = useState<TimelineMemory | null>(
    null,
  )
  const [photoMemory, setPhotoMemory] = useState<TimelineMemory | null>(null)

  const sortedMemories = useMemo(
    () =>
      [...activeMemories].sort((first, second) =>
        first.date.localeCompare(second.date),
      ),
    [activeMemories],
  )

  const closeForm = useCallback(() => setFormMemory(undefined), [])
  const closeDeleteDialog = useCallback(() => setMemoryToDelete(null), [])
  const closePhoto = useCallback(() => setPhotoMemory(null), [])

  useEffect(() => {
    if (!fullyLoaded) void loadAll()
  }, [fullyLoaded, loadAll])

  const handleSave = async (draft: MemoryDraft) => {
    if (formMemory) {
      await updateMemory(formMemory.id, draft)
    } else {
      await createMemory(draft)
    }
    closeForm()
  }

  const handleConfirmDelete = () => {
    if (!memoryToDelete) return
    void deleteMemory(memoryToDelete.id)
    closeDeleteDialog()
  }

  if (!fullyLoaded) return <PageSkeleton />

  return (
    <section className="py-2">
      <PageHeader title="Our Story" description="Our moments together." />

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
        className="timeline-fab fixed z-30 flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_8px_24px_rgb(201_47_125/0.28)] transition-colors hover:bg-primary-strong active:bg-primary-strong motion-reduce:transition-none"
      >
        <Plus aria-hidden="true" className="size-6" strokeWidth={2.5} />
      </button>

      <MemoryDialog
        open={formMemory !== undefined}
        title={formMemory ? 'Edit memory' : 'Add a memory'}
        description={formMemory ? 'Update this memory.' : 'Add a memory.'}
        onClose={closeForm}
      >
        <MemoryForm
          key={formMemory?.id ?? 'new-memory'}
          memory={formMemory ?? undefined}
          onCancel={closeForm}
          onSave={handleSave}
          uploading={uploading}
          uploadProgress={uploadProgress}
        />
      </MemoryDialog>

      <MemoryDialog
        open={Boolean(memoryToDelete)}
        title="Move to Recently Deleted?"
        description="Restore it anytime."
        onClose={closeDeleteDialog}
        size="compact"
      >
        <div className="p-5">
          <p className="text-sm leading-6 text-text-secondary">
            {memoryToDelete
              ? `“${memoryToDelete.title}” will be hidden from Home, Timeline, and Gallery.`
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
