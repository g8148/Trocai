"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"

import type { AuthUser } from "./auth"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

// 30 min em segundos (Django ACCESS_TOKEN_LIFETIME)
const ACCESS_MAX_AGE = 30 * 60
// 7 dias em segundos (Django REFRESH_TOKEN_LIFETIME)
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60

async function setAuthCookies(access: string, refresh: string, user: AuthUser) {
  const store = await cookies()
  // trocai_access: não-httpOnly para o proxy.ts conseguir ler via request.cookies
  store.set("trocai_access", access, {
    httpOnly: false,
    sameSite: "lax",
    maxAge: ACCESS_MAX_AGE,
    path: "/",
  })
  store.set("trocai_refresh", refresh, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: REFRESH_MAX_AGE,
    path: "/",
  })
  store.set("trocai_user", JSON.stringify(user), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: REFRESH_MAX_AGE,
    path: "/",
  })
}

async function clearAuthCookies() {
  const store = await cookies()
  store.delete("trocai_access")
  store.delete("trocai_refresh")
  store.delete("trocai_user")
}

// ---------------------------------------------------------------------------

export async function loginAction(data: {
  email: string
  password: string
}): Promise<{ error?: string }> {
  const res = await fetch(`${BASE_URL}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const body = (await res.json()) as Record<string, string[]>
    return {
      error: body.non_field_errors?.[0] ?? "Credenciais inválidas.",
    }
  }

  const { access, refresh, user } = (await res.json()) as {
    access: string
    refresh: string
    user: AuthUser
  }

  await setAuthCookies(access, refresh, user)
  return {}
}

// ---------------------------------------------------------------------------

type FieldErrors = Record<string, string[]>

export async function registerAction(data: {
  first_name: string
  last_name: string
  username: string
  email: string
  cpf: string
  password1: string
  password2: string
}): Promise<{ fieldErrors?: FieldErrors; error?: string }> {
  const res = await fetch(`${BASE_URL}/api/auth/registration/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const body = (await res.json()) as FieldErrors
    return { fieldErrors: body }
  }

  const { access, refresh, user } = (await res.json()) as {
    access: string
    refresh: string
    user: AuthUser
  }

  await setAuthCookies(access, refresh, user)
  return {}
}

// ---------------------------------------------------------------------------

export async function logoutAction(): Promise<void> {
  const store = await cookies()
  const access = store.get("trocai_access")?.value
  const refresh = store.get("trocai_refresh")?.value

  if (access && refresh) {
    await fetch(`${BASE_URL}/api/auth/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
      body: JSON.stringify({ refresh }),
    }).catch(() => {}) // ignora erro de rede — limpa cookies de qualquer forma
  }

  await clearAuthCookies()
  redirect("/login")
}
