import Link from "next/link"

export function Footer() {
  return (
    <footer className="mt-10 px-4 pb-6 lg:px-6 lg:pb-8">
      <div className="mx-auto max-w-[1180px] rounded-[30px] border border-black/6 bg-white/70 px-5 py-7 shadow-[0_18px_50px_rgba(17,24,39,0.05)] backdrop-blur-xl lg:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-[2.35rem] leading-none font-semibold tracking-[-0.06em] text-[#182034]">
              Trocai
            </p>
            <p className="max-w-sm text-sm text-[#5d6678]">
              Emprestimo de ferramentas entre vizinhos, com uma experiencia mais simples e humana.
            </p>
          </div>

          <nav className="flex flex-col gap-2 text-sm text-[#5d6678]">
            <Link
              href="/sobre"
              className="w-fit transition-colors hover:text-[#182034]"
            >
              Sobre o projeto
            </Link>
            <Link
              href="/contato"
              className="w-fit transition-colors hover:text-[#182034]"
            >
              Contato
            </Link>
          </nav>
        </div>

        <p className="mt-6 border-t border-black/5 pt-4 text-xs text-[#5d6678]">
          © 2026 Trocai · Projeto academico UNOESC
        </p>
      </div>
    </footer>
  )
}
