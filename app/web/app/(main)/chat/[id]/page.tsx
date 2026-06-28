import Link from "next/link"
import { ChevronLeft, Flag } from "lucide-react"

import { getConversation, getMe, getMessages } from "@/lib/api"
import { ChatThread } from "@/components/chat-thread"

const MOCK_THREADS: Record<
  string,
  {
    title: string
    messages: Array<{ sender: "them" | "me"; content: string }>
  }
> = {
  "mock-joao": {
    title: "João",
    messages: [
      {
        sender: "them",
        content:
          "Oi! Vi que você demonstrou interesse em pegar minha furadeira emprestada. Posso te ajudar com alguma dúvida?",
      },
      {
        sender: "me",
        content:
          "Oi, João! Tudo bem? Queria saber se essa furadeira é boa para furar parede de concreto.",
      },
      {
        sender: "them",
        content:
          "Tudo bem sim! Ela é uma furadeira de impacto de 700w, da Bosch. Dá conta do concreto, sim, só precisa usar uma broca de vídeo boa.",
      },
      { sender: "me", content: "Perfeito. E essas brocas vêm junto?" },
      {
        sender: "them",
        content:
          "Sim, eu posso te emprestar um jogo de brocas básicas também, se quiser.",
      },
      { sender: "me", content: "Ah, ótimo! Esclareceu minhas dúvidas." },
    ],
  },
}

export default async function ChatThreadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [conversation, me] = await Promise.all([getConversation(id), getMe()])
  const messages = conversation ? await getMessages(id) : []
  const fallback = MOCK_THREADS[id]

  const other =
    conversation?.participants.find((participant) => participant.id !== me?.id) ??
    conversation?.participants[0] ??
    null

  const title =
    other?.first_name || other?.username || fallback?.title || "Conversa"

  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-black/5 px-4 py-3 lg:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/chat"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#5d6678] transition hover:bg-black/5 lg:hidden"
          >
            <ChevronLeft size={18} />
            <span className="sr-only">Conversas</span>
          </Link>
          <p className="truncate text-base font-semibold text-[#182034]">{title}</p>
        </div>
        {other ? (
          <Link
            href={`/reports/new?targetUser=${other.id}&userName=${encodeURIComponent(other.first_name || other.username)}`}
            className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-[#8a92a3] transition hover:text-red-500"
          >
            <Flag className="h-3.5 w-3.5" />
            Denunciar
          </Link>
        ) : null}
      </div>

      {conversation ? (
        <ChatThread
          conversationId={id}
          initialMessages={messages}
          meId={me?.id ?? null}
        />
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 lg:px-6">
          {(fallback?.messages ?? []).map((message, index) => (
            <div
              key={`${id}-${index}`}
              className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed lg:max-w-[70%] ${
                message.sender === "me"
                  ? "ml-auto bg-[#0d1424] text-white"
                  : "mr-auto bg-[#ebebea] text-[#182034]"
              }`}
            >
              {message.content}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
