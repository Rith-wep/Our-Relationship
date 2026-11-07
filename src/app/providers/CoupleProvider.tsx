import { type ReactNode, useCallback, useMemo, useState } from 'react'

import {
  CoupleContext,
  type CoupleContextValue,
} from '@/app/providers/couple-context'
import { demoCouple } from '@/features/couple/data/demoCouple'
import { demoDates } from '@/features/couple/data/demoDates'
import { demoDreams } from '@/features/couple/data/demoDreams'
import type {
  CoupleProfile,
  Dream,
  DreamDraft,
  ImportantDate,
  SpecialDateDraft,
} from '@/features/couple/types'

export function CoupleProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<CoupleProfile>(demoCouple)
  const [dreams, setDreams] = useState<Dream[]>(demoDreams)
  const [importantDates, setImportantDates] =
    useState<ImportantDate[]>(demoDates)

  const updateProfile = useCallback((nextProfile: CoupleProfile) => {
    setProfile(nextProfile)
    setImportantDates((current) =>
      current.map((date) =>
        date.type === 'relationship_anniversary'
          ? { ...date, date: nextProfile.relationshipStartDate }
          : date,
      ),
    )
  }, [])

  const createDream = useCallback((draft: DreamDraft) => {
    const now = new Date().toISOString()
    setDreams((current) => [
      ...current,
      {
        ...draft,
        id: crypto.randomUUID(),
        completed: false,
        createdAt: now,
        updatedAt: now,
      },
    ])
  }, [])

  const updateDream = useCallback((id: string, draft: DreamDraft) => {
    const updatedAt = new Date().toISOString()
    setDreams((current) =>
      current.map((dream) =>
        dream.id === id ? { ...dream, ...draft, updatedAt } : dream,
      ),
    )
  }, [])

  const toggleDream = useCallback((id: string) => {
    const updatedAt = new Date().toISOString()
    setDreams((current) =>
      current.map((dream) =>
        dream.id === id
          ? { ...dream, completed: !dream.completed, updatedAt }
          : dream,
      ),
    )
  }, [])

  const deleteDream = useCallback((id: string) => {
    setDreams((current) => current.filter((dream) => dream.id !== id))
  }, [])

  const createSpecialDate = useCallback((draft: SpecialDateDraft) => {
    setImportantDates((current) => [
      ...current,
      { ...draft, id: crypto.randomUUID(), type: 'custom', isCustom: true },
    ])
  }, [])

  const updateSpecialDate = useCallback(
    (id: string, draft: SpecialDateDraft) => {
      setImportantDates((current) =>
        current.map((date) =>
          date.id === id && date.isCustom ? { ...date, ...draft } : date,
        ),
      )
    },
    [],
  )

  const deleteSpecialDate = useCallback((id: string) => {
    setImportantDates((current) =>
      current.filter((date) => date.id !== id || !date.isCustom),
    )
  }, [])

  const value = useMemo<CoupleContextValue>(
    () => ({
      profile,
      dreams,
      importantDates,
      updateProfile,
      createDream,
      updateDream,
      toggleDream,
      deleteDream,
      createSpecialDate,
      updateSpecialDate,
      deleteSpecialDate,
    }),
    [
      createDream,
      createSpecialDate,
      deleteDream,
      deleteSpecialDate,
      dreams,
      importantDates,
      profile,
      toggleDream,
      updateDream,
      updateProfile,
      updateSpecialDate,
    ],
  )

  return <CoupleContext value={value}>{children}</CoupleContext>
}
