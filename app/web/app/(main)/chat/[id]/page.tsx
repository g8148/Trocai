import Link from "next/link"

import { getConversation, getMessages } from "@/lib/api"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

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
  const conversation = await getConversation(id)
  const messages = conversation ? await getMessages(id) : []
  const fallback = MOCK_THREADS[id]

  const title =
    conversation?.participants.find((participant) => participant.first_name)?.first_name ||
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
      <div className="space-y-3 px-4 pb-3 pt-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/chat">Conversas</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
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
