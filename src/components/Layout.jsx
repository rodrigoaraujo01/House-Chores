import { useLogSheet } from '../hooks/useLogSheet'
import { BottomNav } from './BottomNav'

export function Layout({ children }) {
  const { openSheet } = useLogSheet()
  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>
      <BottomNav onLogPress={openSheet} />
    </div>
  )
}
