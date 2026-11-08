import { createContext } from 'react'

export interface PwaContextValue {
  canInstall: boolean
  isInstalled: boolean
  install: () => Promise<boolean>
}

export const PwaContext = createContext<PwaContextValue | null>(null)
