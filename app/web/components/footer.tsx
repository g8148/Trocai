import Link from "next/link"

export function Footer() {
  return (
    <footer className="mt-8 border-t border-black/5 bg-[#fefefe]">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          {/* Marca */}
          <div className="space-y-2">
            <p className="text-[2.6rem] leading-none font-semibold tracking-[-0.06em] text-[#182034]">
              Trocai
            </p>
            <p className="text-sm text-[#5d6678]">
              Empréstimo de ferramentas entre vizinhos.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-col gap-2 text-sm text-[#5d6678]">
            <Link
              href="/sobre"
              className="w-fit transition-colors hover:text-[#182034]"
            >
              Sobre o projeto
            </Link>
            {/*<Link
              href="#"
              className="w-fit transition-colors hover:text-[#182034]"
            >
              Como funciona
            </Link>*/}
            <Link
              href="/contato"
              className="w-fit transition-colors hover:text-[#182034]"
            >
              Contato
            </Link>
          </nav>
        </div>

        <p className="mt-8 border-t border-black/5 pt-5 text-xs text-[#5d6678]">
          © 2026 Trocai · Projeto acadêmico UNOESC
        </p>
      </div>
    </footer>
  )
}
