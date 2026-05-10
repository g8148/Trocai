import Link from "next/link"

import { getItems } from "@/lib/api"
import { ItemCard } from "@/components/item-card"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    type?: string
    condition?: string
    availability?: string
    segregation?: string
  }>
}) {
  const { q = "", type, condition, availability, segregation } = await searchParams

  const items = await getItems(
    q,
    type === "tool" || type === "service" ? type : undefined,
    undefined,
    condition,
    availability,
    segregation,
  )

  return (
    <div className="pb-6">
      <div className="space-y-3 px-4 pb-4 pt-4 lg:pt-2">
        {/* Input — só mobile (desktop usa o header) */}
        <form className="lg:hidden">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar itens..."
            autoFocus
            className="h-11 w-full rounded-2xl border border-black/10 bg-[#ebebea] px-4 text-sm text-[#182034] outline-none transition placeholder:text-[#8a92a3] focus:border-[#2fb1c2] focus:bg-white"
          />
          <button type="submit" hidden />
        </form>

        {/* Tipo */}
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ["", "Todos"],
              ["tool", "Ferramentas"],
              ["service", "Serviços"],
            ] as const
          ).map(([value, label]) => {
            const active = (type ?? "") === value
            const params = new URLSearchParams()
            if (q) params.set("q", q)
            if (value) params.set("type", value)
            if (condition) params.set("condition", condition)
            if (availability) params.set("availability", availability)
            if (segregation) params.set("segregation", segregation)
            return (
              <Link
                key={label}
                href={`/search?${params.toString()}`}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "border-[#0d1424] bg-[#0d1424] text-white"
                    : "border-black/10 bg-white text-[#5d6678] hover:border-black/20"
                }`}
              >
                {label}
              </Link>
            )
          })}

          {items.length > 0 && (
            <span className="ml-auto text-xs text-[#8a92a3]">
              {items.length} {items.length === 1 ? "resultado" : "resultados"}
            </span>
          )}
        </div>
      </div>

      {/* Resultados */}
      <div className="px-4 lg:px-0">
        {items.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} href={`/items/${item.id}`} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-black/10 bg-[#efeeec] p-12 text-center text-sm text-[#5d6678]">
            <p className="text-base font-medium text-[#182034]">Nenhum resultado encontrado</p>
            <p className="mt-1">Tente buscar por outro termo ou ajustar os filtros.</p>
          </div>
        )}
      </div>
    </div>
  )
}
