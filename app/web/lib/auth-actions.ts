"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import type { AuthUser } from "./auth"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
const API_OFFLINE_MESSAGE = `Nao foi possivel conectar a API em ${BASE_URL}. Inicie o backend para testar login e cadastro.`

const ACCESS_MAX_AGE = 30 * 60
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60

type LoginResponse = {
  access: string
  refresh: string
  user: AuthUser
}

type FieldErrors = Record<string, string[]>

async function setAuthCookies(access: string, refresh: string, user: AuthUser) {
  const store = await cookies()

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

async function parseJsonResponse<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T
  } catch {
    return null
  }
}

function getAuthErrorMessage(body: Record<string, string[] | string> | null) {
  if (Array.isArray(body?.non_field_errors) && body.non_field_errors[0]) {
    return body.non_field_errors[0]
  }

  if (typeof body?.detail === "string") {
    return body.detail
  }

  return "Credenciais invalidas."
}

export async function loginAction(data: {
  login: string
  password: string
}): Promise<{ error?: string }> {
  const login = typeof data.login === "string" ? data.login.trim() : ""
  const password = typeof data.password === "string" ? data.password : ""
  const isEmailLogin = login.includes("@")

  if (!login || !password) {
    return { error: "Informe usuario ou email e senha para entrar." }
  }

  let res: Response

  try {
    res = await fetch(`${BASE_URL}/api/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(isEmailLogin ? { email: login } : { username: login }),
        password,
      }),
    })
  } catch {
    return { error: API_OFFLINE_MESSAGE }
  }

  if (!res.ok) {
    const body = await parseJsonResponse<Record<string, string[] | string>>(res)
    return { error: getAuthErrorMessage(body) }
  }

  const body = await parseJsonResponse<LoginResponse>(res)

  if (!body?.access || !body.refresh || !body.user) {
    return { error: "A API respondeu sem os dados esperados de autenticacao." }
  }

  await setAuthCookies(body.access, body.refresh, body.user)
  return {}
}

export async function registerAction(data: {
  first_name: string
  last_name: string
  username: string
  email: string
  cpf: string
  phone?: string
  password1: string
  password2: string
  zip_code?: string
  street?: string
  neighborhood?: string
  city?: string
  state?: string
}): Promise<{ fieldErrors?: FieldErrors; error?: string }> {
  let res: Response

  try {
    res = await fetch(`${BASE_URL}/api/auth/registration/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  } catch {
    return { error: API_OFFLINE_MESSAGE }
  }

  if (!res.ok) {
    const body = await parseJsonResponse<FieldErrors>(res)
    return body
      ? { fieldErrors: body }
      : { error: "Nao foi possivel concluir o cadastro." }
  }

  const body = await parseJsonResponse<LoginResponse>(res)

  if (!body?.access || !body.refresh || !body.user) {
    return { error: "A API respondeu sem os dados esperados de autenticacao." }
  }

  await setAuthCookies(body.access, body.refresh, body.user)
  return {}
}

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
    }).catch(() => {})
  }

  await clearAuthCookies()
  redirect("/login")
}
