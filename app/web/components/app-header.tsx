import Link from "next/link"
import { Bell, MessageCircle, Search } from "lucide-react"

import type { AppUser } from "@/lib/api"
import { AppLogo } from "@/components/app-logo"
import { AppNavSheetTrigger } from "@/components/app-nav-sheet"
import { DesktopCategoryLinks } from "@/components/desktop-category-links"
import { DesktopSearchBar } from "@/components/desktop-search-bar"
import { DesktopUserMenu } from "@/components/desktop-user-menu"

export function AppHeader({ user }: { user: AppUser | null }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="mx-auto flex h-14 max-w-[1180px] items-center gap-3 px-4 lg:h-16 lg:px-6">
        <div className="flex w-full items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <AppNavSheetTrigger user={user} />
            <Link href="/" className="shrink-0">
              <AppLogo className="h-9" />
            </Link>
          </div>

          <Link
            href="/search"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#182034] transition hover:bg-muted"
            aria-label="Buscar"
          >
            <Search size={18} />
          </Link>
        </div>

        <div className="hidden w-full items-center gap-5 lg:flex">
          <Link href="/" className="shrink-0">
            <AppLogo className="h-10" />
          </Link>

          <DesktopCategoryLinks />

          <div className="min-w-0 flex-1">
            <DesktopSearchBar />
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Link
              href="/chat"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#182034] transition hover:bg-muted"
              aria-label="Chat"
            >
              <MessageCircle size={18} />
            </Link>
            <Link
              href="/notifications"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#182034] transition hover:bg-muted"
              aria-label="Notificações"
            >
              <Bell size={18} />
            </Link>
            <DesktopUserMenu user={user} />
          </div>
        </div>
      </div>
    </header>
  )
}
