import Link from "next/link"
import { Search } from "lucide-react"

import { getItems } from "@/lib/api"
import { ItemCard } from "@/components/item-card"

export default async function HomePage() {
  const items = await getItems()
  const [featured, ...catalog] = items

  return (
    <div className="pb-6 pt-4">
      {/* Barra de busca — leva para /search */}
      <div className="px-4 pb-5">
        <Link href="/search">
          <div className="flex items-center gap-3 rounded-2xl bg-[#ebebea] px-4 py-3 text-[#8a92a3]">
            <Search className="h-4 w-4 shrink-0" />
            <span className="text-sm">Buscar itens próximos...</span>
          </div>
        </Link>
      </div>

      <section className="space-y-6 px-4">
        {featured ? (
          <ItemCard item={featured} href={`/items/${featured.id}`} featured />
        ) : (
          <div className="rounded-[30px] border border-dashed border-black/10 bg-[#efeeec] p-8 text-center text-[#5d6678]">
            Ainda não existem itens cadastrados para exibir aqui.
          </div>
        )}

        <div className="space-y-4">
          {catalog.length > 0 ? (
            catalog.map((item) => (
              <ItemCard key={item.id} item={item} href={`/items/${item.id}`} />
            ))
          ) : featured ? (
            <div className="rounded-[26px] border border-dashed border-black/10 bg-[#efeeec] p-6 text-center text-[#5d6678]">
              Adicione mais itens no catálogo para enriquecer a busca.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
