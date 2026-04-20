import Link from "next/link"

import { getItems } from "@/lib/api"
import { ItemCard } from "@/components/item-card"
import { MobileHeader } from "@/components/mobile-header"

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
      <MobileHeader title="Pesquisa" backHref="/" />
      <div className="space-y-5 px-5 pb-6 pt-5">
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            ["", "Todos"],
            ["service", "Servicos"],
            ["tool", "Ferramentas"],
          ].map(([value, label]) => {
            const active = (type ?? "") === value
            const params = new URLSearchParams()
            if (q) {
              params.set("q", q)
            }
            if (value) {
              params.set("type", value)
            }

            return (
              <Link
                key={label}
                href={`/search?${params.toString()}`}
                className={`rounded-[24px] border px-3 py-3 text-sm ${active ? "border-[#10182c] bg-[#10182c] text-white" : "border-black/8 bg-white text-[#182034]"}`}
              >
                {label}
              </Link>
            )
          })}
        </div>

        <form className="space-y-4">
          <input
            name="q"
            defaultValue={q}
            placeholder="Martelo"
            className="h-12 w-full rounded-2xl border border-black/10 px-4 text-base outline-none"
          />
          <button type="submit" hidden />
        </form>

        <div className="space-y-4">
          {items.length > 0 ? (
            items.map((item) => (
              <ItemCard key={item.id} item={item} href={`/items/${item.id}`} />
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-black/10 bg-[#f7f9fc] p-8 text-center text-[#5d6678]">
              Nenhum resultado encontrado para sua busca.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
