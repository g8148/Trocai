"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageCircle } from "lucide-react"

export type ChatListItem = {
  id: string
  name: string
  avatar: string | null
  preview: string
}

export function ChatShell({
  list,
  children,
}: {
  list: ChatListItem[]
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isIndex = pathname === "/chat"
  const activeId = isIndex ? null : pathname.split("/")[2] ?? null

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 pt-8 pb-12 lg:px-0">
      <h1
        className={`mb-5 text-2xl font-semibold tracking-tight text-[#182034] ${
          isIndex ? "" : "hidden lg:block"
        }`}
      >
        Mensagens
      </h1>

      <div className="overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-[0_14px_40px_rgba(17,24,39,0.07)] lg:flex lg:h-[640px]">
        {/* Lista de conversas */}
        <aside
          className={`${
            isIndex ? "block" : "hidden"
          } lg:block lg:w-[340px] lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-black/5`}
        >
          {list.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ebebea]">
                <MessageCircle className="h-7 w-7 text-[#8a92a3]" />
              </div>
              <p className="text-base font-medium text-[#182034]">Nenhuma conversa</p>
              <p className="text-sm text-[#5d6678]">
                Inicie um chat ao reservar um item.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {list.map((conversation) => {
                const active = conversation.id === activeId
                return (
                  <Link
                    key={conversation.id}
                    href={`/chat/${conversation.id}`}
                    className={`flex gap-3 px-4 py-4 transition ${
                      active ? "bg-[#edfafe]" : "hover:bg-black/[0.03]"
                    }`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8ecf2] text-[#182034]">
                      {conversation.avatar ? (
                        <img
                          src={conversation.avatar}
                          alt={conversation.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-base font-semibold">
                          {conversation.name.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#182034]">
                        {conversation.name}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-sm text-[#5d6678]">
                        {conversation.preview}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </aside>

        {/* Painel: thread ou placeholder */}
        <main
          className={`${
            isIndex ? "hidden lg:flex" : "flex"
          } min-w-0 flex-1 flex-col`}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
