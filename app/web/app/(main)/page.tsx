import Link from "next/link"

import { getItems } from "@/lib/api"
import { ItemCard } from "@/components/item-card"

export default async function HomePage() {
  const items = await getItems()
  const [featured, ...catalog] = items

  return (
    <div className="pb-8 pt-4 lg:pt-8">
      <section className="space-y-6 px-4 lg:space-y-8 lg:px-0">
        {/* Featured */}
        {featured ? (
          <ItemCard item={featured} href={`/items/${featured.id}`} featured />
        ) : (
          <div className="rounded-[30px] border border-dashed border-black/10 bg-[#efeeec] p-8 text-center text-[#5d6678]">
            Ainda não existem itens cadastrados para exibir aqui.
          </div>
        )}

        {/* Catálogo — lista no mobile, grid 3 colunas no desktop */}
        {catalog.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.map((item) => (
              <ItemCard key={item.id} item={item} href={`/items/${item.id}`} />
            ))}
          </div>
        ) : featured ? (
          <div className="rounded-[26px] border border-dashed border-black/10 bg-[#efeeec] p-6 text-center text-[#5d6678]">
            Adicione mais itens no catálogo para enriquecer a busca.
          </div>
        ) : null}
      </section>
    </div>
  )
}
