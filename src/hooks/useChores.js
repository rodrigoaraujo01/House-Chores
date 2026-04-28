import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

// ─── Categories ─────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order')
        .order('name')
      if (error) throw error
      return data
    },
  })
}

export function useUpsertCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (cat) => {
      const { data, error } = cat.id
        ? await supabase.from('categories').update(cat).eq('id', cat.id).select().single()
        : await supabase.from('categories').insert(cat).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
    },
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
      const { data, error } = await supabase
        .from('chores')
        .select('*, categories(id, name, emoji)')
        .eq('is_active', true)
        .order('name')
      if (error) throw error
      return data
    },
  })
}

export function useUpsertChore() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (chore) => {
      const payload = { ...chore }
      delete payload.categories
      const { data, error } = chore.id
        ? await supabase.from('chores').update(payload).eq('id', chore.id).select().single()
        : await supabase.from('chores').insert(payload).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chores'] }),
  })
}

export function useDeleteChore() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('chores').update({ is_active: false }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chores'] }),
  })
}
