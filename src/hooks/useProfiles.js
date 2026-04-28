import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at')
      if (error) throw error
      return data
    },
    staleTime: 60 * 1000,
  })
}
