import { use } from 'react'

import { PwaContext } from '@/features/pwa/pwa-context'

export function usePwa() {
  const context = use(PwaContext)
  if (!context) throw new Error('usePwa must be used inside PwaProvider')
  return context
}
