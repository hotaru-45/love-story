import { createContext, useContext } from 'react'

export const LoveStoryDataContext = createContext(null)

export function useLoveStoryData() {
  const ctx = useContext(LoveStoryDataContext)
  if (!ctx) throw new Error('useLoveStoryData must be used within LoveStoryDataProvider')
  return ctx
}
