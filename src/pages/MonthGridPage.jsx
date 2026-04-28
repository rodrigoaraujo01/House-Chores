import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { useChores, useCategories } from '../hooks/useChores'
import { useMonthLogs, useAddLog, useDeleteLog } from '../hooks/useLogs'
import { useProfiles } from '../hooks/useProfiles'
import { useScores } from '../hooks/useScores'
import { Layout } from '../components/Layout'
import { MonthGrid } from '../components/MonthGrid'
import { ScoreBoard } from '../components/ScoreBoard'
import { ChoreDetailSheet } from '../components/ChoreDetailSheet'
import { PageLoader } from '../components/LoadingSpinner'

export function MonthGridPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [detail, setDetail] = useState(null) // { day, chore, logs }

  const { profile } = useAuth()
  const { data: chores = [] } = useChores()
  const { data: categories = [] } = useCategories()
  const { data: profiles = [] } = useProfiles()
  const { data: logs = [], isLoading } = useMonthLogs(year, month)

  const addLog = useAddLog()
  const deleteLog = useDeleteLog()
  const scores = useScores(logs, profiles, chores)

  // Realtime is handled inside useMonthLogs via onSnapshot — no extra setup needed

  function handleMonthChange(delta) {
    const d = new Date(year, month + delta)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
  }

  async function handleLog({ chore_id, user_id }) {
    try {
      await addLog.mutateAsync({ chore_id, user_id })
      const chore = chores.find((c) => c.id === chore_id)
      toast.success(`${chore?.name ?? 'Chore'} logged! +${chore?.weight ?? 1}pt`)
    } catch {
      toast.error('Failed to log chore')
    }
  }

  async function handleDeleteLog(log) {
    try {
      await deleteLog.mutateAsync({ id: log.id, logged_at: log.logged_at })
      toast.success('Log removed')
    } catch {
      toast.error('Failed to remove log')
    }
  }

  if (isLoading && logs.length === 0) return <PageLoader />

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 pt-12 pb-3">
          <h1 className="text-xl font-semibold text-text-main">Chores</h1>
        </div>

        {/* Score board */}
        <div className="mb-3">
          <ScoreBoard scores={scores} />
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-hidden">
          <MonthGrid
            logs={logs}
            chores={chores}
            categories={categories}
            profiles={profiles}
            year={year}
            month={month}
            onMonthChange={handleMonthChange}
            onCellClick={({ day, chore, logs: cellLogs }) => setDetail({ day, chore, logs: cellLogs })}
          />
        </div>
      </div>

      {/* Cell detail sheet */}
      <ChoreDetailSheet
        open={!!detail}
        onClose={() => setDetail(null)}
        chore={detail?.chore}
        day={detail?.day}
        logs={detail?.logs ?? []}
        profiles={profiles}
        currentUserId={profile?.id}
        onLog={async (args) => {
          await handleLog(args)
          setDetail(null)
        }}
        onDeleteLog={async (log) => {
          await handleDeleteLog(log)
          setDetail(null)
        }}
      />
    </Layout>
  )
}
