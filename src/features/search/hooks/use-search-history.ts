import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/context/auth-context'
import { useSessionStorage } from '@/shared/hooks/use-session-storage'
import {
  searchHistoryAPI,
  type SearchHistoryItem,
  type SearchHistoryInput,
} from '../api/search-history'

export type { SearchHistoryItem } from '../api/search-history'

const HISTORY_LIMIT = 10

export function useSearchHistory() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['search-history', user?.id]

  // Always initialize sessionStorage hook (used for anonymous path)
  const [sessionHistory, setSessionHistory] = useSessionStorage<
    SearchHistoryItem[]
  >('search-history', [])

  const backendQuery = useQuery({
    queryKey,
    queryFn: () => searchHistoryAPI.list(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  const history = user ? (backendQuery.data ?? []) : sessionHistory

  const addToHistory = useMutation({
    mutationFn: async (search: SearchHistoryInput) => {
      if (!user) {
        const newSearch: SearchHistoryItem = {
          ...search,
          id: `${search.lat}-${search.lon}-${Date.now()}`,
          searchedAt: Date.now(),
        }
        const filtered = sessionHistory.filter(
          (item) => !(item.lat === search.lat && item.lon === search.lon),
        )
        setSessionHistory([newSearch, ...filtered].slice(0, HISTORY_LIMIT))
        return
      }

      await searchHistoryAPI.add(search)
    },
    onSuccess: () => {
      if (user) queryClient.invalidateQueries({ queryKey })
    },
  })

  const clearHistory = useMutation({
    mutationFn: async () => {
      if (!user) {
        setSessionHistory([])
        return
      }
      await searchHistoryAPI.clear()
    },
    onSuccess: () => {
      if (user) queryClient.invalidateQueries({ queryKey })
    },
  })

  return {
    history,
    addToHistory,
    clearHistory,
  }
}
