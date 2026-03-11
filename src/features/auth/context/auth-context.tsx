import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export type ActivityType = 'sedentary' | 'light' | 'active' | 'athletic'

export interface UserPreferences {
  temperature_unit: 'celsius' | 'fahrenheit'
  language: 'en' | 'de' | 'ua'
  first_name?: string
  age?: number
  activity_type?: ActivityType
  onboarding_completed: boolean
}

interface AuthContextValue {
  user: User | null
  preferences: UserPreferences | null | undefined
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const API_BASE = import.meta.env.VITE_API_BASE_URL as string

async function fetchPreferences(
  token: string,
): Promise<UserPreferences | null> {
  try {
    const res = await fetch(`${API_BASE}/preferences`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [preferences, setPreferences] = useState<
    UserPreferences | null | undefined
  >(undefined)
  const [isLoading, setIsLoading] = useState(true)

  const loadPreferences = useCallback(async (token: string) => {
    const prefs = await fetchPreferences(token)
    setPreferences(prefs)
  }, [])

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session
      setUser(session?.user ?? null)
      if (session?.access_token) {
        loadPreferences(session.access_token).finally(() => setIsLoading(false))
      } else {
        setIsLoading(false)
      }
    })

    // Keep in sync with Supabase auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.access_token) {
          setPreferences(undefined) // mark as "fetching" until response arrives
          await loadPreferences(session.access_token)
        } else {
          setPreferences(null) // logged out — definitively no preferences
        }
      },
    )

    return () => listener.subscription.unsubscribe()
  }, [loadPreferences])

  const signIn = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return error?.message ?? null
    },
    [],
  )

  const signUp = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const { error } = await supabase.auth.signUp({ email, password })
      return error?.message ?? null
    },
    [],
  )

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>) => {
      const session = (await supabase.auth.getSession()).data.session
      if (!session) return

      const res = await fetch(`${API_BASE}/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(updates),
      })

      if (res.ok) {
        setPreferences((prev) =>
          prev ? { ...prev, ...updates } : (updates as UserPreferences),
        )
      }
    },
    [],
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        preferences,
        isLoading,
        signIn,
        signUp,
        signOut,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
