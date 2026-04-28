import Link from "next/link"
import { MessageCircle } from "lucide-react"

import { getConversations } from "@/lib/api"

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
          conversation.participants.find((p) => p.first_name)?.first_name ||
          conversation.participants.find((p) => p.username)?.username ||
          "Usuário",
        preview: conversation.last_message?.content || "Conversa iniciada",
      }))
    : MOCK_CONVERSATIONS

  return (
    <div className="pb-8">
      <div className="px-4 pb-3 pt-5">
        <h1 className="text-xl font-semibold tracking-tight text-[#182034]">Conversas</h1>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-4 pt-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ebebea]">
            <MessageCircle className="h-7 w-7 text-[#8a92a3]" />
          </div>
          <p className="text-base font-medium text-[#182034]">Nenhuma conversa</p>
          <p className="text-sm text-[#5d6678]">Inicie um chat ao reservar um item.</p>
        </div>
      ) : (
        <div className="divide-y divide-black/5">
          {list.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/chat/${conversation.id}`}
              className="flex gap-4 px-4 py-4 transition hover:bg-black/3"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e8ecf2] text-[#182034]">
                <span className="text-base font-semibold">{conversation.name.slice(0, 1).toUpperCase()}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#182034]">{conversation.name}</p>
                <p className="mt-0.5 line-clamp-1 text-sm text-[#5d6678]">{conversation.preview}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
