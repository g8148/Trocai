import Link from "next/link"
import { Bell, MessageCircle, Search } from "lucide-react"

import type { AppUser } from "@/lib/api"
import { AppLogo } from "@/components/app-logo"
import { AppNavSheetTrigger } from "@/components/app-nav-sheet"
import { DesktopSearchBar } from "@/components/desktop-search-bar"
import { DesktopUserMenu } from "@/components/desktop-user-menu"
import { DesktopCategoryLinks } from "@/components/desktop-category-links"

export function AppHeader({ user }: { user: AppUser | null }) {
  return (
    <header className="sticky top-0 z-30 px-3 pt-3 lg:px-6 lg:pt-4">
      <div className="mx-auto max-w-[1180px] rounded-[28px] border border-black/6 bg-white/72 shadow-[0_14px_40px_rgba(17,24,39,0.06)] backdrop-blur-2xl">
        <div className="flex h-14 items-center px-4 lg:hidden">
          <AppNavSheetTrigger user={user} />
          <Link href="/" className="mx-auto">
            <AppLogo />
          </Link>
          <Link
            href="/search"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f6f7] text-[#182034] transition hover:bg-[#e9eef1]"
            aria-label="Buscar"
          >
            <Search size={18} />
          </Link>
        </div>

        <div className="hidden h-[74px] items-center gap-4 px-5 lg:flex">
          <Link href="/" className="shrink-0">
            <AppLogo />
          </Link>

          <DesktopCategoryLinks />

          <DesktopSearchBar />

          <div className="flex shrink-0 items-center gap-1 rounded-full bg-[#f4f7f8] p-1.5">
            <Link
              href="/chat"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#182034] transition hover:bg-white"
              aria-label="Chat"
            >
              <MessageCircle size={18} />
            </Link>
            <Link
              href="/notifications"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#182034] transition hover:bg-white"
              aria-label="Notificacoes"
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
