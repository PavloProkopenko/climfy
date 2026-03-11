import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LogIn } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog'
import { useAuth } from '../hooks/use-auth'

type Tab = 'login' | 'register'

export function AuthDialog() {
  const { t } = useTranslation()
  const { signIn, signUp } = useAuth()

  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function resetForm() {
    setEmail('')
    setPassword('')
    setConfirm('')
    setError(null)
  }

  function switchTab(next: Tab) {
    setTab(next)
    resetForm()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (tab === 'register' && password !== confirm) {
      setError(t('auth.error.passwordMismatch'))
      return
    }

    setLoading(true)
    const err =
      tab === 'login'
        ? await signIn(email, password)
        : await signUp(email, password)
    setLoading(false)

    if (err) {
      setError(err)
    } else {
      setOpen(false)
      resetForm()
    }
  }

  const inputClass =
    'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        data-testid="AuthLoginButton"
      >
        <LogIn className="mr-2 h-4 w-4" />
        {t('auth.login')}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {tab === 'login' ? t('auth.login') : t('auth.register')}
            </DialogTitle>
            <DialogDescription>
              {tab === 'login'
                ? t('auth.loginSubtitle')
                : t('auth.registerSubtitle')}
            </DialogDescription>
          </DialogHeader>

          {/* Tab switcher */}
          <div className="flex rounded-lg border p-1 gap-1">
            {(['login', 'register'] as Tab[]).map((t_) => (
              <button
                key={t_}
                onClick={() => switchTab(t_)}
                className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                  tab === t_
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t_ === 'login' ? t('auth.login') : t('auth.register')}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('auth.email')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
                data-testid="AuthEmailInput"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">
                {t('auth.password')}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
                data-testid="AuthPasswordInput"
              />
            </div>

            {tab === 'register' && (
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  {t('auth.confirmPassword')}
                </label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              data-testid="AuthSubmitButton"
            >
              {loading
                ? '...'
                : tab === 'login'
                  ? t('auth.login')
                  : t('auth.register')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
