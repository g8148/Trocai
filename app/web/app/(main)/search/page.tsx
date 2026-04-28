import Link from "next/link"

import { getItems } from "@/lib/api"
import { ItemCard } from "@/components/item-card"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>
}) {
  const { q = "", type } = await searchParams
  const items = await getItems(
    q,
    type === "tool" || type === "service" ? type : undefined
  )

  return (
    <div className="pb-6">
      <div className="space-y-4 px-4 pb-4 pt-4">
        <form>
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar itens..."
            autoFocus
            className="h-11 w-full rounded-2xl border border-black/10 bg-[#ebebea] px-4 text-sm text-[#182034] placeholder:text-[#8a92a3] outline-none focus:border-[#2fb1c2] focus:bg-white transition"
          />
          <button type="submit" hidden />
        </form>

        <div className="flex gap-2">
          {([["", "Todos"], ["service", "Serviços"], ["tool", "Ferramentas"]] as const).map(([value, label]) => {
            const active = (type ?? "") === value
            const params = new URLSearchParams()
            if (q) params.set("q", q)
            if (value) params.set("type", value)
            return (
              <Link
                key={label}
                href={`/search?${params.toString()}`}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                  active
                    ? "border-[#0d1424] bg-[#0d1424] text-white"
                    : "border-black/10 bg-white text-[#5d6678] hover:border-black/20"
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="space-y-4 px-4">
        {items.length > 0 ? (
          items.map((item) => (
            <ItemCard key={item.id} item={item} href={`/items/${item.id}`} />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-black/10 bg-[#efeeec] p-8 text-center text-sm text-[#5d6678]">
            Nenhum resultado encontrado.
          </div>
        )}
      </div>
    </div>
  )
}
