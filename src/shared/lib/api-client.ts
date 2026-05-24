import { supabase } from '@/lib/supabase'

const API_BASE = import.meta.env.VITE_API_BASE_URL as string

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface ApiFetchInit extends Omit<RequestInit, 'body'> {
  body?: unknown
  query?: Record<string, string | number | boolean | undefined>
}

export async function apiFetch<T>(
  path: string,
  { body, query, headers, ...init }: ApiFetchInit = {},
): Promise<T> {
  const url = new URL(`${API_BASE}${path}`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }
  }

  const finalHeaders = new Headers(headers)
  const { data } = await supabase.auth.getSession()
  if (data.session?.access_token) {
    finalHeaders.set('Authorization', `Bearer ${data.session.access_token}`)
  }
  if (body !== undefined && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json')
  }

  const res = await fetch(url, {
    ...init,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let message = res.statusText
    try {
      const errBody = (await res.json()) as { error?: string }
      if (errBody?.error) message = errBody.error
    } catch {
      // body was not JSON — fall back to statusText
    }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
