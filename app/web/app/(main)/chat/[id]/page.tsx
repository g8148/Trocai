import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { getConversation, getMessages } from "@/lib/api"

const MOCK_THREADS: Record<
  string,
  {
    title: string
    messages: Array<{ sender: "them" | "me"; content: string }>
  }
> = {
  "mock-joao": {
    title: "Joao",
    messages: [
      { sender: "them", content: "Oi! Vi que voce demonstrou interesse em pegar minha furadeira emprestada. Posso te ajudar com alguma duvida?" },
      { sender: "me", content: "Oi, Joao! Tudo bem? Queria saber se essa furadeira e boa pra furar parede de concreto." },
      { sender: "them", content: "Tudo bem sim! Ela e uma furadeira de impacto de 700w, da Bosch. Da conta do concreto, sim - so precisa usar uma broca de video boa." },
      { sender: "me", content: "Perfeito. E essas brocas vem junto?" },
      { sender: "them", content: "Sim, eu posso te emprestar um jogo de brocas basicas tambem, se quiser." },
      { sender: "me", content: "Ah, otimo! Esclareceu minhas duvidas." },
    ],
  },
}

export default async function ChatThreadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const conversation = await getConversation(id)
  const messages = conversation ? await getMessages(id) : []
  const fallback = MOCK_THREADS[id]

  const title =
    conversation?.participants.find((p) => p.first_name)?.first_name ||
    fallback?.title ||
    "Conversa"

  const thread = messages.length
    ? messages.map((message) => ({
        sender: message.sender.username ? ("them" as const) : ("me" as const),
        content: message.content,
      }))
    : fallback?.messages ?? []

  return (
    <div className="pb-8">
      <div className="flex items-center gap-2 px-4 pb-3 pt-4">
        <Link
          href="/chat"
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#5d6678] transition hover:bg-black/5"
        >
          <ChevronLeft size={18} />
          <span className="sr-only">Voltar</span>
        </Link>
        <p className="text-base font-semibold text-[#182034]">{title}</p>
      </div>

      <div className="space-y-3 px-4 py-2">
        {thread.map((message, index) => (
          <div
            key={`${id}-${index}`}
            className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              message.sender === "me"
                ? "ml-auto bg-[#0d1424] text-white"
                : "mr-auto bg-[#ebebea] text-[#182034]"
            }`}
          >
            {message.content}
          </div>
        ))}
      </div>
    </div>
  )
}
