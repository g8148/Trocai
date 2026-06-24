import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
const ACCESS_MAX_AGE = 30 * 60

const AUTH_ONLY = ["/login", "/register", "/forgot-password"]
const PROTECTED_PREFIXES = [
  "/search",
  "/notifications",
  "/account",
  "/chat",
  "/items",
  "/reports",
  "/reviews",
]

async function tryRefresh(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    })
    if (!res.ok) return null
    const { access } = await res.json()
    return access ?? null
  } catch {
    return null
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get("trocai_access")?.value
  const refreshToken = request.cookies.get("trocai_refresh")?.value

  const isProtectedRoute =
    pathname === "/" || PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  const isAuthOnly = AUTH_ONLY.some((path) => pathname.startsWith(path))

  if (isProtectedRoute && !accessToken) {
    if (!refreshToken) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const newAccess = await tryRefresh(refreshToken)
    if (!newAccess) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const response = NextResponse.next()
    response.cookies.set("trocai_access", newAccess, {
      httpOnly: false,
      sameSite: "lax",
      maxAge: ACCESS_MAX_AGE,
      path: "/",
    })
    return response
  }

  if (isAuthOnly && accessToken) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
