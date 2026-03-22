import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { LogIn, Check, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog'
import { useAuth } from '../hooks/use-auth'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  passwordRequirements,
  type LoginFields,
  type RegisterFields,
  type ForgotPasswordFields,
} from '../validation/auth-schemas'

type View = 'login' | 'register' | 'forgot'

export function AuthDialog() {
  const { t } = useTranslation()
  const { signIn, signUp, sendPasswordReset } = useAuth()

  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>('login')
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

  const loginForm = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  })

  const registerForm = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  })

  const forgotForm = useForm<ForgotPasswordFields>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
  })

  const watchedPassword = registerForm.watch('password', '')

  function switchView(next: View) {
    setView(next)
    setServerError(null)
    loginForm.reset()
    registerForm.reset()
    forgotForm.reset()
    setForgotSent(false)
  }

  async function handleLoginSubmit(data: LoginFields) {
    setServerError(null)
    setLoading(true)
    const err = await signIn(data.email, data.password)
    setLoading(false)
    if (err) {
      setServerError(err)
    } else {
      setOpen(false)
      loginForm.reset()
    }
  }

  async function handleRegisterSubmit(data: RegisterFields) {
    setServerError(null)
    setLoading(true)
    const err = await signUp(data.email, data.password)
    setLoading(false)
    if (err) {
      setServerError(err)
    } else {
      setOpen(false)
      registerForm.reset()
      toast(t('auth.signUpSuccess'))
    }
  }

  async function handleForgotSubmit(data: ForgotPasswordFields) {
    setServerError(null)
    setLoading(true)
    const err = await sendPasswordReset(data.email)
    setLoading(false)
    if (err) {
      setServerError(err)
    } else {
      setForgotSent(true)
    }
  }

  const inputClass = (hasError: boolean) =>
    `w-full rounded-md border ${hasError ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring`

  const dialogTitle =
    view === 'login'
      ? t('auth.login')
      : view === 'register'
        ? t('auth.register')
        : t('auth.forgotPassword.title')

  const dialogDescription =
    view === 'login'
      ? t('auth.loginSubtitle')
      : view === 'register'
        ? t('auth.registerSubtitle')
        : t('auth.forgotPassword.subtitle')

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
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>

          {/* Tab switcher — hidden in forgot view */}
          {view !== 'forgot' && (
            <div className="flex rounded-lg border p-1 gap-1">
              {(['login', 'register'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => switchView(v)}
                  className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                    view === v
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {v === 'login' ? t('auth.login') : t('auth.register')}
                </button>
              ))}
            </div>
          )}

          {/* Login form */}
          {view === 'login' && (
            <form
              onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('auth.email')}</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={inputClass(!!loginForm.formState.errors.email)}
                  data-testid="AuthEmailInput"
                  {...loginForm.register('email')}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {t('auth.validation.emailInvalid')}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">
                  {t('auth.password')}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={inputClass(!!loginForm.formState.errors.password)}
                  data-testid="AuthPasswordInput"
                  {...loginForm.register('password')}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {t('auth.validation.passwordTooShort')}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => switchView('forgot')}
                  className="text-xs text-muted-foreground hover:text-foreground text-right w-full"
                >
                  {t('auth.forgotPassword.link')}
                </button>
              </div>

              {serverError && (
                <p className="text-sm text-destructive">{serverError}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                data-testid="AuthSubmitButton"
              >
                {loading ? '...' : t('auth.login')}
              </Button>
            </form>
          )}

          {/* Register form */}
          {view === 'register' && (
            <form
              onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('auth.email')}</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={inputClass(!!registerForm.formState.errors.email)}
                  data-testid="AuthEmailInput"
                  {...registerForm.register('email')}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {t('auth.validation.emailInvalid')}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">
                  {t('auth.password')}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={inputClass(
                    !!registerForm.formState.errors.password,
                  )}
                  data-testid="AuthPasswordInput"
                  {...registerForm.register('password')}
                />

                {/* Password requirements checklist */}
                {watchedPassword.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {passwordRequirements.map(({ key, test }) => {
                      const passed = test(watchedPassword)
                      return (
                        <li
                          key={key}
                          className={`flex items-center gap-1.5 text-xs ${passed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
                        >
                          {passed ? (
                            <Check className="h-3 w-3 shrink-0" />
                          ) : (
                            <X className="h-3 w-3 shrink-0" />
                          )}
                          {t(`auth.validation.req.${key}`)}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">
                  {t('auth.confirmPassword')}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={inputClass(
                    !!registerForm.formState.errors.confirm,
                  )}
                  {...registerForm.register('confirm')}
                />
                {registerForm.formState.errors.confirm && (
                  <p className="text-xs text-destructive">
                    {t('auth.error.passwordMismatch')}
                  </p>
                )}
              </div>

              {serverError && (
                <p className="text-sm text-destructive">{serverError}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                data-testid="AuthSubmitButton"
              >
                {loading ? '...' : t('auth.register')}
              </Button>
            </form>
          )}

          {/* Forgot password view */}
          {view === 'forgot' && (
            <div className="space-y-3">
              {forgotSent ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {t('auth.forgotPassword.success')}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => switchView('login')}
                  >
                    {t('auth.forgotPassword.backToLogin')}
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={forgotForm.handleSubmit(handleForgotSubmit)}
                  className="space-y-3"
                >
                  <div className="space-y-1">
                    <label className="text-sm font-medium">
                      {t('auth.email')}
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className={inputClass(
                        !!forgotForm.formState.errors.email,
                      )}
                      {...forgotForm.register('email')}
                    />
                    {forgotForm.formState.errors.email && (
                      <p className="text-xs text-destructive">
                        {t('auth.validation.emailInvalid')}
                      </p>
                    )}
                  </div>

                  {serverError && (
                    <p className="text-sm text-destructive">{serverError}</p>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? '...' : t('auth.forgotPassword.submit')}
                  </Button>

                  <button
                    type="button"
                    onClick={() => switchView('login')}
                    className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
                  >
                    {t('auth.forgotPassword.backToLogin')}
                  </button>
                </form>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
