"use client"

import Link from "next/link"
import { useState } from "react"
import { Send, Mail, MessageSquare } from "lucide-react"

const CONTACT_EMAIL = "help.trocai@gmail.com"

export default function ContatoPage() {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [assunto, setAssunto] = useState("")
  const [mensagem, setMensagem] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body = `Nome: ${nome}\nEmail: ${email}\n\n${mensagem}`
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
  }

  const filled = nome && email && assunto && mensagem

  return (
    <div className="pb-16 pt-8">
      <div className="mx-auto max-w-2xl px-4 lg:px-0">
        {/* Hero */}
        <div className="mb-8 space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ff8b2c]/20 bg-[#fff5ec] px-3 py-1">
            <MessageSquare className="h-3.5 w-3.5 text-[#ff8b2c]" />
            <span className="text-xs font-medium text-[#ff8b2c]">
              Fale com a equipe
            </span>
          </div>
          <h1 className="text-[2rem] leading-[1.1] font-semibold tracking-[-0.04em] text-[#182034] lg:text-[2.5rem]">
            Tem alguma dúvida
            <br />
            ou sugestão?
          </h1>
          <p className="text-[#5d6678]">
            Preencha o formulário e abriremos um e-mail para você enviar direto.
          </p>
        </div>

        {/* Card do formulário */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-[24px] border border-black/5 bg-white p-6 shadow-[0_14px_40px_rgba(17,24,39,0.07)] lg:p-8"
        >
          {/* Nome + Email */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-[#182034]"
                htmlFor="nome"
              >
                Nome
              </label>
              <input
                id="nome"
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                className="h-11 w-full rounded-xl border border-black/10 bg-[#fafafa] px-3 text-sm text-[#182034] transition outline-none placeholder:text-[#9aa3b2] focus:border-[#182034] focus:bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-[#182034]"
                htmlFor="email"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="h-11 w-full rounded-xl border border-black/10 bg-[#fafafa] px-3 text-sm text-[#182034] transition outline-none placeholder:text-[#9aa3b2] focus:border-[#182034] focus:bg-white"
              />
            </div>
          </div>

          {/* Assunto */}
          <div className="space-y-1.5">
            <label
              className="text-sm font-medium text-[#182034]"
              htmlFor="assunto"
            >
              Assunto
            </label>
            <input
              id="assunto"
              type="text"
              required
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              placeholder="Sobre o que você quer falar?"
              className="h-11 w-full rounded-xl border border-black/10 bg-[#fafafa] px-3 text-sm text-[#182034] transition outline-none placeholder:text-[#9aa3b2] focus:border-[#182034] focus:bg-white"
            />
          </div>

          {/* Mensagem */}
          <div className="space-y-1.5">
            <label
              className="text-sm font-medium text-[#182034]"
              htmlFor="mensagem"
            >
              Mensagem
            </label>
            <textarea
              id="mensagem"
              required
              rows={5}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Descreva sua dúvida ou sugestão..."
              className="w-full resize-none rounded-xl border border-black/10 bg-[#fafafa] px-3 py-3 text-sm text-[#182034] transition outline-none placeholder:text-[#9aa3b2] focus:border-[#182034] focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={!filled}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#10182c] text-sm font-semibold text-white transition hover:bg-[#182034] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
            Abrir no e-mail
          </button>
        </form>

        {/* Contato direto */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#5d6678]">
          <Mail className="h-4 w-4 shrink-0" />
          <span>Ou escreva diretamente para</span>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-[#182034] underline-offset-2 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </div>
  )
}
