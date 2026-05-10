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
    <nav className="flex items-center gap-0.5">
      {LINKS.map(({ href, label, exact }) => {
        const active = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              active
                ? "font-semibold text-[#10182c]"
                : "text-[#5d6678] hover:bg-black/5 hover:text-[#10182c]"
            )}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
