"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { EyeOff, PencilLine } from "lucide-react"

import { deleteItemAction } from "@/lib/app-actions"
import { Button } from "@/components/ui/button"

interface ItemOwnerActionsProps {
  itemId: string
  isOwner: boolean
}

export function ItemOwnerActions({
  itemId,
  isOwner,
}: ItemOwnerActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showHideConfirm, setShowHideConfirm] = useState(false)
  const [hideError, setHideError] = useState<string | null>(null)

  if (!isOwner) {
    return null
  }

  const handleHide = () => {
    startTransition(async () => {
      const result = await deleteItemAction(itemId)

      if (!result.ok) {
        setHideError(result.error ?? "Erro ao ocultar item.")
        return
      }

      router.push("/account/items")
      router.refresh()
    })
  }

  return (
    <>
      <div className="flex gap-2 lg:flex-col">
        <Link
          href={`/items/${itemId}/edit`}
          className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-[#2fb1c2] px-4 text-sm font-semibold text-white transition hover:bg-[#2aa0b0] lg:h-14 lg:flex-none lg:w-full"
        >
          <span className="inline-flex items-center gap-2">
            <PencilLine size={16} />
            Editar
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setShowHideConfirm(true)}
          disabled={isPending}
          className="flex h-12 flex-1 items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50 lg:h-14 lg:w-full lg:flex-none"
        >
          <span className="inline-flex items-center gap-2">
            <EyeOff size={16} />
            Ocultar
          </span>
        </button>
      </div>

      {showHideConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-[32px] bg-white px-6 py-10 shadow-[0_28px_80px_rgba(16,24,44,0.18)]">
            <h2 className="text-center text-xl font-semibold text-[#182034]">
              Ocultar item?
            </h2>
            <p className="mt-4 text-center text-sm text-[#5d6678]">
              O item sera retirado do catalogo publico, mas continuara salvo na sua conta.
            </p>

            {hideError ? (
              <p className="mt-4 text-center text-sm text-red-600">
                {hideError}
              </p>
            ) : null}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowHideConfirm(false)
                  setHideError(null)
                }}
                disabled={isPending}
                className="flex-1 rounded-2xl border border-black/10 py-3 text-sm font-semibold text-[#182034] transition hover:bg-black/5 disabled:opacity-50"
              >
                Cancelar
              </button>
              <Button
                type="button"
                onClick={handleHide}
                disabled={isPending}
                className="flex-1 rounded-2xl bg-red-600 py-3 text-sm font-semibold hover:bg-red-700"
              >
                {isPending ? "Ocultando..." : "Ocultar"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
