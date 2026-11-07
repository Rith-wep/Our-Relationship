import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  MemoriesContext,
  type MemoriesContextValue,
} from '@/app/providers/memories-context'
import { useAuth } from '@/features/auth/useAuth'
import { useCoupleSession } from '@/features/onboarding/useCoupleSession'
import type { MemoryDraft, TimelineMemory } from '@/features/timeline/types'
import {
  createMemoryRecord,
  loadMemories,
  permanentlyDeleteMemoryRecord,
  restoreMemoryRecord,
  setMemoryFavorite,
  softDeleteMemoryRecord,
  updateMemoryRecord,
} from '@/lib/supabase/services/memories-service'

export function MemoriesProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const session = useCoupleSession()
  const [memories, setMemories] = useState<TimelineMemory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const memberNames = useMemo(
    () =>
      new Map(
        session.couple?.members.map((member) => [
          member.userId,
          member.displayName,
        ]) ?? [],
      ),
    [session.couple],
  )

  const retry = useCallback(
    async (showLoading = true) => {
      if (!session.couple) {
        setMemories([])
        setLoading(false)
        return
      }
      if (showLoading) setLoading(true)
      setError(null)
      try {
        setMemories(await loadMemories(session.couple.coupleId, memberNames))
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : 'Unable to load memories.',
        )
      } finally {
        if (showLoading) setLoading(false)
      }
    },
    [memberNames, session.couple],
  )

  useEffect(() => {
    const timeout = window.setTimeout(() => void retry(), 0)
    return () => window.clearTimeout(timeout)
  }, [retry])

  const runMutation = useCallback(
    async (operation: () => Promise<void>) => {
      setError(null)
      try {
        await operation()
        await retry(false)
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : 'Memory update failed.',
        )
      }
    },
    [retry],
  )

  const createMemory = useCallback(
    (draft: MemoryDraft) =>
      runMutation(async () => {
        if (!session.couple || !auth.user) throw new Error('Not signed in.')
        setUploading(Boolean(draft.mediaFile))
        setUploadProgress(0)
        try {
          await createMemoryRecord(
            session.couple.coupleId,
            auth.user.id,
            draft,
            memberNames,
            setUploadProgress,
          )
        } finally {
          setUploading(false)
        }
      }),
    [auth.user, memberNames, runMutation, session.couple],
  )

  const updateMemory = useCallback(
    (id: string, draft: MemoryDraft) =>
      runMutation(async () => {
        if (!auth.user || !session.couple) throw new Error('Not signed in.')
        setUploading(Boolean(draft.mediaFile))
        setUploadProgress(0)
        try {
          await updateMemoryRecord(
            session.couple.coupleId,
            id,
            auth.user.id,
            draft,
            memberNames,
            setUploadProgress,
          )
        } finally {
          setUploading(false)
        }
      }),
    [auth.user, memberNames, runMutation, session.couple],
  )

  const deleteMemory = useCallback(
    (id: string) =>
      runMutation(async () => {
        if (!auth.user) throw new Error('Not signed in.')
        await softDeleteMemoryRecord(id, auth.user.id)
      }),
    [auth.user, runMutation],
  )

  const restoreMemory = useCallback(
    (id: string) =>
      runMutation(async () => {
        if (!auth.user) throw new Error('Not signed in.')
        await restoreMemoryRecord(id, auth.user.id)
      }),
    [auth.user, runMutation],
  )

  const permanentlyDeleteMemory = useCallback(
    (id: string) => runMutation(() => permanentlyDeleteMemoryRecord(id)),
    [runMutation],
  )

  const toggleFavorite = useCallback(
    (id: string) =>
      runMutation(async () => {
        if (!auth.user) throw new Error('Not signed in.')
        const memory = memories.find((item) => item.id === id)
        if (!memory) throw new Error('Memory was not found.')
        await setMemoryFavorite(id, auth.user.id, !memory.isFavorite)
      }),
    [auth.user, memories, runMutation],
  )

  const value = useMemo<MemoriesContextValue>(() => {
    const activeMemories = memories.filter((memory) => !memory.deletedAt)
    const deletedMemories = memories.filter((memory) =>
      Boolean(memory.deletedAt),
    )
    return {
      memories,
      activeMemories,
      deletedMemories,
      loading,
      error,
      uploading,
      uploadProgress,
      retry,
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
    error,
    loading,
    memories,
    uploadProgress,
    uploading,
    permanentlyDeleteMemory,
    restoreMemory,
    retry,
    toggleFavorite,
    updateMemory,
  ])

  return <MemoriesContext value={value}>{children}</MemoriesContext>
}
