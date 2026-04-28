import { createContext, useContext, useState } from 'react'

const LogSheetContext = createContext(null)

export function LogSheetProvider({ children }) {
  const [open, setOpen] = useState(false)
  return (
    <LogSheetContext.Provider value={{ open, openSheet: () => setOpen(true), closeSheet: () => setOpen(false) }}>
      {children}
    </LogSheetContext.Provider>
  )
}

export function useLogSheet() {
  return useContext(LogSheetContext)
}
