import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  collection, addDoc, deleteDoc, updateDoc, getDocs,
  doc, query, where, orderBy, limit,
  onSnapshot, Timestamp,
} from 'firebase/firestore'
import { startOfMonth, endOfMonth } from 'date-fns'
import { db } from '../lib/firebase'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function tsToISO(ts) {
  if (!ts) return new Date().toISOString()
  if (typeof ts === 'string') return ts
  return ts.toDate?.().toISOString() ?? new Date().toISOString()
}

function docToLog(d) {
  const data = d.data()
  return { id: d.id, ...data, logged_at: tsToISO(data.logged_at) }
}

// ─── Month logs — realtime via onSnapshot ────────────────────────────────────

export function useMonthLogs(year, month) {
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    const from = Timestamp.fromDate(startOfMonth(new Date(year, month)))
    const to   = Timestamp.fromDate(endOfMonth(new Date(year, month)))

    const q = query(
      collection(db, 'chore_logs'),
      where('logged_at', '>=', from),
      where('logged_at', '<=', to),
      orderBy('logged_at')
    )

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setLogs(snap.docs.map(docToLog))
        setIsLoading(false)
      },
      (err) => {
        console.error('Firestore snapshot error:', err)
        setIsLoading(false)
      }
    )

    return unsubscribe
  }, [year, month])

  return { data: logs, isLoading }
}

// ─── Historical logs — one-shot for suggestions ───────────────────────────────

export function useHistoricalLogs() {
  return useQuery({
    queryKey: ['logs', 'history'],
    queryFn: async () => {
      const q = query(
        collection(db, 'chore_logs'),
        orderBy('logged_at', 'desc'),
        limit(1000)
      )
      const snap = await getDocs(q)
      return snap.docs.map(docToLog)
    },
    staleTime: 5 * 60 * 1000,
  })
}

// ─── Add log ─────────────────────────────────────────────────────────────────

export function useAddLog() {
  const [isPending, setIsPending] = useState(false)

  async function mutateAsync({ chore_id, user_id, logged_at, notes }) {
    setIsPending(true)
    try {
      const ts = logged_at ? Timestamp.fromDate(new Date(logged_at)) : Timestamp.now()
      const ref = await addDoc(collection(db, 'chore_logs'), {
        chore_id,
        user_id,
        logged_at: ts,
        notes: notes ?? null,
      })
      // onSnapshot in useMonthLogs will pick this up automatically
      return { id: ref.id, chore_id, user_id, logged_at: ts.toDate().toISOString() }
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

// ─── Delete log ───────────────────────────────────────────────────────────────

export function useDeleteLog() {
  const [isPending, setIsPending] = useState(false)

  async function mutateAsync({ id }) {
    setIsPending(true)
    try {
      await deleteDoc(doc(db, 'chore_logs', id))
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

// ─── Update log ───────────────────────────────────────────────────────────────

export function useUpdateLog() {
  const [isPending, setIsPending] = useState(false)

  async function mutateAsync({ id, logged_at }) {
    setIsPending(true)
    try {
      const ts = Timestamp.fromDate(new Date(logged_at))
      await updateDoc(doc(db, 'chore_logs', id), { logged_at: ts })
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}
