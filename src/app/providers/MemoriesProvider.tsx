import { type ReactNode, useCallback, useMemo, useState } from 'react'

import {
  MemoriesContext,
  type MemoriesContextValue,
} from '@/app/providers/memories-context'
import { demoMemories } from '@/features/timeline/data/demoMemories'
import type { MemoryDraft, TimelineMemory } from '@/features/timeline/types'

interface MemoriesProviderProps {
  children: ReactNode
}

export function MemoriesProvider({ children }: MemoriesProviderProps) {
  const [memories, setMemories] = useState<TimelineMemory[]>(demoMemories)

  const createMemory = useCallback((draft: MemoryDraft) => {
    const now = new Date().toISOString()
    const memory: TimelineMemory = {
      ...draft,
      id: crypto.randomUUID(),
      createdBy: 'Local user',
      createdAt: now,
      updatedAt: now,
      isFavorite: false,
    }
    setMemories((current) => [...current, memory])
    return memory
  }, [])

  const updateMemory = useCallback((id: string, draft: MemoryDraft) => {
    const updatedAt = new Date().toISOString()
    setMemories((current) =>
      current.map((memory) =>
        memory.id === id && !memory.deletedAt
          ? { ...memory, ...draft, updatedAt }
          : memory,
      ),
    )
  }, [])

  const deleteMemory = useCallback((id: string) => {
    const deletedAt = new Date().toISOString()
    setMemories((current) =>
      current.map((memory) =>
        memory.id === id && !memory.deletedAt
          ? {
              ...memory,
              deletedAt,
              deletedBy: 'Local user',
              updatedAt: deletedAt,
            }
          : memory,
      ),
    )
  }, [])

  const restoreMemory = useCallback((id: string) => {
    const updatedAt = new Date().toISOString()
    setMemories((current) =>
      current.map((memory) => {
        if (memory.id !== id || !memory.deletedAt) return memory
        const restored = { ...memory, updatedAt }
        delete restored.deletedAt
        delete restored.deletedBy
        return restored
      }),
    )
  }, [])

  const permanentlyDeleteMemory = useCallback((id: string) => {
    setMemories((current) =>
      current.filter((memory) => memory.id !== id || !memory.deletedAt),
    )
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    const updatedAt = new Date().toISOString()
    setMemories((current) =>
      current.map((memory) =>
        memory.id === id && !memory.deletedAt
          ? { ...memory, isFavorite: !memory.isFavorite, updatedAt }
          : memory,
      ),
    )
  }, [])

  const value = useMemo<MemoriesContextValue>(() => {
    const activeMemories = memories.filter((memory) => !memory.deletedAt)
    const deletedMemories = memories.filter((memory) =>
      Boolean(memory.deletedAt),
    )

    return {
      memories,
      activeMemories,
      deletedMemories,
      createMemory,
      updateMemory,
      deleteMemory,
      restoreMemory,
      permanentlyDeleteMemory,
      toggleFavorite,
    }
  }, [
    createMemory,
    deleteMemory,
    memories,
    permanentlyDeleteMemory,
    restoreMemory,
    toggleFavorite,
    updateMemory,
  ])

  return <MemoriesContext value={value}>{children}</MemoriesContext>
}
