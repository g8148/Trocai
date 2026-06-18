"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { addDays, format, startOfToday } from "date-fns"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/forms/date-picker"

const FIELD_CLASS =
  "h-11 rounded-lg border-[#e0e0de] bg-white px-4 text-sm shadow-none focus-visible:border-[#2fb1c2] focus-visible:ring-1 focus-visible:ring-[#2fb1c2]/40"

const LABEL_CLASS =
  "text-[11px] font-medium tracking-widest text-[#666] uppercase"

export function ReserveForm({ itemId }: { itemId: string }) {
  const router = useRouter()
  const [pickupDate, setPickupDate] = useState<Date | undefined>(addDays(startOfToday(), 1))
  const [pickupTime, setPickupTime] = useState("09:00")
  const [returnDate, setReturnDate] = useState<Date | undefined>(addDays(startOfToday(), 8))
  const [error, setError] = useState<string | null>(null)

  function handleContinue() {
    setError(null)
    if (!pickupDate || !returnDate) {
      setError("Escolha a data de retirada e a de devolução.")
      return
    }
    if (format(returnDate, "yyyy-MM-dd") <= format(pickupDate, "yyyy-MM-dd")) {
      setError("A devolução deve ser depois da retirada.")
      return
    }
    const params = new URLSearchParams({
      pickupDate: format(pickupDate, "yyyy-MM-dd"),
      pickupTime,
      returnDate: format(returnDate, "yyyy-MM-dd"),
    })
    router.push(`/items/${itemId}/reserve/confirm?${params.toString()}`)
  }

  return (
    <div className="px-4 pt-2 lg:px-0">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-black/7 bg-white p-6 shadow-[0_14px_32px_rgba(17,24,39,0.06)]">
        <h2 className="text-lg font-semibold tracking-tight text-[#111]">
          Quando você quer o item?
        </h2>
        <p className="mt-1 mb-6 text-sm text-[#999]">
          Escolha a retirada e quando pretende devolver.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pickup-date" className={LABEL_CLASS}>
                Data de retirada
              </Label>
              <DatePicker
                id="pickup-date"
                value={pickupDate}
                onChange={setPickupDate}
                disabled={{ before: startOfToday() }}
                placeholder="Escolher data"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pickup-time" className={LABEL_CLASS}>
                Hora
              </Label>
              <Input
                id="pickup-time"
                type="time"
                value={pickupTime}
                onChange={(event) => setPickupTime(event.target.value)}
                className={FIELD_CLASS}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="return-date" className={LABEL_CLASS}>
              Devolução prevista
            </Label>
            <DatePicker
              id="return-date"
              value={returnDate}
              onChange={setReturnDate}
              disabled={{ before: pickupDate ?? startOfToday() }}
              placeholder="Escolher data"
            />
          </div>

          {error && (
            <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleContinue}
            className="h-11 w-full rounded-lg bg-[#2fb1c2] text-sm font-medium text-white transition-colors hover:bg-[#26a0b0]"
          >
            Seguir
          </button>
        </div>
      </div>
    </div>
  )
}
