import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const AUTH_ONLY = ["/login", "/register", "/forgot-password"]
const PROTECTED_PREFIXES = [
  "/search",
  "/notifications",
  "/account",
  "/chat",
  "/items",
  "/support",
  "/reports",
  "/reviews",
]

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoggedIn = request.cookies.has("trocai_access")

  const isProtectedRoute =
    pathname === "/" || PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (AUTH_ONLY.some((path) => pathname.startsWith(path)) && isLoggedIn) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
