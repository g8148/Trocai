import Link from "next/link"
import { PackagePlus, SquarePen } from "lucide-react"

import type { ItemSummary } from "@/lib/api"
import { ItemCard } from "@/components/item-card"

export function AccountItemsSection({
  items,
  title = "Meus itens",
  description,
}: {
  items: ItemSummary[]
  title?: string
  description?: string
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-[#182034]">{title}</h2>
          {description ? (
            <p className="text-sm text-[#8a92a3]">{description}</p>
          ) : null}
        </div>
        <Link
          href="/items/new"
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-black/8 px-3 py-1.5 text-xs font-medium text-[#182034] transition hover:bg-black/5"
        >
          <PackagePlus className="h-3.5 w-3.5" />
          Novo item
        </Link>
      </div>

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="space-y-2">
              <ItemCard item={item} href={`/items/${item.id}`} />
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/items/${item.id}/edit`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-black/8 px-4 py-2 text-sm font-medium text-[#182034] transition hover:bg-black/5"
                >
                  <SquarePen className="h-4 w-4" />
                  Editar item
                </Link>
                <Link
                  href={`/items/${item.id}`}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#182034] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#243149]"
                >
                  Ver item
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-black/10 bg-[#f7f8fb] px-5 py-8 text-center">
          <p className="text-base font-medium text-[#182034]">
            Voce ainda nao publicou nenhum item.
          </p>
          <p className="mt-1 text-sm text-[#8a92a3]">
            Crie seu primeiro anuncio para aparecer no catalogo.
          </p>
        </div>
      )}
    </section>
  )
}
