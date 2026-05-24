"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SlidersHorizontal, X } from "lucide-react"

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer"

type SecondaryFilters = {
  condition?: string
  availability?: string
  segregation?: string
}

type Props = {
  currentFilters: SecondaryFilters
  resultCount: number
  baseParams: { q: string; type?: string }
}

const CONDITION_OPTIONS = [
  { value: "new", label: "Novo" },
  { value: "good", label: "Bom estado" },
  { value: "used", label: "Usado" },
  { value: "worn", label: "Desgastado" },
]

const AVAILABILITY_OPTIONS = [
  { value: "available", label: "Disponível" },
  { value: "borrowed", label: "Emprestado" },
  { value: "reserved", label: "Reservado" },
  { value: "unavailable", label: "Indisponível" },
]

const SEGREGATION_OPTIONS = [
  { value: "hobby", label: "Hobby" },
  { value: "semi_professional", label: "Semi-profissional" },
  { value: "professional", label: "Profissional" },
]

function FilterSection({
  title,
  options,
  value,
  onToggle,
}: {
  title: string
  options: { value: string; label: string }[]
  value?: string
  onToggle: (v: string) => void
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8a92a3]">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onToggle(opt.value)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              value === opt.value
                ? "border-[#2fb1c2] bg-[#2fb1c2] text-white"
                : "border-black/10 bg-[#f7f8fb] text-[#5d6678] hover:border-black/20 hover:bg-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function FilterDrawer({ currentFilters, resultCount, baseParams }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [local, setLocal] = useState<SecondaryFilters>(currentFilters)

  // Sync local state with URL when drawer opens
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (open) setLocal(currentFilters) }, [open])

  const activeCount = [
    currentFilters.condition,
    currentFilters.availability,
    currentFilters.segregation,
  ].filter(Boolean).length

  function toggle(key: keyof SecondaryFilters, value: string) {
    setLocal((prev) => ({ ...prev, [key]: prev[key] === value ? undefined : value }))
  }

  function apply() {
    const params = new URLSearchParams()
    if (baseParams.q) params.set("q", baseParams.q)
    if (baseParams.type) params.set("type", baseParams.type)
    if (local.condition) params.set("condition", local.condition)
    if (local.availability) params.set("availability", local.availability)
    if (local.segregation) params.set("segregation", local.segregation)
    router.push(`/search?${params.toString()}`)
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
          activeCount > 0
            ? "border-[#0d1424] bg-[#0d1424] text-white"
            : "border-black/10 bg-white text-[#5d6678] hover:border-black/20"
        }`}
      >
        <SlidersHorizontal className="h-3 w-3" />
        Filtros
        {activeCount > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white/25 px-1 text-[10px] font-bold">
            {activeCount}
          </span>
        )}
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="px-0 pb-0">
          <DrawerHeader className="flex-row items-center justify-between px-5 pb-2 pt-0 text-left">
            <DrawerTitle className="text-base font-semibold text-[#182034]">Filtros</DrawerTitle>
            <button
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#8a92a3] transition hover:bg-black/5 hover:text-[#182034]"
            >
              <X className="h-4 w-4" />
            </button>
          </DrawerHeader>

          <div className="space-y-6 overflow-y-auto px-5 py-2 pb-4">
            <FilterSection
              title="Condição"
              options={CONDITION_OPTIONS}
              value={local.condition}
              onToggle={(v) => toggle("condition", v)}
            />
            <FilterSection
              title="Disponibilidade"
              options={AVAILABILITY_OPTIONS}
              value={local.availability}
              onToggle={(v) => toggle("availability", v)}
            />
            <FilterSection
              title="Nível"
              options={SEGREGATION_OPTIONS}
              value={local.segregation}
              onToggle={(v) => toggle("segregation", v)}
            />
          </div>

          <DrawerFooter className="flex-row items-center justify-between border-t border-black/5 px-5 py-4">
            <button
              onClick={() => {
                const params = new URLSearchParams()
                if (baseParams.q) params.set("q", baseParams.q)
                if (baseParams.type) params.set("type", baseParams.type)
                router.push(`/search?${params.toString()}`)
                setOpen(false)
              }}
              className="text-sm text-[#8a92a3] transition hover:text-[#5d6678]"
            >
              Limpar tudo
            </button>
            <button
              onClick={apply}
              className="rounded-xl bg-[#0d1424] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#182034] active:scale-[0.98]"
            >
              Ver {resultCount} {resultCount === 1 ? "resultado" : "resultados"}
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
