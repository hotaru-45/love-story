import { createContext, useContext } from 'react'

export const PreferencesContext = createContext(null)

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider')
  return ctx
}
