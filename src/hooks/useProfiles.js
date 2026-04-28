import { useQuery } from '@tanstack/react-query'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'profiles'))
      return snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const ta = a.created_at?.toMillis?.() ?? 0
          const tb = b.created_at?.toMillis?.() ?? 0
          return ta - tb
        })
    },
    staleTime: 60 * 1000,
  })
}
