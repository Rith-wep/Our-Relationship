import { useContext } from 'react'

import { LettersContext } from '@/app/providers/letters-context'

export function useLetters() {
  const context = useContext(LettersContext)
  if (!context)
    throw new Error('useLetters must be used within a LettersProvider')
  return context
}
