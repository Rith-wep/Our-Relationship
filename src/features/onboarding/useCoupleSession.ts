import { useContext } from 'react'

import { CoupleSessionContext } from '@/features/onboarding/couple-session-context'

export function useCoupleSession() {
  const context = useContext(CoupleSessionContext)
  if (!context) {
    throw new Error(
      'useCoupleSession must be used within a CoupleSessionProvider',
    )
  }
  return context
}
