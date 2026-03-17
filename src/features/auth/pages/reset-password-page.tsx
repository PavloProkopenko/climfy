import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../hooks/use-auth'
import {
  resetPasswordSchema,
  passwordRequirements,
  type ResetPasswordFields,
} from '../validation/auth-schemas'
import { RoutePath } from '@/shared/resources/enums'

type SessionState = 'checking' | 'ready' | 'invalid'

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [sessionState, setSessionState] = useState<SessionState>('checking')

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        (event === 'PASSWORD_RECOVERY' ||
          event === 'SIGNED_IN' ||
          event === 'INITIAL_SESSION') &&
        session
      ) {
        setSessionState('ready')
      } else if (event === 'INITIAL_SESSION' && !session) {
        // No session yet — only safe to mark invalid if there's no recovery token in URL
        const hasToken =
          window.location.hash.includes('type=recovery') ||
          window.location.search.includes('type=recovery')
        if (!hasToken) {
          setSessionState('invalid')
        }
        // else: wait — PASSWORD_RECOVERY will fire shortly
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFields>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
  })

  const watchedPassword = watch('password', '')

  const inputClass = (hasError: boolean) =>
    `w-full rounded-md border ${hasError ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring`

  async function onSubmit(data: ResetPasswordFields) {
    setServerError(null)
    const err = await updatePassword(data.password)
    if (err) {
      setServerError(err)
    } else {
      toast.success(t('auth.resetPassword.success'))
      navigate(RoutePath.Root)
    }
  }

  if (sessionState === 'checking') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse">...</p>
      </div>
    )
  }

  if (sessionState === 'invalid') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-2xl font-semibold">
            {t('auth.resetPassword.title')}
          </h1>
          <p className="text-sm text-destructive">
            {t('auth.resetPassword.invalidLink')}
          </p>
          <Button variant="outline" onClick={() => navigate(RoutePath.Root)}>
            {t('auth.forgotPassword.backToLogin')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">
            {t('auth.resetPassword.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('auth.resetPassword.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('auth.password')}</label>
            <input
              type="password"
              placeholder="••••••••"
              className={inputClass(!!errors.password)}
              {...register('password')}
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
              className={inputClass(!!errors.confirm)}
              {...register('confirm')}
            />
            {errors.confirm && (
              <p className="text-xs text-destructive">
                {t('auth.error.passwordMismatch')}
              </p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? '...' : t('auth.resetPassword.submit')}
          </Button>
        </form>
      </div>
    </div>
  )
}
