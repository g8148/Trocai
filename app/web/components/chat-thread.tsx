"use client"

import { useEffect, useRef, useState } from "react"
import { Send } from "lucide-react"

import { fetchThreadAction, sendMessageAction } from "@/lib/app-actions"
import type { MessageEntry } from "@/lib/api"

const POLL_INTERVAL = 4000

type Optimistic = { tempId: string; content: string }

export function ChatThread({
  conversationId,
  initialMessages,
  meId,
}: {
  conversationId: string
  initialMessages: MessageEntry[]
  meId: string | null
}) {
  const [messages, setMessages] = useState<MessageEntry[]>(initialMessages)
  const [optimistic, setOptimistic] = useState<Optimistic[]>([])
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Substitui as mensagens do servidor e descarta otimistas já confirmadas
  // (mesma autoria + mesmo conteúdo), evitando duplicar na corrida com o poll.
  function mergeServer(incoming: MessageEntry[]) {
    setMessages(incoming)
    setOptimistic((opt) =>
      opt.filter(
        (o) =>
          !incoming.some(
            (m) => m.sender.id === meId && m.content === o.content
          )
      )
    )
  }

  // Polling: busca mensagens novas a cada 4s (decisão do projeto)
  useEffect(() => {
    let active = true
    const interval = setInterval(async () => {
      try {
        const { messages: fresh } = await fetchThreadAction(conversationId)
        if (active) mergeServer(fresh)
      } catch {
        // poll silencioso: mantém o último estado bom
      }
    }, POLL_INTERVAL)
    return () => {
      active = false
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, meId])

  // Auto-scroll para o fim quando chega conteúdo novo
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length, optimistic.length])

  async function send() {
    const content = draft.trim()
    if (!content || sending) return

    setError(null)
    const tempId = `tmp-${Date.now()}`
    setOptimistic((o) => [...o, { tempId, content }])
    setDraft("")
    setSending(true)

    const result = await sendMessageAction(conversationId, content)

    if (!result.ok) {
      setOptimistic((o) => o.filter((m) => m.tempId !== tempId))
      setDraft(content) // devolve o texto pro usuário tentar de novo
      setError(result.error ?? "Não foi possível enviar a mensagem.")
    } else {
      try {
        const { messages: fresh } = await fetchThreadAction(conversationId)
        mergeServer(fresh)
      } catch {
        // se o refetch falhar, o polling pega na próxima volta
      }
    }
    setSending(false)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      send()
    }
  }

  const isEmpty = messages.length === 0 && optimistic.length === 0

  return (
    <>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 lg:px-6">
        {isEmpty ? (
          <p className="mt-8 text-center text-sm text-[#8a92a3]">
            Nenhuma mensagem ainda. Diga olá!
          </p>
        ) : null}

        {messages.map((message) => (
          <Bubble
            key={message.id}
            mine={message.sender.id === meId}
            content={message.content}
          />
        ))}

        {optimistic.map((message) => (
          <Bubble key={message.tempId} mine pending content={message.content} />
        ))}

        <div ref={bottomRef} />
      </div>

      {error ? (
        <p className="px-4 pb-1 text-xs text-red-500 lg:px-6">{error}</p>
      ) : null}

      <div className="flex items-end gap-2 border-t border-black/5 px-4 py-3 lg:px-6">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Escreva uma mensagem..."
          className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[#182034] outline-none placeholder:text-[#8a92a3] focus:border-[#2fb1c2]"
        />
        <button
          type="button"
          onClick={send}
          disabled={!draft.trim() || sending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#10182c] text-white transition hover:bg-[#243149] disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Enviar</span>
        </button>
      </div>
    </>
  )
}

function Bubble({
  mine,
  content,
  pending,
}: {
  mine: boolean
  content: string
  pending?: boolean
}) {
  return (
    <div
      className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed lg:max-w-[70%] ${
        mine
          ? "ml-auto bg-[#0d1424] text-white"
          : "mr-auto bg-[#ebebea] text-[#182034]"
      } ${pending ? "opacity-60" : ""}`}
    >
      {content}
    </div>
  )
}
