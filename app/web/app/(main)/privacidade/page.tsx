export default function PrivacidadePage() {
  return (
    <div className="pb-16 pt-8">
      <div className="mx-auto max-w-2xl space-y-10 px-4 lg:px-0">
        <div className="space-y-3">
          <h1 className="text-[2rem] font-semibold leading-[1.1] tracking-[-0.04em] text-[#182034] lg:text-[2.5rem]">
            Política de Privacidade
          </h1>
          <p className="text-[#5d6678]">
            Última atualização: junho de 2026.
          </p>
        </div>

        <div className="space-y-8">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#182034]">
              1. Dados que coletamos
            </h2>
            <p className="leading-relaxed text-[#5d6678]">
              Coletamos os dados fornecidos no cadastro (nome, e-mail, CPF, telefone e endereço), dados de uso da plataforma (itens cadastrados, empréstimos realizados, avaliações) e informações de localização aproximada para exibir itens próximos.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#182034]">
              2. Como usamos seus dados
            </h2>
            <p className="leading-relaxed text-[#5d6678]">
              Seus dados são usados para operar a plataforma, conectar usuários para empréstimos, enviar notificações relacionadas às suas atividades e melhorar a experiência geral do serviço. Não vendemos seus dados a terceiros.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#182034]">
              3. Compartilhamento de dados
            </h2>
            <p className="leading-relaxed text-[#5d6678]">
              Alguns dados de perfil (nome, foto e avaliações) são visíveis para outros usuários da plataforma. Dados sensíveis como CPF e endereço completo não são compartilhados publicamente.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#182034]">
              4. Seus direitos (LGPD)
            </h2>
            <p className="leading-relaxed text-[#5d6678]">
              Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a acessar, corrigir ou solicitar a exclusão dos seus dados pessoais. Entre em contato pela página de suporte para exercer esses direitos.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#182034]">
              5. Segurança
            </h2>
            <p className="leading-relaxed text-[#5d6678]">
              Adotamos medidas técnicas para proteger seus dados contra acesso não autorizado. Senhas são armazenadas de forma criptografada e o acesso à plataforma é feito via autenticação segura.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#182034]">
              6. Contato
            </h2>
            <p className="leading-relaxed text-[#5d6678]">
              Dúvidas sobre privacidade? Entre em contato pela nossa{" "}
              <a href="/contato" className="font-medium text-[#182034] underline underline-offset-2">
                página de contato
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
