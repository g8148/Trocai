"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/", label: "Início", exact: true },
  { href: "/search", label: "Explorar", exact: false },
  { href: "/account/items", label: "Meus itens", exact: false },
]

export function DesktopCategoryLinks() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1 rounded-full bg-[#f4f7f8] p-1">
      {LINKS.map(({ href, label, exact }) => {
        const active = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-full px-4 py-2 text-sm transition-all",
              active
                ? "bg-white font-semibold text-[#10182c] shadow-[0_8px_20px_rgba(17,24,39,0.05)]"
                : "text-[#5d6678] hover:bg-white/70 hover:text-[#10182c]"
            )}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
