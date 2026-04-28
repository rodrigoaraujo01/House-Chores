import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { supabase } from '../lib/supabase'

// Key factory
const logKeys = {
  month: (year, month) => ['logs', 'month', year, month],
  history: () => ['logs', 'history'],
}

// ─── Month logs (for grid + scores) ─────────────────────────────────────────

export function useMonthLogs(year, month) {
  const from = startOfMonth(new Date(year, month)).toISOString()
  const to = endOfMonth(new Date(year, month)).toISOString()

  return useQuery({
    queryKey: logKeys.month(year, month),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chore_logs')
        .select('*, chores(id, name, weight, category_id, categories(name, emoji))')
        .gte('logged_at', from)
        .lte('logged_at', to)
        .order('logged_at', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

// ─── Historical logs (for suggestions) ───────────────────────────────────────

export function useHistoricalLogs() {
  return useQuery({
    queryKey: logKeys.history(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chore_logs')
        .select('chore_id, user_id, logged_at')
        .order('logged_at', { ascending: false })
        .limit(1000)
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

// ─── Add a log ───────────────────────────────────────────────────────────────

export function useAddLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ chore_id, user_id, logged_at, notes }) => {
      const { data, error } = await supabase
        .from('chore_logs')
        .insert({ chore_id, user_id, logged_at: logged_at ?? new Date().toISOString(), notes })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      const d = new Date(data.logged_at)
      qc.invalidateQueries({ queryKey: logKeys.month(d.getFullYear(), d.getMonth()) })
      qc.invalidateQueries({ queryKey: logKeys.history() })
    },
  })
}

// ─── Remove a log ────────────────────────────────────────────────────────────

export function useDeleteLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, logged_at }) => {
      const { error } = await supabase.from('chore_logs').delete().eq('id', id)
      if (error) throw error
      return { id, logged_at }
    },
    onSuccess: (data) => {
      const d = new Date(data.logged_at)
      qc.invalidateQueries({ queryKey: logKeys.month(d.getFullYear(), d.getMonth()) })
      qc.invalidateQueries({ queryKey: logKeys.history() })
    },
  })
}

// ─── Realtime subscription ────────────────────────────────────────────────────

export function useRealtimeLogs(year, month) {
  const qc = useQueryClient()

  // Subscribe to realtime changes on chore_logs
  const subscribe = () => {
    const channel = supabase
      .channel('chore_logs_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chore_logs' },
        () => {
          qc.invalidateQueries({ queryKey: logKeys.month(year, month) })
          qc.invalidateQueries({ queryKey: logKeys.history() })
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }

  return subscribe
}
