import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, where, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

// ─── Categories ─────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'categories'))
      return snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.display_order - b.display_order) || a.name.localeCompare(b.name))
    },
  })
}

export function useUpsertCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (cat) => {
      if (cat.id) {
        const { id, ...data } = cat
        await updateDoc(doc(db, 'categories', id), data)
        return cat
      }
      const ref = await addDoc(collection(db, 'categories'), {
        ...cat,
        created_at: serverTimestamp(),
      })
      return { id: ref.id, ...cat }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => deleteDoc(doc(db, 'categories', id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['chores'] })
    },
  })
}

// ─── Chores ──────────────────────────────────────────────────────────────────

export function useChores() {
  return useQuery({
    queryKey: ['chores'],
    queryFn: async () => {
      const snap = await getDocs(
        query(collection(db, 'chores'), where('is_active', '==', true))
      )
      return snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => a.name.localeCompare(b.name))
    },
  })
}

export function useUpsertChore() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (chore) => {
      // Strip any client-side join artifacts
      const { categories: _cats, ...data } = chore
      if (data.id) {
        const { id, ...rest } = data
        await updateDoc(doc(db, 'chores', id), rest)
        return data
      }
      const ref = await addDoc(collection(db, 'chores'), {
        ...data,
        created_at: serverTimestamp(),
      })
      return { id: ref.id, ...data }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chores'] }),
  })
}

export function useDeleteChore() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) =>
      updateDoc(doc(db, 'chores', id), { is_active: false }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chores'] }),
  })
}
