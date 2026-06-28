import { getConversations, getMe } from "@/lib/api"
import { ChatShell, type ChatListItem } from "@/components/chat-shell"

const MOCK_CONVERSATIONS: ChatListItem[] = [
  { id: "mock-joao", name: "João", avatar: null, preview: "Ah, ótimo! Esclareceu minhas dúvidas." },
  { id: "mock-miguel", name: "Miguel", avatar: null, preview: "Aguardo retorno!" },
  { id: "mock-alice", name: "Alice", avatar: null, preview: "Obrigada, acredito que vá servir para o meu projeto!" },
  { id: "mock-jose", name: "José", avatar: null, preview: "Estamos combinados!" },
]

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [conversations, me] = await Promise.all([getConversations(), getMe()])

  const list: ChatListItem[] = conversations.length
    ? conversations.map((conversation) => {
        const other =
          conversation.participants.find((p) => p.id !== me?.id) ??
          conversation.participants[0]
        return {
          id: conversation.id,
          name: other?.first_name || other?.username || "Usuário",
          avatar: other?.avatar ?? null,
          preview: conversation.last_message?.content || "Conversa iniciada",
        }
      })
    : MOCK_CONVERSATIONS

  return <ChatShell list={list}>{children}</ChatShell>
}
