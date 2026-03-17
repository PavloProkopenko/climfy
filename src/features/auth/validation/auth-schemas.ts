import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const registerSchema = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[0-9]/)
      .regex(/[^A-Za-z0-9]/),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'passwordMismatch',
    path: ['confirm'],
  })

export type LoginFields = z.infer<typeof loginSchema>
export type RegisterFields = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})
export type ForgotPasswordFields = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[0-9]/)
      .regex(/[^A-Za-z0-9]/),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ['confirm'] })
export type ResetPasswordFields = z.infer<typeof resetPasswordSchema>

export const passwordRequirements = [
  { key: 'minLength', test: (p: string) => p.length >= 8 },
  { key: 'uppercase', test: (p: string) => /[A-Z]/.test(p) },
  { key: 'lowercase', test: (p: string) => /[a-z]/.test(p) },
  { key: 'digit', test: (p: string) => /[0-9]/.test(p) },
  { key: 'special', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const
