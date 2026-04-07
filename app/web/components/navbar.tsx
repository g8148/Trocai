"use client"

import Link from "next/link"
import { Search, Wrench } from "lucide-react"
// import { Moon, Sun } from "lucide-react"   // TODO: re-habilitar tema
// import { useTheme } from "next-themes"      // TODO: re-habilitar tema

import { logoutAction } from "@/lib/auth-actions"
import type { AuthUser } from "@/lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

function getInitials(user: AuthUser) {
  const i = `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`
  return i.toUpperCase() || user.username[0].toUpperCase()
}

export function Navbar({ user }: { user: AuthUser | null }) {
  // const { resolvedTheme, setTheme } = useTheme()  // TODO: re-habilitar tema

  // function toggleTheme() {  // TODO: re-habilitar tema
  //   setTheme(resolvedTheme === "dark" ? "light" : "dark")
  // }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold">
          <Wrench className="h-5 w-5 text-primary" />
          <span>Trocai</span>
        </Link>

        {/* Search — visível em sm+ */}
        <div className="relative hidden flex-1 sm:flex">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar ferramentas e serviços..." className="pl-9" />
        </div>

        {/* Ações */}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="sm:hidden">
            <Search className="h-5 w-5" />
            <span className="sr-only">Buscar</span>
          </Button>

          {user ? (
            <>
              <Button size="sm" className="hidden sm:flex">
                Publicar anúncio
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar ?? ""} alt={user.first_name} />
                      <AvatarFallback>{getInitials(user)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Meu perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/loans">Meus empréstimos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {/* TODO: re-habilitar tema
                  <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
                    {resolvedTheme === "dark" ? (
                      <Sun className="mr-2 h-4 w-4" />
                    ) : (
                      <Moon className="mr-2 h-4 w-4" />
                    )}
                    {resolvedTheme === "dark" ? "Modo claro" : "Modo escuro"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  */}
                  <DropdownMenuItem
                    onClick={() => logoutAction()}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button size="sm" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
          )}

          {/* Menu mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="sm:hidden">
                <span className="flex h-5 w-5 flex-col justify-center gap-1">
                  <span className="h-0.5 w-full bg-current" />
                  <span className="h-0.5 w-full bg-current" />
                  <span className="h-0.5 w-full bg-current" />
                </span>
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary" />
                  Trocai
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 flex flex-col gap-4 px-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Buscar..." className="pl-9" />
                </div>
                {user ? (
                  <>
                    <Button className="w-full">Publicar anúncio</Button>
                    <nav className="flex flex-col gap-1 text-sm">
                      <Link href="/profile" className="rounded-md px-2 py-1.5 hover:bg-accent">
                        Meu perfil
                      </Link>
                      <Link href="/loans" className="rounded-md px-2 py-1.5 hover:bg-accent">
                        Meus empréstimos
                      </Link>
                    </nav>
                    {/* TODO: re-habilitar tema
                    <button onClick={toggleTheme} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent">
                      {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      {resolvedTheme === "dark" ? "Modo claro" : "Modo escuro"}
                    </button>
                    */}
                    <button
                      onClick={() => logoutAction()}
                      className="rounded-md px-2 py-1.5 text-left text-sm text-destructive hover:bg-accent"
                    >
                      Sair
                    </button>
                  </>
                ) : (
                  <Button asChild className="w-full">
                    <Link href="/login">Entrar</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
