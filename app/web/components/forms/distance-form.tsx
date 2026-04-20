"use client"

import { useState, useTransition } from "react"
import { Minus, Plus, X } from "lucide-react"

import { updateDistanceAction } from "@/lib/app-actions"
import type { AppUser } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SuccessDialog } from "@/components/success-dialog"

export function DistanceForm({ user }: { user: AppUser }) {
  const [radius, setRadius] = useState(user.search_radius_km || 5)
  const [message, setMessage] = useState<string | null>(null)
  const [showInfo, setShowInfo] = useState(true)
  const [isPending, startTransition] = useTransition()

  return (
    <>
      <div className="space-y-6 px-5 pb-8 pt-6">
        <Input
          value="Minha localizacao"
          disabled
          className="h-12 rounded-2xl border-black/10 px-4 text-base"
        />

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setRadius((value) => Math.max(1, value - 1))}
            className="text-[#182034]"
          >
            <Minus className="h-5 w-5" />
          </button>
          <input
            type="range"
            min={1}
            max={30}
            value={radius}
            onChange={(event) => setRadius(Number(event.target.value))}
            className="h-1.5 flex-1 accent-[#10182c]"
          />
          <button
            type="button"
            onClick={() => setRadius((value) => Math.min(30, value + 1))}
            className="text-[#182034]"
          >
            <Plus className="h-5 w-5" />
          </button>
          <div className="rounded-2xl border border-black/8 px-4 py-3 text-sm font-medium text-[#5d6678]">
            {radius} KM
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[28px] border border-[#182034]/12 bg-[#eef2f7]">
          <div className="h-[470px] bg-[radial-gradient(circle_at_center,_rgba(47,177,194,0.18),_transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.8),rgba(225,232,242,0.95))]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,32,52,0.06)_1px,transparent_1px),linear-gradient(0deg,rgba(24,32,52,0.06)_1px,transparent_1px)] bg-[size:44px_44px]" />
          <div className="absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#182034]/30 bg-[#dff5f7]/45" />
          <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#10182c] shadow-[0_0_0_8px_rgba(47,177,194,0.18)]" />
          <span className="absolute left-1/2 top-[56%] -translate-x-1/2 text-sm font-medium text-[#182034]">
            Chapeco
          </span>
        </div>

        {message ? <p className="text-sm text-[#2fb1c2]">{message}</p> : null}

        <Button
          type="button"
          onClick={() =>
            startTransition(async () => {
              const result = await updateDistanceAction(radius)
              setMessage(result.ok ? "Distancia atualizada." : result.error ?? "Erro ao salvar.")
            })
          }
          disabled={isPending}
          className="h-14 w-full rounded-2xl bg-[#10182c] text-base font-semibold"
        >
          {isPending ? "Salvando..." : "Salvar distancia"}
        </Button>
      </div>

      {showInfo ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/10 p-6 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-[32px] bg-white px-6 py-10 text-center shadow-[0_28px_80px_rgba(16,24,44,0.18)]">
            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="ml-auto flex h-10 w-10 items-center justify-center rounded-full text-[#182034]"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="mt-2 text-[2.4rem] font-medium tracking-[-0.06em] text-[#182034]">
              AVISO!
            </h2>
            <p className="mt-6 whitespace-pre-line text-[1.4rem] leading-[1.22] tracking-[-0.05em] text-[#182034]">
              Por padrao, mostramos resultados em um raio de 5 km da sua localizacao.
              {"\n"}Quer buscar mais longe? E so ajustar a distancia!
            </p>
          </div>
        </div>
      ) : null}
    </>
  )
}
