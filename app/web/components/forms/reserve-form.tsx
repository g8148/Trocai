"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"

export function ReserveForm({ itemId }: { itemId: string }) {
  const router = useRouter()
  const [date, setDate] = useState("2026-06-17")
  const [time, setTime] = useState("09:30")
  const [period, setPeriod] = useState<"AM" | "PM">("AM")

  const displayDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`))

  return (
    <div className="space-y-8 px-5 pb-8 pt-8">
      <p className="text-center text-[1.35rem] leading-[1.2] tracking-[-0.04em] text-[#182034]">
        Selecione a data e o horario que melhor se encaixam na sua agenda.
      </p>

      <div className="rounded-[30px] bg-[#f7f8fb] p-5">
        <div className="flex items-center justify-between">
          <span className="text-[1.8rem] font-semibold tracking-[-0.05em] text-[#182034]">
            {new Intl.DateTimeFormat("pt-BR", {
              month: "short",
              year: "numeric",
            }).format(new Date(`${date}T12:00:00`))}
          </span>
          <div className="flex gap-3 text-[#182034]">
            <button type="button">{"<"}</button>
            <button type="button">{">"}</button>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-7 gap-y-4 text-center text-[1rem] text-[#182034]">
          {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"].map((day) => (
            <span key={day} className="text-xs text-[#b1b6c1]">
              {day}
            </span>
          ))}
          {Array.from({ length: 30 }).map((_, index) => {
            const day = index + 1
            const active = day === 17
            return (
              <span
                key={day}
                className={active ? "mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#b7bbc5] text-[#182034]" : ""}
              >
                {day}
              </span>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-[1.2rem] font-medium tracking-[-0.03em] text-[#182034]">
          Hora
        </span>
        <div className="flex items-center gap-3">
          <input
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            className="h-12 min-w-[92px] rounded-2xl border border-black/8 bg-[#f7f8fb] px-4 text-lg text-[#182034]"
          />
          <div className="flex rounded-2xl bg-[#f1f3f6] p-1">
            {(["AM", "PM"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setPeriod(value)}
                className={`rounded-xl px-4 py-2 text-sm ${period === value ? "bg-white font-semibold text-[#182034] shadow-[0_6px_20px_rgba(24,32,52,0.08)]" : "text-[#7d8494]"}`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        type="button"
        onClick={() =>
          router.push(
            `/items/${itemId}/reserve/confirm?pickupDate=${encodeURIComponent(date)}&pickupTime=${encodeURIComponent(time)}&period=${period}&displayDate=${encodeURIComponent(displayDate)}`
          )
        }
        className="h-14 w-full rounded-2xl bg-[#10182c] text-base font-semibold"
      >
        Seguir
      </Button>
    </div>
  )
}
