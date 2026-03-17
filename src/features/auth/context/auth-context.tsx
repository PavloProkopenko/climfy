import {
  createContext,
  useContext,
  useEffect,
  useRef,
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
  sendPasswordReset: (email: string) => Promise<string | null>
  updatePassword: (password: string) => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const API_BASE = import.meta.env.VITE_API_BASE_URL as string

const PREFS_CACHE_TTL = 30 * 60 * 1000 // 30 min

function readPrefsCache(userId: string): UserPreferences | null {
  try {
    const raw = localStorage.getItem(`climfy_prefs_${userId}`)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw) as {
      data: UserPreferences
      ts: number
    }
    if (Date.now() - ts > PREFS_CACHE_TTL) return null
    return data
  } catch {
    return null
  }
}

function writePrefsCache(userId: string, prefs: UserPreferences) {
  try {
    localStorage.setItem(
      `climfy_prefs_${userId}`,
      JSON.stringify({ data: prefs, ts: Date.now() }),
    )
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded)
  }
}

function clearPrefsCache(userId: string) {
  try {
    localStorage.removeItem(`climfy_prefs_${userId}`)
  } catch {
    // localStorage may be unavailable
  }
}

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
  const loadedForUserRef = useRef<string | null>(null)

  const loadPreferences = useCallback(async (token: string, userId: string) => {
    if (loadedForUserRef.current === userId) return // dedup: same user already loaded
    loadedForUserRef.current = userId

    const cached = readPrefsCache(userId)
    if (cached) {
      setPreferences(cached)
      return
    }

    const prefs = await fetchPreferences(token)
    setPreferences(prefs)
    if (prefs) writePrefsCache(userId, prefs)
  }, [])

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session
      setUser(session?.user ?? null)
      if (session?.access_token && session.user) {
        loadPreferences(session.access_token, session.user.id).finally(() =>
          setIsLoading(false),
        )
      } else {
        setIsLoading(false)
      }
    })

    // Keep in sync with Supabase auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') return

        setUser(session?.user ?? null)
        if (session?.access_token && session.user) {
          // Only flash loading state if it's a different user (new sign-in)
          if (loadedForUserRef.current !== session.user.id) {
            setPreferences(undefined)
          }
          await loadPreferences(session.access_token, session.user.id)
        } else {
          if (loadedForUserRef.current)
            clearPrefsCache(loadedForUserRef.current)
          loadedForUserRef.current = null
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

  const sendPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return error?.message ?? null
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    return error?.message ?? null
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
        setPreferences((prev) => {
          const updated = prev
            ? { ...prev, ...updates }
            : (updates as UserPreferences)
          if (session.user?.id) writePrefsCache(session.user.id, updated)
          return updated
        })
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
        sendPasswordReset,
        updatePassword,
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
