# Frontend Base — Design Spec

**Data:** 2026-04-06

---

## Objetivo

Instalar os componentes shadcn mais usados no projeto e criar uma Navbar e um Footer de exemplo com dados mockados. O foco é estrutura e layout — auth real é conectado depois pelo time de front.

---

## Stack

- Next.js 16, Bun, TypeScript, Tailwind 4
- shadcn `radix-nova`, cor base `neutral`
- `next-themes` já configurado (ThemeProvider no layout)
- Lucide React para ícones

---

## Componentes shadcn a instalar

```
input avatar dropdown-menu sheet separator badge card skeleton tabs dialog select sonner
```

---

## Navbar

**Layout desktop:**
```
[ Trocai 🔧 ]  [    🔍 Buscar ferramentas e serviços...    ]  [ Publicar ] [ Avatar ▾ ]
```

**Dropdown do Avatar:**
```
  Meu perfil
  Meus empréstimos
  ─────────────────
  Tema   [ Claro ] [ Escuro ]
  ─────────────────
  Sair
```

**Mobile (< md):**
- Search bar some, fica só ícone de lupa
- Avatar abre Sheet lateral com navegação completa + search + theme toggle

**Comportamento:**
- Componente Client (`"use client"`) — usa `useTheme` do `next-themes`
- Dados do usuário mockados: `{ name: "Maria Silva", avatar: null }`
- `Sheet` usa `shadcn/sheet` para o menu mobile
- Avatar sem imagem mostra iniciais (ex: "MS")

---

## Footer

**Layout:** uma linha, `sticky bottom` apenas na home, senão `static`.

```
© 2026 Trocai  ·  Sobre  ·  Como funciona  ·  Contato      [GitHub icon]
```

- Server Component (sem estado)
- Links usam `<Link>` do Next.js com `href="#"` (placeholder)

---

## Arquivos

| Arquivo | Ação |
|---|---|
| `app/web/app/layout.tsx` | Modificar: incluir `<Navbar>` e `<Footer>`, corrigir `lang="pt-BR"` |
| `app/web/components/navbar.tsx` | Criar |
| `app/web/components/footer.tsx` | Criar |
| `app/web/components/ui/*` | Gerados pelo shadcn CLI |

---

## O que o time de front conecta depois

- Substituir dados mockados por contexto de auth real
- Substituir `href="#"` pelos routes reais do Next.js
- Conectar a search bar ao endpoint `GET /api/items/?search=`
