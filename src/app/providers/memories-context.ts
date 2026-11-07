import { createContext } from 'react'

import type { MemoryDraft, TimelineMemory } from '@/features/timeline/types'

export interface MemoriesContextValue {
  memories: TimelineMemory[]
  activeMemories: TimelineMemory[]
  deletedMemories: TimelineMemory[]
  createMemory: (draft: MemoryDraft) => TimelineMemory
  updateMemory: (id: string, draft: MemoryDraft) => void
  deleteMemory: (id: string) => void
  restoreMemory: (id: string) => void
  permanentlyDeleteMemory: (id: string) => void
  toggleFavorite: (id: string) => void
}

export const MemoriesContext = createContext<MemoriesContextValue | null>(null)
