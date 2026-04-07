# Frontend Base Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Instalar os componentes shadcn necessários e criar Navbar com search/dropdown e Footer de exemplo.

**Architecture:** Navbar é Client Component (precisa de `useTheme` e estado do Sheet mobile). Footer é Server Component. Ambos são incluídos no `layout.tsx` raiz. Dados de usuário são mockados — o time conecta auth real depois.

**Tech Stack:** Next.js 16, TypeScript, Tailwind 4, shadcn `radix-nova`, `next-themes`, Lucide React, Bun

---

## Arquivos

| Arquivo | Ação |
|---|---|
| `app/web/app/layout.tsx` | Modificar: `lang="pt-BR"`, importar e renderizar `<Navbar>` e `<Footer>` |
| `app/web/app/page.tsx` | Modificar: atualizar conteúdo placeholder para PT-BR |
| `app/web/components/navbar.tsx` | Criar: Navbar com search, avatar, dropdown, sheet mobile |
| `app/web/components/footer.tsx` | Criar: Footer simples com links Next.js |
| `app/web/components/ui/*` | Gerados pelo `shadcn add` |

---

## Task 1: Instalar componentes shadcn

**Files:**
- Create: `app/web/components/ui/input.tsx` (e demais, via CLI)

- [ ] **Step 1: Instalar todos os componentes de uma vez**

```bash
cd app/web && bunx shadcn add input avatar dropdown-menu sheet separator badge card skeleton tabs dialog select sonner
```

Quando perguntar "Would you like to proceed?", responder `y`.

Expected: cada componente criado em `components/ui/`. Saída similar a:
```
✔ input - Done
✔ avatar - Done
✔ dropdown-menu - Done
...
```

- [ ] **Step 2: Verificar que os arquivos foram criados**

```bash
ls app/web/components/ui/
```

Expected: `avatar.tsx  badge.tsx  button.tsx  card.tsx  dialog.tsx  dropdown-menu.tsx  input.tsx  select.tsx  separator.tsx  sheet.tsx  skeleton.tsx  sonner.tsx  tabs.tsx`

---

## Task 2: Criar o Footer

**Files:**
- Create: `app/web/components/footer.tsx`

- [ ] **Step 1: Criar `app/web/components/footer.tsx`**

```tsx
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-6 sm:flex-row sm:justify-between">
        <span className="text-sm font-semibold tracking-tight">Trocai</span>

        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="#" className="px-2 transition-colors hover:text-foreground">
            Sobre
          </Link>
          <Separator orientation="vertical" className="h-3" />
          <Link href="#" className="px-2 transition-colors hover:text-foreground">
            Como funciona
          </Link>
          <Separator orientation="vertical" className="h-3" />
          <Link href="#" className="px-2 transition-colors hover:text-foreground">
            Contato
          </Link>
        </nav>

        <p className="text-xs text-muted-foreground">© 2026 Trocai</p>
      </div>
    </footer>
  )
}
```

---

## Task 3: Criar a Navbar

**Files:**
- Create: `app/web/components/navbar.tsx`

- [ ] **Step 1: Criar `app/web/components/navbar.tsx`**

```tsx
"use client"

import Link from "next/link"
import { Moon, Search, Sun, Wrench } from "lucide-react"
import { useTheme } from "next-themes"

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

// Dados mockados — substituir por contexto de auth real
const MOCK_USER = {
  name: "Maria Silva",
  email: "maria@trocai.com",
  avatar: "",
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function Navbar() {
  const { resolvedTheme, setTheme } = useTheme()

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

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
          <Input
            placeholder="Buscar ferramentas e serviços..."
            className="pl-9"
          />
        </div>

        {/* Ações desktop */}
        <div className="ml-auto flex items-center gap-2">
          {/* Ícone de busca mobile */}
          <Button variant="ghost" size="icon" className="sm:hidden">
            <Search className="h-5 w-5" />
            <span className="sr-only">Buscar</span>
          </Button>

          {/* Botão publicar */}
          <Button size="sm" className="hidden sm:flex">
            Publicar anúncio
          </Button>

          {/* Menu do usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={MOCK_USER.avatar} alt={MOCK_USER.name} />
                  <AvatarFallback>{getInitials(MOCK_USER.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{MOCK_USER.name}</p>
                  <p className="text-xs text-muted-foreground">{MOCK_USER.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="#">Meu perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="#">Meus empréstimos</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
                {resolvedTheme === "dark" ? (
                  <Sun className="mr-2 h-4 w-4" />
                ) : (
                  <Moon className="mr-2 h-4 w-4" />
                )}
                {resolvedTheme === "dark" ? "Modo claro" : "Modo escuro"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
                <Button className="w-full">Publicar anúncio</Button>
                <nav className="flex flex-col gap-1 text-sm">
                  <Link href="#" className="rounded-md px-2 py-1.5 hover:bg-accent">
                    Meu perfil
                  </Link>
                  <Link href="#" className="rounded-md px-2 py-1.5 hover:bg-accent">
                    Meus empréstimos
                  </Link>
                </nav>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                >
                  {resolvedTheme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  {resolvedTheme === "dark" ? "Modo claro" : "Modo escuro"}
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
```

---

## Task 4: Atualizar o layout e a página inicial

**Files:**
- Modify: `app/web/app/layout.tsx`
- Modify: `app/web/app/page.tsx`

- [ ] **Step 1: Atualizar `app/web/app/layout.tsx`**

Substituir o conteúdo completo:

```tsx
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", fontSans.variable)}
    >
      <body className="flex min-h-svh flex-col">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Atualizar `app/web/app/page.tsx`**

```tsx
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const MOCK_ITEMS = [
  { id: 1, name: "Furadeira de Impacto", category: "Ferramentas Elétricas", owner: "João S.", status: "Disponível" },
  { id: 2, name: "Cortador de Grama", category: "Jardinagem", owner: "Ana P.", status: "Disponível" },
  { id: 3, name: "Betoneira 120L", category: "Construção", owner: "Carlos M.", status: "Emprestado" },
]

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Itens disponíveis</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_ITEMS.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{item.name}</CardTitle>
                <Badge variant={item.status === "Disponível" ? "default" : "secondary"}>
                  {item.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{item.category}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Dono: {item.owner}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                Ver detalhes
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

---

## Task 5: Verificar no navegador

- [ ] **Step 1: Instalar dependências e subir o servidor**

```bash
cd app/web && bun install && bun dev
```

Expected: servidor rodando em `http://localhost:3000`

- [ ] **Step 2: Verificar checklist visual**

Abrir `http://localhost:3000` e confirmar:

- [ ] Navbar aparece no topo com logo, search bar e avatar "MS"
- [ ] Clicar no avatar abre dropdown com "Meu perfil", "Meus empréstimos", toggle de tema e "Sair"
- [ ] Clicar no toggle de tema muda entre claro e escuro
- [ ] Footer aparece na parte inferior com links e copyright
- [ ] Cards de itens mockados aparecem na página inicial com badges de status
- [ ] Em tela pequena (< 640px): search some e o ícone hamburguer abre o Sheet lateral
