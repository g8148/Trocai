import Link from "next/link"

export function Footer() {
  return (
    <footer className="mt-10 w-full border-t bg-background">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 py-6 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div>
          <p className="font-semibold tracking-tight text-foreground">Trocai</p>
          <p className="mt-1 text-sm">
            Empréstimo de ferramentas e serviços com uma experiência simples e direta.
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-4">
          <Link href="/sobre" className="transition-colors hover:text-foreground">
            Sobre
          </Link>
          <Link href="/search" className="transition-colors hover:text-foreground">
            Explorar
          </Link>
          <Link href="/contato" className="transition-colors hover:text-foreground">
            Contato
          </Link>
        </nav>

        <p className="text-xs">© 2026 Trocai</p>
      </div>
    </footer>
  )
}
