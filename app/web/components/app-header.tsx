import Link from "next/link"
import { MessageCircle, Bell, Search } from "lucide-react"

import type { AppUser } from "@/lib/api"
import { AppNavSheetTrigger } from "@/components/app-nav-sheet"
import { AppLogo } from "@/components/app-logo"
import { DesktopUserMenu } from "@/components/desktop-user-menu"
import { DesktopSearchBar } from "@/components/desktop-search-bar"
import { DesktopCategoryLinks } from "./desktop-category-links"

export function AppHeader({ user }: { user: AppUser | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur-xl">
      {/* ── Mobile ───────────────────────────────────────────── */}
      <div className="flex h-14 items-center px-4 lg:hidden">
        <AppNavSheetTrigger user={user} />
        <Link href="/" className="mx-auto">
          <AppLogo />
        </Link>
        <Link
          href="/search"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#182034] transition hover:bg-black/5"
          aria-label="Buscar"
        >
          <Search size={20} />
        </Link>
      </div>

      {/* ── Desktop — barra única ────────────────────────────── */}
      <div className="mx-auto hidden h-16 max-w-7xl items-center gap-6 px-6 lg:flex">
        <Link href="/" className="shrink-0">
          <AppLogo />
        </Link>

        <div className="h-5 w-px bg-black/8" />

        <DesktopCategoryLinks />

        <DesktopSearchBar />

        <div className="flex shrink-0 items-center gap-1">
          <Link
            href="/chat"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#182034] transition hover:bg-black/5"
            aria-label="Chat"
          >
            <MessageCircle size={20} />
          </Link>
          <Link
            href="/notifications"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#182034] transition hover:bg-black/5"
            aria-label="Notificações"
          >
            <Bell size={20} />
          </Link>
          <DesktopUserMenu user={user} />
        </div>
      </div>
    </header>
  )
}
