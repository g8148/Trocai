"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { createLoanAction } from "@/lib/app-actions"
import { Button } from "@/components/ui/button"

export function ConfirmReservation({
  itemId,
  pickupDate,
  pickupTime,
  period,
  displayDate,
}: {
  itemId: string
  pickupDate: string
  pickupTime: string
  period: string
  displayDate: string
}) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function toDateTimeString() {
    const [hourString, minute] = pickupTime.split(":")
    const hour = Number(hourString)
    const convertedHour =
      period === "PM" && hour < 12 ? hour + 12 : period === "AM" && hour === 12 ? 0 : hour

    return `${pickupDate}T${String(convertedHour).padStart(2, "0")}:${minute}:00`
  }

  return (
    <div className="flex min-h-[calc(100svh-4rem)] flex-col justify-between px-5 pb-8 pt-12">
      <div className="space-y-10">
        <div className="space-y-8 text-[#182034]">
          <div className="flex items-center gap-4 text-[1.7rem] tracking-[-0.04em]">
            <span>📅</span>
            <span>{displayDate}</span>
          </div>
          <div className="flex items-center gap-4 text-[1.7rem] tracking-[-0.04em]">
            <span>⏱</span>
            <span>
              {pickupTime}
              {period}
            </span>
          </div>
        </div>

        <p className="text-center text-[1.25rem] leading-[1.15] tracking-[-0.04em] text-[#182034]">
          * A reserva esta sujeita a aprovacoes e acoes de outros usuarios,
          incluindo, mas nao se limitando, a devolucoes.
        </p>

        {message ? <p className="text-center text-sm text-red-500">{message}</p> : null}
      </div>

      <Button
        type="button"
        onClick={() =>
          startTransition(async () => {
            const result = await createLoanAction({
              item: itemId,
              pickup_date: toDateTimeString(),
              borrower_notes: "Reserva enviada pelo app mobile-first.",
            })

            if (!result.ok) {
              setMessage(result.error ?? "Nao foi possivel finalizar.")
              return
            }

            router.push("/account")
          })
        }
        disabled={isPending}
        className="h-14 w-full rounded-2xl bg-[#10182c] text-base font-semibold"
      >
        {isPending ? "Finalizando..." : "Finalizar"}
      </Button>
    </div>
  )
}
