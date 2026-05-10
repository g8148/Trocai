"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, SlidersHorizontal } from "lucide-react"
import Link from "next/link"

import type { ItemSummary } from "@/lib/api"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

function getToken(): string | null {
  if (typeof document === "undefined") return null
  return (
    document.cookie
      .split(";")
      .find((c) => c.trim().startsWith("trocai_access="))
      ?.trim()
      .slice("trocai_access=".length) ?? null
  )
}

async function fetchPreview(q: string): Promise<ItemSummary[]> {
  const token = getToken()
  try {
    const res = await fetch(`${API_URL}/api/items/?search=${encodeURIComponent(q)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.results ?? []).slice(0, 5)
  } catch {
    return []
  }
}

export function DesktopSearchBar() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  const [q, setQ] = useState(searchParams.get("q") ?? "")
  const [results, setResults] = useState<ItemSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)

  // Sincroniza quando a URL muda (navegação entre páginas)
  useEffect(() => {
    setQ(searchParams.get("q") ?? "")
  }, [searchParams])

  // Debounce 300ms
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

  // Fecha ao clicar fora
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = q.trim()
      if (!trimmed) return
      setFocused(false)
      router.push(`/search?q=${encodeURIComponent(trimmed)}`)
    },
    [q, router],
  )

  const close = useCallback(() => setFocused(false), [])

  const showDropdown = focused && q.trim().length >= 2 && (loading || results.length > 0)

  return (
    <div ref={containerRef} className="relative ml-auto w-80">
      <form onSubmit={handleSubmit}>
        <div
          className={`flex h-10 items-center rounded-full border transition-colors ${
            focused
              ? "border-[#2fb1c2] bg-white"
              : "border-black/10 bg-[#f0f1f2] hover:border-black/20"
          }`}
        >
          <Search className="ml-3.5 h-4 w-4 shrink-0 text-[#8a92a3]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={(e) => e.key === "Escape" && setFocused(false)}
            placeholder="Buscar ferramentas e serviços..."
            className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[#182034] outline-none placeholder:text-[#8a92a3]"
          />
          {/* Filtro — placeholder para implementação futura */}
          <button
            type="button"
            aria-label="Filtros"
            className={`mr-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all ${
              focused
                ? "text-[#8a92a3] opacity-100 hover:bg-black/5 hover:text-[#182034]"
                : "pointer-events-none opacity-0"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>

      {/* Dropdown de preview */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_16px_48px_rgba(17,24,39,0.14)]">
          {loading && results.length === 0 ? (
            <div className="divide-y divide-black/5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-[#f0f1f2]" />
                  <div className="flex-1 space-y-2">
                    <div
                      className="h-3 animate-pulse rounded bg-[#f0f1f2]"
                      style={{ width: `${60 + i * 12}%` }}
                    />
                    <div className="h-2.5 w-1/3 animate-pulse rounded bg-[#f0f1f2]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {results.map((item) => (
                <Link
                  key={item.id}
                  href={`/items/${item.id}`}
                  onClick={close}
                  className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-[#f7f8fb]"
                >
                  {item.cover_image ? (
                    <img
                      src={item.cover_image}
                      alt={item.name}
                      className="h-9 w-9 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-9 w-9 shrink-0 rounded-lg bg-[#f0f1f2]" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#182034]">{item.name}</p>
                    {item.category_name && (
                      <p className="text-xs text-[#8a92a3]">{item.category_name}</p>
                    )}
                  </div>
                </Link>
              ))}

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
      )}
    </div>
  )
}
