"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { CalendarDays, RotateCcw } from "lucide-react"

import { createLoanAction } from "@/lib/app-actions"

export function ConfirmReservation({
  itemId,
  pickupDate,
  pickupTime,
  returnDate,
  displayDate,
}: {
  itemId: string
  pickupDate: string
  pickupTime: string
  returnDate: string
  displayDate: string
}) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function pickupDateTime() {
    return new Date(`${pickupDate}T${pickupTime}:00`).toISOString()
  }

  function returnDateTime() {
    // Devolução no fim do dia escolhido.
    return new Date(`${returnDate}T18:00:00`).toISOString()
  }

  return (
    <div className="rounded-[24px] border border-black/5 bg-white p-6 shadow-[0_14px_40px_rgba(17,24,39,0.07)] lg:p-8">
      <h2 className="text-lg font-semibold tracking-tight text-[#111]">
        Confirme sua reserva
      </h2>
        <p className="mt-1 mb-6 text-sm text-[#999]">
          Revise os detalhes antes de enviar ao dono do item.
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl border border-black/6 bg-[#fafafa] px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8f7f9]">
              <CalendarDays className="h-4 w-4 text-[#2fb1c2]" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-medium tracking-widest text-[#666] uppercase">
                Retirada
              </p>
              <p className="truncate text-sm text-[#182034]">
                {displayDate} às {pickupTime}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-black/6 bg-[#fafafa] px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8f7f9]">
              <RotateCcw className="h-4 w-4 text-[#2fb1c2]" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-medium tracking-widest text-[#666] uppercase">
                Devolução prevista
              </p>
              <p className="truncate text-sm text-[#182034]">{returnDate}</p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-[#999]">
          A solicitação está sujeita à aprovação do dono do item.
        </p>

        {message && (
          <p className="mt-4 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={() =>
            startTransition(async () => {
              const result = await createLoanAction({
                item: itemId,
                pickup_date: pickupDateTime(),
                expected_return_date: returnDateTime(),
                borrower_notes: "Solicitação enviada pelo app.",
              })

              if (!result.ok) {
                setMessage(result.error ?? "Não foi possível finalizar.")
                return
              }

              router.push("/loans")
            })
          }
          disabled={isPending}
          className="mt-6 h-11 w-full rounded-lg bg-[#2fb1c2] text-sm font-medium text-white transition-colors hover:bg-[#26a0b0] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? "Enviando..." : "Reservar"}
        </button>
    </div>
  )
}
