import { Images, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useMemories } from '@/app/providers/useMemories'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataSectionError } from '@/components/ui/DataSectionError'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/PageSkeleton'
import { GalleryCard } from '@/features/memories/components/GalleryCard'
import { MemoryDetail } from '@/features/memories/components/MemoryDetail'
import { MemoryFilters } from '@/features/memories/components/MemoryFilters'
import { RecentlyDeleted } from '@/features/memories/components/RecentlyDeleted'
import type { MemoryFilter } from '@/features/memories/types'
import { MemoryDialog } from '@/features/timeline/components/MemoryDialog'
import { MemoryForm } from '@/features/timeline/components/MemoryForm'
import type { MemoryDraft, TimelineMemory } from '@/features/timeline/types'

const milestoneFilters = new Set([
  'first_meeting',
  'first_conversation',
  'first_date',
  'relationship_started',
  'anniversary',
])

export function MemoriesPage() {
  const {
    activeMemories,
    deletedMemories,
    createMemory,
    updateMemory,
    deleteMemory,
    restoreMemory,
    permanentlyDeleteMemory,
    toggleFavorite,
    uploading,
    uploadProgress,
    loading,
    error,
    retry,
    fullyLoaded,
    loadAll,
  } = useMemories()
  const [filter, setFilter] = useState<MemoryFilter>('all')
  const [view, setView] = useState<'gallery' | 'deleted'>('gallery')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [formMemory, setFormMemory] = useState<
    TimelineMemory | null | undefined
  >()
  const [memoryToDelete, setMemoryToDelete] = useState<TimelineMemory | null>(
    null,
  )
  const [memoryToRemove, setMemoryToRemove] = useState<TimelineMemory | null>(
    null,
  )

  const selectedMemory =
    activeMemories.find((memory) => memory.id === selectedId) ?? null
  const filteredMemories = useMemo(() => {
    const sorted = [...activeMemories].sort((first, second) =>
      second.date.localeCompare(first.date),
    )
    if (filter === 'photos')
      return sorted.filter((memory) => memory.media.length > 0)
    if (filter === 'milestones') {
      return sorted.filter((memory) =>
        milestoneFilters.has(memory.milestoneType),
      )
    }
    if (filter === 'favorites')
      return sorted.filter((memory) => memory.isFavorite)
    return sorted
  }, [activeMemories, filter])
  const showMemoryState =
    !fullyLoaded ||
    (activeMemories.length === 0 &&
      deletedMemories.length === 0 &&
      (loading || Boolean(error)))
  const retryMemories = fullyLoaded ? retry : loadAll

  const closeForm = useCallback(() => setFormMemory(undefined), [])
  const closeDelete = useCallback(() => setMemoryToDelete(null), [])
  const closeRemove = useCallback(() => setMemoryToRemove(null), [])

  useEffect(() => {
    if (!fullyLoaded) void loadAll()
  }, [fullyLoaded, loadAll])

  const handleSave = async (draft: MemoryDraft) => {
    if (formMemory) await updateMemory(formMemory.id, draft)
    else await createMemory(draft)
    closeForm()
  }

  const handleEdit = (memory: TimelineMemory) => {
    setSelectedId(null)
    setFormMemory(memory)
  }

  const handleDeleteRequest = (memory: TimelineMemory) => {
    setSelectedId(null)
    setMemoryToDelete(memory)
  }

  const handleConfirmDelete = () => {
    if (!memoryToDelete) return
    void deleteMemory(memoryToDelete.id)
    closeDelete()
  }

  const handleConfirmRemove = () => {
    if (!memoryToRemove) return
    void permanentlyDeleteMemory(memoryToRemove.id)
    closeRemove()
  }

  return (
    <section className="py-2 pb-5">
      <PageHeader
        title="Our Memories"
        description="Keep your moments close."
        action={
          <Button
            size="sm"
            disabled={showMemoryState}
            onClick={() => setFormMemory(null)}
          >
            <Plus aria-hidden="true" className="size-4" />
            Add
          </Button>
        }
      />

      <div
        className="mt-6 flex border-b border-border"
        role="tablist"
        aria-label="Memory views"
      >
        {(['gallery', 'deleted'] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={view === item}
            onClick={() => setView(item)}
            className={[
              'min-h-11 border-b-2 px-3 text-sm font-semibold transition-colors motion-reduce:transition-none',
              view === item
                ? 'border-border-strong text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            {item === 'gallery'
              ? 'Gallery'
              : `Recently Deleted (${deletedMemories.length})`}
          </button>
        ))}
      </div>

      {showMemoryState ? (
        <div className="mt-6" aria-label="Loading memories">
          {error && !loading ? (
            <DataSectionError
              message="Your memories could not be loaded."
              onRetry={retryMemories}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-52 rounded-card" />
              <Skeleton className="h-40 rounded-card" />
              <Skeleton className="h-40 rounded-card" />
              <Skeleton className="h-52 rounded-card" />
            </div>
          )}
        </div>
      ) : view === 'gallery' ? (
        <div className="mt-5">
          <MemoryFilters selected={filter} onChange={setFilter} />
          {filteredMemories.length > 0 ? (
            <div className="mt-5 columns-2 gap-3">
              {filteredMemories.map((memory) => (
                <GalleryCard
                  key={memory.id}
                  memory={memory}
                  onOpen={(item) => setSelectedId(item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-card border border-border bg-surface">
              <EmptyState
                title={
                  activeMemories.length === 0
                    ? 'No memories yet'
                    : 'Nothing in this filter'
                }
                description={
                  activeMemories.length === 0
                    ? 'Add your first memory.'
                    : 'Try another filter.'
                }
                icon={<Images aria-hidden="true" className="size-5" />}
                action={
                  activeMemories.length === 0 ? (
                    <Button onClick={() => setFormMemory(null)}>
                      Add first memory
                    </Button>
                  ) : undefined
                }
              />
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5">
          <RecentlyDeleted
            memories={deletedMemories}
            onRestore={(id) => void restoreMemory(id)}
            onPermanentlyDelete={setMemoryToRemove}
          />
        </div>
      )}

      <MemoryDetail
        memory={selectedMemory}
        onClose={() => setSelectedId(null)}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        onToggleFavorite={(id) => void toggleFavorite(id)}
      />

      <MemoryDialog
        open={formMemory !== undefined}
        title={formMemory ? 'Edit memory' : 'Add a memory'}
        description={
          formMemory
            ? 'Update this shared memory.'
            : 'Add a moment to your shared collection.'
        }
        onClose={closeForm}
      >
        <MemoryForm
          key={formMemory?.id ?? 'new-gallery-memory'}
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
        onClose={closeDelete}
        size="compact"
      >
        <div className="p-5">
          <p className="text-sm leading-6 text-text-secondary">
            {memoryToDelete
              ? `“${memoryToDelete.title}” will be hidden from Home, Timeline, and Gallery.`
              : null}
          </p>
          <div className="mt-5 flex gap-3">
            <Button variant="secondary" fullWidth onClick={closeDelete}>
              Cancel
            </Button>
            <Button fullWidth onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </MemoryDialog>

      <MemoryDialog
        open={Boolean(memoryToRemove)}
        title="Remove permanently?"
        description="This cannot be undone."
        onClose={closeRemove}
        size="compact"
      >
        <div className="p-5">
          <p className="text-sm leading-6 text-text-secondary">
            {memoryToRemove
              ? `Permanently remove “${memoryToRemove.title}”?`
              : null}
          </p>
          <div className="mt-5 flex gap-3">
            <Button variant="secondary" fullWidth onClick={closeRemove}>
              Cancel
            </Button>
            <Button fullWidth onClick={handleConfirmRemove}>
              <Trash2 aria-hidden="true" className="size-4" />
              Remove
            </Button>
          </div>
        </div>
      </MemoryDialog>
    </section>
  )
}
