import { getConversation, getMessages } from "@/lib/api"
import { MobileHeader } from "@/components/mobile-header"

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
      {
        sender: "them",
        content: "Oi! Vi que voce demonstrou interesse em pegar minha furadeira emprestada. Posso te ajudar com alguma duvida?",
      },
      {
        sender: "me",
        content: "Oi, Joao! Tudo bem? Queria saber se essa furadeira e boa pra furar parede de concreto.",
      },
      {
        sender: "them",
        content: "Tudo bem sim! Ela e uma furadeira de impacto de 700w, da Bosch. Da conta do concreto, sim - so precisa usar uma broca de video boa.",
      },
      {
        sender: "me",
        content: "Perfeito. E essas brocas vem junto?",
      },
      {
        sender: "them",
        content: "Sim, eu posso te emprestar um jogo de brocas basicas tambem, se quiser.",
      },
      {
        sender: "me",
        content: "Ah, otimo! Esclareceu minhas duvidas.",
      },
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
    conversation?.participants.find((participant) => participant.first_name)?.first_name ||
    fallback?.title ||
    "Conversa"

  const thread = messages.length
    ? messages.map((message) => ({
        sender: message.sender.username ? "them" : "me",
        content: message.content,
      }))
    : fallback?.messages ?? []

  return (
    <div className="pb-8">
      <MobileHeader title={title} backHref="/chat" />
      <div className="space-y-3 px-3 py-5">
        {thread.map((message, index) => (
          <div
            key={`${id}-${index}`}
            className={`max-w-[86%] rounded-[20px] border border-[#182034] px-4 py-3 text-[1.05rem] leading-6 text-[#182034] ${message.sender === "me" ? "ml-auto bg-white" : "mr-auto bg-[#fbfcfe]"}`}
          >
            {message.content}
          </div>
        ))}
      </div>
    </div>
  )
}
