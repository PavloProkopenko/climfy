import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LogOut, Settings } from 'lucide-react'
import { useAuth } from '../hooks/use-auth'
import { AuthDialog } from './auth-dialog'
import { ProfileDialog } from './profile-dialog'

export function AuthButton() {
  const { t } = useTranslation()
  const { user, preferences, signOut } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  if (!user) {
    return <AuthDialog />
  }

  const initials = preferences?.first_name
    ? preferences.first_name.slice(0, 2).toUpperCase()
    : (user.email?.slice(0, 2).toUpperCase() ?? '??')

  const displayName = preferences?.first_name ?? user.email?.split('@')[0] ?? ''

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
        data-testid="AuthUserButton"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
          {initials}
        </span>
        <span className="hidden sm:block max-w-24 truncate">{displayName}</span>
      </button>

      {menuOpen && (
        <>
          {/* Backdrop to close menu on outside click */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-50 min-w-40 rounded-lg border border-border bg-background shadow-lg py-1">
            <button
              onClick={() => {
                setMenuOpen(false)
                setProfileOpen(true)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              <Settings className="h-4 w-4" />
              {t('profile.title')}
            </button>
            <div className="my-1 border-t border-border" />
            <button
              onClick={() => {
                setMenuOpen(false)
                signOut()
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
              data-testid="AuthLogoutButton"
            >
              <LogOut className="h-4 w-4" />
              {t('auth.logout')}
            </button>
          </div>
        </>
      )}

      <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  )
}
