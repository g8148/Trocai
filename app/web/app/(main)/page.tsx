import Link from "next/link"

import { getItems } from "@/lib/api"
import { FeaturedItemsCarousel } from "@/components/featured-items-carousel"
import { ItemCard } from "@/components/item-card"

export default async function HomePage() {
  const items = await getItems(undefined, undefined, undefined, undefined, undefined, undefined, true)
  const catalog = items

  return (
    <div className="pb-8 pt-4 lg:pt-8">
      <section className="space-y-6 px-4 lg:space-y-8 lg:px-0">
        <FeaturedItemsCarousel items={items} />

        <div className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#2fb1c2]">
                Descobertas
              </p>
              <h2 className="mt-1 text-[1.6rem] font-semibold tracking-[-0.05em] text-[#182034]">
                Produtos para você explorar
              </h2>
            </div>
            <Link
              href="/search"
              className="rounded-full border border-black/8 px-4 py-2 text-sm font-medium text-[#182034] transition hover:bg-black/5"
            >
              Ver tudo
            </Link>
          </div>

          {catalog.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {catalog.map((item) => (
                <ItemCard key={item.id} item={item} href={`/items/${item.id}`} />
              ))}
            </div>
          ) : items.length > 0 ? (
            <div className="rounded-[26px] border border-dashed border-black/10 bg-[#efeeec] p-6 text-center text-[#5d6678]">
              Adicione mais itens no catálogo para enriquecer a busca.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
