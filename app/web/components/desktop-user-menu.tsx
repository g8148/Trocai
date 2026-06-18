"use client"

import Link from "next/link"
import { UserRound } from "lucide-react"

import type { AppUser } from "@/lib/api"
import { logoutAction } from "@/lib/auth-actions"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DesktopUserMenu({ user }: { user: AppUser | null }) {
  if (!user) {
    return (
      <Button asChild size="sm">
        <Link href="/login">Entrar</Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f7f9]">
            <UserRound size={18} className="text-[#2fb1c2]" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium text-black">
            {user.first_name} {user.last_name}
          </p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account">Meu perfil</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/items">Meus itens</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/loans">Meus empréstimos</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logoutAction()}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
