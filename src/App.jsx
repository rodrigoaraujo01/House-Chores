import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { LogSheetProvider, useLogSheet } from './hooks/useLogSheet'
import { useChores, useCategories } from './hooks/useChores'
import { useMonthLogs, useHistoricalLogs, useAddLog } from './hooks/useLogs'
import { useProfiles } from './hooks/useProfiles'
import { useSuggestions } from './hooks/useSuggestions'
import { LogChoreSheet } from './components/LogChoreSheet'
import { LoginPage } from './pages/LoginPage'
import { TodayPage } from './pages/TodayPage'
import { MonthGridPage } from './pages/MonthGridPage'
import { ManagePage } from './pages/ManagePage'
import { PageLoader } from './components/LoadingSpinner'
import { startOfDay, endOfDay, parseISO, isWithinInterval } from 'date-fns'
import toast from 'react-hot-toast'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LogSheetProvider>
          <HashRouter>
            <AppRoutes />
            <GlobalLogSheet />
          </HashRouter>
        </LogSheetProvider>
      </AuthProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#fff',
            color: '#2C2825',
            borderRadius: '16px',
            boxShadow: '0 2px 12px rgba(44,40,37,0.12)',
            fontSize: '14px',
          },
        }}
      />
    </QueryClientProvider>
  )
}

function AppRoutes() {
  const { session } = useAuth()

  useEffect(() => {
    try {
      if (typeof Notification === 'undefined') return
      if (Notification.permission === 'granted') {
        const id = scheduleDailyNotification(22)
        return () => clearTimeout(id)
      }
    } catch {
      // Notification API unavailable (iOS Safari, restricted contexts)
    }
  }, [])

  if (session === undefined) return <PageLoader />
  if (!session) return <LoginPage />

  return (
    <Routes>
      <Route path="/" element={<TodayPage />} />
      <Route path="/month" element={<MonthGridPage />} />
      <Route path="/manage" element={<ManagePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Global log sheet — lives above all pages so any page can trigger it
function GlobalLogSheet() {
  const { open, closeSheet } = useLogSheet()
  const { profile } = useAuth()
  const now = new Date()
  const { data: chores = [] } = useChores()
  const { data: categories = [] } = useCategories()
  const { data: profiles = [] } = useProfiles()
  const { data: logs = [] } = useMonthLogs(now.getFullYear(), now.getMonth())
  const { data: historicalLogs = [] } = useHistoricalLogs()
  const addLog = useAddLog()
  const suggestions = useSuggestions(historicalLogs, chores)

  const todayLogs = logs.filter((l) =>
    isWithinInterval(parseISO(l.logged_at), {
      start: startOfDay(now),
      end: endOfDay(now),
    })
  )

  async function handleLog({ chore_id, user_id, logged_at }) {
    try {
      await addLog.mutateAsync({ chore_id, user_id, logged_at })
      const chore = chores.find((c) => c.id === chore_id)
      toast.success(`${chore?.name ?? 'Chore'} logged! +${chore?.weight ?? 1}pt`)
    } catch {
      toast.error('Failed to log chore')
    }
  }

  return (
    <LogChoreSheet
      open={open}
      onClose={closeSheet}
      chores={chores}
      categories={categories}
      suggestions={suggestions}
      profile={profile}
      profiles={profiles}
      todayLogs={todayLogs}
      onLog={handleLog}
    />
  )
}

function scheduleDailyNotification(hour) {
  if (typeof Notification === 'undefined') return 0
  const now = new Date()
  const target = new Date()
  target.setHours(hour, 0, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  const delay = target.getTime() - now.getTime()

  return setTimeout(() => {
    try {
      const n = new Notification('House Chores 🏠', {
        body: "Daily recap time! Check what got done today.",
        icon: '/House-Chores/icon.svg',
        badge: '/House-Chores/icon.svg',
        tag: 'daily-overview',
      })
      n.onclick = () => {
        window.focus()
        window.location.hash = '#/'
      }
    } catch {
      // Notifications not available
    }
  }, delay)
}
