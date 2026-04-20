import Link from "next/link"

import { getConversations } from "@/lib/api"
import { MobileHeader } from "@/components/mobile-header"

const MOCK_CONVERSATIONS = [
  { id: "mock-joao", name: "Joao", preview: "Ah, otimo! Esclareceu minhas duvidas." },
  { id: "mock-miguel", name: "Miguel", preview: "Aguardo retorno!" },
  { id: "mock-alice", name: "Alice", preview: "Obrigada, acredito que va servir para o meu projeto!" },
  { id: "mock-jose", name: "Jose", preview: "Estamos combinados!" },
]

export default async function ChatPage() {
  const conversations = await getConversations()
  const list = conversations.length
    ? conversations.map((conversation) => ({
        id: conversation.id,
        name:
          conversation.participants.find((participant) => participant.first_name)?.first_name ||
          conversation.participants.find((participant) => participant.username)?.username ||
          "Usuario",
        preview: conversation.last_message?.content || "Conversa iniciada",
      }))
    : MOCK_CONVERSATIONS

  return (
    <div className="pb-8">
      <MobileHeader title="Conversa" backHref="/" />
      <div className="divide-y divide-black/6">
        {list.map((conversation) => (
          <Link
            key={conversation.id}
            href={`/chat/${conversation.id}`}
            className="flex gap-4 px-5 py-5 transition hover:bg-black/3"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e8ecf2] text-[#182034]">
              <span className="text-xl font-semibold">{conversation.name.slice(0, 1)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[1.1rem] font-semibold tracking-[-0.03em] text-[#182034]">
                {conversation.name}
              </h2>
              <p className="line-clamp-2 text-[1rem] leading-6 text-[#5d6678]">
                {conversation.preview}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
