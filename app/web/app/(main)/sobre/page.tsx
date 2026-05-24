import Link from "next/link"

export default function SobrePage() {
  return (
    <div className="pb-16 pt-8">
      <div className="mx-auto max-w-2xl space-y-10 px-4 lg:px-0">

        {/* Título */}
        <div className="space-y-3">
          <h1 className="text-[2rem] font-semibold leading-[1.1] tracking-[-0.04em] text-[#182034] lg:text-[2.5rem]">
            O que é o Trocai?
          </h1>
          <p className="text-[#5d6678]">
            Trocai é uma plataforma comunitária de empréstimo de ferramentas e serviços entre vizinhos. A ideia é simples: compartilhar é melhor do que acumular.
          </p>
        </div>

        {/* Seções de conteúdo */}
        <div className="space-y-8">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#182034]">
              Motivação
            </h2>
            <p className="leading-relaxed text-[#5d6678]">
              O modelo de consumo atual leva as pessoas a comprarem ferramentas e equipamentos que usam poucas vezes e ficam guardados. Ao mesmo tempo, o empréstimo entre vizinhos acontece de forma informal e sem controle, o que gera insegurança e desgasta as relações. O Trocai nasceu para mudar isso — formalizando o compartilhamento local de forma segura, simples e rastreável.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#182034]">
              Como funciona
            </h2>
            <p className="leading-relaxed text-[#5d6678]">
              Você cadastra os itens que tem disponíveis para emprestar. Quem precisar busca por proximidade, solicita o empréstimo e aguarda a aprovação do dono. Todo o processo — da solicitação à devolução — é registrado na plataforma, com avaliações ao final de cada empréstimo para construir confiança entre os usuários da comunidade.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#182034]">
              A equipe
            </h2>
            <p className="leading-relaxed text-[#5d6678]">
              Somos estudantes do curso de Análise e Desenvolvimento de Sistemas da UNOESC, desenvolvendo o Trocai como projeto de Prática Extensionista III. A equipe é formada por Carine Renostro, David Pereira de Souza, Gabriel Giacobbo, Laurence Alves Ribeiro, Mateus de Matos, Tais Vitória Ribeiro dos Santos, Thuaina Alexandra Maia e Yuri Aguiar Urbano.
            </p>
          </section>
        </div>

        {/* CTA */}
        <div className="rounded-[20px] border border-black/5 bg-[#efeeec] p-6">
          <p className="text-sm font-medium text-[#182034]">Quer saber mais ou entrar em contato?</p>
          <p className="mt-1 text-sm text-[#5d6678]">
            Manda uma mensagem pra gente pela{" "}
            <Link href="/contato" className="font-medium text-[#182034] underline underline-offset-2">
              página de contato
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
