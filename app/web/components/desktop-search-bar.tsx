"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Search, SlidersHorizontal } from "lucide-react"
import Link from "next/link"

import type { ItemSummary } from "@/lib/api"
import { getItemPrimaryImage } from "@/lib/item-visuals"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

function getToken(): string | null {
  if (typeof document === "undefined") return null

  return (
    document.cookie
      .split(";")
      .find((cookie) => cookie.trim().startsWith("trocai_access="))
      ?.trim()
      .slice("trocai_access=".length) ?? null
  )
}

async function fetchPreview(q: string): Promise<ItemSummary[]> {
  const token = getToken()

  try {
    const response = await fetch(
      `${API_URL}/api/items/?search=${encodeURIComponent(q)}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    )

    if (!response.ok) return []

    const data = await response.json()
    return (data.results ?? []).slice(0, 5)
  } catch {
    return []
  }
}

type FilterKey = "condition" | "availability" | "segregation"

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

function FilterPillGroup({
  title,
  options,
  value,
  onToggle,
}: {
  title: string
  options: { value: string; label: string }[]
  value?: string
  onToggle: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8a92a3]">
        {title}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onToggle(option.value)}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
              value === option.value
                ? "border-[#2fb1c2] bg-[#2fb1c2] text-white"
                : "border-black/10 bg-[#f7f8fb] text-[#5d6678] hover:border-black/20 hover:bg-white"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function DesktopSearchBar() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)

  const [q, setQ] = useState(searchParams.get("q") ?? "")
  const [results, setResults] = useState<ItemSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  const isSearchPage = pathname === "/search"
  const currentCondition = searchParams.get("condition") ?? undefined
  const currentAvailability = searchParams.get("availability") ?? undefined
  const currentSegregation = searchParams.get("segregation") ?? undefined

  const [localFilters, setLocalFilters] = useState<Record<FilterKey, string | undefined>>({
    condition: currentCondition,
    availability: currentAvailability,
    segregation: currentSegregation,
  })

  const activeFilterCount = [
    currentCondition,
    currentAvailability,
    currentSegregation,
  ].filter(Boolean).length

  useEffect(() => {
    if (!filterOpen) return

    setLocalFilters({
      condition: currentCondition,
      availability: currentAvailability,
      segregation: currentSegregation,
    })
  }, [currentAvailability, currentCondition, currentSegregation, filterOpen])

  useEffect(() => {
    setQ(searchParams.get("q") ?? "")
  }, [searchParams])

  useEffect(() => {
    const trimmed = q.trim()
    if (trimmed.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      const items = await fetchPreview(trimmed)
      setResults(items)
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [q])

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (filterOpen) return
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setFocused(false)
      }
    }

    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [filterOpen])

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault()

      const trimmed = q.trim()
      const params = new URLSearchParams(searchParams.toString())

      setFocused(false)

      if (trimmed) {
        params.set("q", trimmed)
      } else {
        params.delete("q")
      }

      router.push(`/search?${params.toString()}`)
    },
    [q, router, searchParams]
  )

  function toggleFilter(key: FilterKey, value: string) {
    setLocalFilters((previous) => ({
      ...previous,
      [key]: previous[key] === value ? undefined : value,
    }))
  }

  function applyFilters() {
    const params = new URLSearchParams()
    const currentQ = searchParams.get("q")
    const currentType = searchParams.get("type")

    if (currentQ) params.set("q", currentQ)
    if (currentType) params.set("type", currentType)
    if (localFilters.condition) params.set("condition", localFilters.condition)
    if (localFilters.availability) {
      params.set("availability", localFilters.availability)
    }
    if (localFilters.segregation) {
      params.set("segregation", localFilters.segregation)
    }

    router.push(`/search?${params.toString()}`)
    setFilterOpen(false)
  }

  const close = useCallback(() => setFocused(false), [])
  const showDropdown = focused && q.trim().length >= 2 && (loading || results.length > 0)

  return (
    <div ref={containerRef} className="relative w-full max-w-[430px]">
      <form onSubmit={handleSubmit}>
        <div
          className={`flex h-11 items-center rounded-full border bg-background transition-colors ${
            focused
              ? "border-[#2fb1c2]/45 ring-4 ring-[#2fb1c2]/10"
              : "border-border hover:border-foreground/20"
          }`}
        >
          <Search className="ml-4 h-4 w-4 shrink-0 text-[#8a92a3]" />
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setFocused(false)
              }
            }}
            placeholder="Buscar ferramentas e serviços..."
            className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[#182034] outline-none placeholder:text-[#8a92a3]"
          />

          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Filtros"
                className={`relative mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all hover:bg-muted ${
                  isSearchPage || focused
                    ? "opacity-100"
                    : "pointer-events-none opacity-0"
                } ${
                  activeFilterCount > 0
                    ? "text-[#2fb1c2]"
                    : "text-[#8a92a3] hover:text-[#182034]"
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {activeFilterCount > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#2fb1c2] text-[8px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                ) : null}
              </button>
            </PopoverTrigger>

            <PopoverContent
              align="end"
              sideOffset={8}
              className="w-80 gap-0 p-0"
              onOpenAutoFocus={(event) => event.preventDefault()}
            >
              <div className="space-y-4 p-4">
                <FilterPillGroup
                  title="Condição"
                  options={CONDITION_OPTIONS}
                  value={localFilters.condition}
                  onToggle={(value) => toggleFilter("condition", value)}
                />
                <FilterPillGroup
                  title="Disponibilidade"
                  options={AVAILABILITY_OPTIONS}
                  value={localFilters.availability}
                  onToggle={(value) => toggleFilter("availability", value)}
                />
                <FilterPillGroup
                  title="Nível"
                  options={SEGREGATION_OPTIONS}
                  value={localFilters.segregation}
                  onToggle={(value) => toggleFilter("segregation", value)}
                />
              </div>

              <div className="flex items-center justify-between border-t border-black/5 px-4 py-3">
                <button
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams()
                    const currentQ = searchParams.get("q")
                    const currentType = searchParams.get("type")

                    if (currentQ) params.set("q", currentQ)
                    if (currentType) params.set("type", currentType)

                    router.push(`/search?${params.toString()}`)
                    setFilterOpen(false)
                  }}
                  className="text-xs text-[#8a92a3] transition hover:text-[#5d6678]"
                >
                  Limpar tudo
                </button>
                <button
                  type="button"
                  onClick={applyFilters}
                  className="rounded-lg bg-[#0d1424] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-[#182034]"
                >
                  Aplicar filtros
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </form>

      {showDropdown ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_16px_48px_rgba(17,24,39,0.14)]">
          {loading && results.length === 0 ? (
            <div className="divide-y divide-black/5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-[#f0f1f2]" />
                  <div className="flex-1 space-y-2">
                    <div
                      className="h-3 animate-pulse rounded bg-[#f0f1f2]"
                      style={{ width: `${60 + index * 12}%` }}
                    />
                    <div className="h-2.5 w-1/3 animate-pulse rounded bg-[#f0f1f2]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {results.map((item) => {
                const primaryImage = getItemPrimaryImage(item)

                return (
                  <Link
                    key={item.id}
                    href={`/items/${item.id}`}
                    onClick={close}
                    className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-[#f7f8fb]"
                  >
                    {primaryImage ? (
                      <img
                        src={primaryImage}
                        alt={item.name}
                        className="h-9 w-9 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-9 w-9 shrink-0 rounded-lg bg-[#f0f1f2]" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#182034]">
                        {item.name}
                      </p>
                      {item.category_name ? (
                        <p className="text-xs text-[#8a92a3]">{item.category_name}</p>
                      ) : null}
                    </div>
                  </Link>
                )
              })}

              <Link
                href={`/search?q=${encodeURIComponent(q.trim())}`}
                onClick={close}
                className="flex items-center gap-2.5 border-t border-black/5 px-4 py-3 text-sm font-medium text-[#2fb1c2] transition hover:bg-[#f7f8fb]"
              >
                <Search className="h-3.5 w-3.5 shrink-0" />
                Ver todos os resultados para &ldquo;{q.trim()}&rdquo;
              </Link>
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}
