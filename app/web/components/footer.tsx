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
