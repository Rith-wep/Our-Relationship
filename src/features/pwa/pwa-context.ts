import { createContext } from 'react'

export interface PwaContextValue {
  canInstall: boolean
  isInstalled: boolean
  isOnline: boolean
  install: () => Promise<boolean>
}

export const PwaContext = createContext<PwaContextValue | null>(null)
