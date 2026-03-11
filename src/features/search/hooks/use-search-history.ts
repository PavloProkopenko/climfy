import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/context/auth-context'
import { useSessionStorage } from '@/shared/hooks/use-session-storage'
import { supabase } from '@/lib/supabase'

export interface SearchHistoryItem {
  id: string
  query: string
  lat: number
  lon: number
  name: string
  country: string
  state?: string
  searchedAt: number
}

const API_BASE = import.meta.env.VITE_API_BASE_URL as string

async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

export function useSearchHistory() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Always initialize sessionStorage hook (used for anonymous path)
  const [sessionHistory, setSessionHistory] = useSessionStorage<
    SearchHistoryItem[]
  >('search-history', [])

  // Backend query — only enabled when logged in
  const backendQuery = useQuery({
    queryKey: ['search-history', user?.id],
    queryFn: async () => {
      const token = await getToken()
      if (!token) return []
      const res = await fetch(`${API_BASE}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return []
      const data = await res.json()
      return data.map(
        (item: {
          id: string
          city_name: string
          lat: number
          lon: number
          country: string
          state?: string
          searched_at: string
        }) => ({
          id: item.id,
          query: item.city_name,
          name: item.city_name,
          lat: item.lat,
          lon: item.lon,
          country: item.country,
          state: item.state,
          searchedAt: Date.parse(item.searched_at),
        }),
      ) as SearchHistoryItem[]
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  const history = user ? (backendQuery.data ?? []) : sessionHistory

  const addToHistory = useMutation({
    mutationFn: async (
      search: Omit<SearchHistoryItem, 'id' | 'searchedAt'>,
    ) => {
      if (!user) {
        // Anonymous: sessionStorage
        const newSearch: SearchHistoryItem = {
          ...search,
          id: `${search.lat}-${search.lon}-${Date.now()}`,
          searchedAt: Date.now(),
        }
        const filtered = sessionHistory.filter(
          (item) => !(item.lat === search.lat && item.lon === search.lon),
        )
        setSessionHistory([newSearch, ...filtered].slice(0, 10))
        return
      }

      // Authenticated: backend
      const token = await getToken()
      if (!token) return
      await fetch(`${API_BASE}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          city_name: search.name,
          lat: search.lat,
          lon: search.lon,
          country: search.country,
          state: search.state,
        }),
      })
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['search-history', user.id] })
      }
    },
  })

  const clearHistory = useMutation({
    mutationFn: async () => {
      if (!user) {
        setSessionHistory([])
        return
      }
      const token = await getToken()
      if (!token) return
      await fetch(`${API_BASE}/history`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['search-history', user.id] })
      }
    },
  })

  return {
    history,
    addToHistory,
    clearHistory,
  }
}
