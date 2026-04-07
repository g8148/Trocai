import { cookies } from "next/headers"

export interface AuthUser {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  avatar: string | null
}

const ACCESS_KEY = "trocai_access"
const REFRESH_KEY = "trocai_refresh"
const USER_KEY = "trocai_user"

export async function getAccessToken(): Promise<string | null> {
  const store = await cookies()
  return store.get(ACCESS_KEY)?.value ?? null
}

export async function getRefreshToken(): Promise<string | null> {
  const store = await cookies()
  return store.get(REFRESH_KEY)?.value ?? null
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const store = await cookies()
  const raw = store.get(USER_KEY)?.value
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}
