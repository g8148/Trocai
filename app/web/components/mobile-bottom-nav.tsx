"use client"

import Link from "next/link"
import { Home, MessageCircle, UserRound } from "lucide-react"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/account", label: "Conta", icon: UserRound },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="sticky bottom-0 z-30 border-t border-black/5 bg-white/95 px-6 pb-[calc(1.1rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
      <div className="flex items-end justify-between">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)

          return (
            <Link
              key={href}
              href={href}
              className="flex min-w-16 flex-col items-center gap-1 text-xs"
            >
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-2xl transition",
                  active ? "bg-[#10182c] text-white shadow-[0_12px_24px_rgba(16,24,44,0.18)]" : "text-[#182034]"
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className={cn(active ? "font-semibold text-[#10182c]" : "text-[#5d6678]")}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
