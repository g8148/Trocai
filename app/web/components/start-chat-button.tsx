"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { createConversationAction } from "@/lib/app-actions"
import { Button } from "@/components/ui/button"

export function StartChatButton({
  itemId,
  targetUserId,
}: {
  itemId: string
  targetUserId: string
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex-1">
      <Button
        type="button"
        onClick={() =>
          startTransition(async () => {
            const result = await createConversationAction({
              item: itemId,
              target_user: targetUserId,
            })

            if (!result.ok || !result.id) {
              setError(result.error ?? "Não foi possível abrir a conversa.")
              return
            }

            router.push(`/chat/${result.id}`)
          })
        }
        disabled={isPending}
        className="h-14 w-full rounded-2xl bg-[#10182c] text-base font-semibold"
      >
        {isPending ? "Abrindo..." : "Falar com o fornecedor"}
      </Button>
      {error ? <p className="mt-2 text-center text-xs text-red-500">{error}</p> : null}
    </div>
  )
}
