"use client"

import { useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Menu,
  Home,
  MessageCircle,
  Bell,
  UserRound,
  LogOut,
} from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { AppUser } from "@/lib/api"
import { logoutAction } from "@/lib/auth-actions"
import { updateUserStatusAction } from "@/lib/app-actions"

// ─── Types ───────────────────────────────────────────────────────────────────

interface AppNavSheetProps {
  user: AppUser | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const USER_STATUSES = [
  { value: "available" as const, label: "Disponível" },
  { value: "away" as const, label: "Ausente" },
]

const NAV_LINKS = [
  { href: "/", label: "Início", icon: Home, exact: true },
  { href: "/chat", label: "Chat", icon: MessageCircle, exact: false },
  { href: "/notifications", label: "Notificações", icon: Bell, exact: false },
]

const ACCOUNT_LINKS: Array<{
  href?: string
  label: string
}> = [
  { href: "/account", label: "Meu perfil" },
  { href: "/account/items", label: "Meus itens" },
  { href: "/account/distance", label: "Distância" },
]

const SUPPORT_LINKS = [
  { href: "/support", label: "Central de ajuda" },
  { href: "/reports/new", label: "Fazer denúncia" },
]

// ─── Inner nav link (closes sheet on navigate) ────────────────────────────────

function NavLinkItem({
  href,
  label,
  icon: Icon,
  exact,
  pathname,
  onClose,
}: {
  href: string
  label: string
  icon: React.ElementType
  exact: boolean
  pathname: string
  onClose: () => void
}) {
  const router = useRouter()
  const active = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <button
      onClick={() => {
        onClose()
        router.push(href)
      }}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
        "hover:bg-[#f1f3f6]",
        active ? "font-semibold text-[#10182c]" : "text-[#5d6678]"
      )}
    >
      <Icon
        size={18}
        className={active ? "text-[#2fb1c2]" : "text-[#5d6678]"}
      />
      {label}
    </button>
  )
}

// ─── Simple link item (closes sheet on navigate) ──────────────────────────────

function SimpleLinkItem({
  href,
  label,
  pathname,
  onClose,
}: {
  href: string
  label: string
  pathname: string
  onClose: () => void
}) {
  const router = useRouter()
  const active = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <button
      onClick={() => {
        onClose()
        router.push(href)
      }}
      className={cn(
        "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
        "hover:bg-[#f1f3f6]",
        active ? "font-semibold text-[#10182c]" : "text-[#5d6678]"
      )}
    >
      {label}
    </button>
  )
}

// ─── Sheet content ────────────────────────────────────────────────────────────

function NavSheetContent({ user }: { user: AppUser | null }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<AppUser["status"]>(
    user?.status ?? "available"
  )

  const closeSheet = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-[#182034]"
          aria-label="Abrir menu"
        >
          <Menu size={22} />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="flex w-72 flex-col gap-0 overflow-y-auto p-0"
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>
        {/* User section */}
        {user && (
          <>
            <div className="flex flex-col items-center gap-3 px-5 pt-2 pb-5">
              {/* Avatar */}
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f7f9]">
                <UserRound size={28} className="text-[#2fb1c2]" />
              </div>

              {/* Name */}
              <p className="text-sm font-semibold text-[#182034]">
                {user.first_name
                  ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`
                  : user.username}
              </p>

              {/* Status toggle */}
              <div className="flex w-full rounded-xl bg-[#f1f3f6] p-1">
                {USER_STATUSES.map((option) => (
                  <button
                    key={option.value}
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        setStatus(option.value)
                        await updateUserStatusAction(option.value)
                      })
                    }
                    className={cn(
                      "flex-1 rounded-xl px-3 py-1.5 text-sm transition",
                      status === option.value
                        ? "bg-white font-semibold text-[#182034] shadow-sm"
                        : "text-[#7d8494]"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <Separator />
          </>
        )}

        {/* Navigation links */}
        <nav className="flex flex-col gap-1 px-3 py-3">
          {NAV_LINKS.map((link) => (
            <NavLinkItem
              key={link.href}
              href={link.href}
              label={link.label}
              icon={link.icon}
              exact={link.exact}
              pathname={pathname}
              onClose={closeSheet}
            />
          ))}
        </nav>

        <Separator />

        {/* Account section */}
        <div className="flex flex-col gap-1 px-3 py-3">
          <p className="px-3 pb-1 text-xs font-semibold tracking-wider text-[#5d6678] uppercase">
            Minha conta
          </p>
          {ACCOUNT_LINKS.map((link) =>
            link.href ? (
              <SimpleLinkItem
                key={link.href}
                href={link.href}
                label={link.label}
                pathname={pathname}
                onClose={closeSheet}
              />
            ) : (
              <span
                key={link.label}
                className="cursor-default px-3 py-2 text-sm text-[#a0a8b5]"
              >
                {link.label}
              </span>
            )
          )}
        </div>

        <Separator />

        {/* Support section */}
        <div className="flex flex-col gap-1 px-3 py-3">
          <p className="px-3 pb-1 text-xs font-semibold tracking-wider text-[#5d6678] uppercase">
            Suporte
          </p>
          {SUPPORT_LINKS.map((link) => (
            <SimpleLinkItem
              key={link.href}
              href={link.href}
              label={link.label}
              pathname={pathname}
              onClose={closeSheet}
            />
          ))}
        </div>

        {/* Spacer + Logout */}
        {user && (
          <>
            <Separator />
            <div className="px-3 py-3">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Sair
                </button>
              </form>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

// ─── Public exports ───────────────────────────────────────────────────────────

/**
 * Full sheet with its own trigger (hamburger button).
 * Drop this anywhere you want both the trigger and the panel.
 */
export function AppNavSheet({ user }: AppNavSheetProps) {
  return <NavSheetContent user={user} />
}

/**
 * Just the hamburger trigger button.
 * Wraps the Sheet so the trigger can be placed in a header
 * while the panel still renders via the same Sheet context.
 *
 * Usage: place <AppNavSheetTrigger user={user} /> in your header.
 * The sheet panel opens from the left.
 */
export function AppNavSheetTrigger({ user }: AppNavSheetProps) {
  return <NavSheetContent user={user} />
}
