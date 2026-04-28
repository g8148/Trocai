import Link from "next/link"
import { MessageCircle, Bell } from "lucide-react"
import { AppNavSheetTrigger } from "@/components/app-nav-sheet"
import { AppLogo } from "@/components/app-logo"
import type { AppUser } from "@/lib/api"

export function AppHeader({ user }: { user: AppUser | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur-xl">
      <div className="flex h-14 items-center px-4">
        {/* Hambúrguer — abre o Sheet */}
        <AppNavSheetTrigger user={user} />

        {/* Logo centralizado */}
        <Link href="/" className="mx-auto">
          <AppLogo compact />
        </Link>

        {/* Ícones à direita */}
        <div className="flex items-center gap-1">
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
        </div>
      </div>
    </header>
  )
}
