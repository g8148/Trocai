import Link from "next/link"
import { Bell, Menu, Search } from "lucide-react"

import { getItems } from "@/lib/api"
import { ItemCard } from "@/components/item-card"

export default async function HomePage() {
  const items = await getItems()
  const [featured, ...catalog] = items

  return (
    <div className="pb-6">
      <header className="flex items-center gap-3 px-4 pb-5 pt-6">
        <Link href="/account" className="rounded-2xl p-2 text-[#182034] transition hover:bg-black/5">
          <Menu className="h-6 w-6" />
        </Link>
        <span className="text-[1.4rem] font-medium tracking-[-0.04em] text-[#182034]">
          Inicio
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/search" className="rounded-2xl p-2 text-[#182034] transition hover:bg-black/5">
            <Search className="h-5 w-5" />
          </Link>
          <Link href="/notifications" className="rounded-2xl p-2 text-[#182034] transition hover:bg-black/5">
            <Bell className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <section className="space-y-6 px-4">
        {featured ? (
          <ItemCard item={featured} href={`/items/${featured.id}`} featured />
        ) : (
          <div className="rounded-[30px] border border-dashed border-black/10 bg-[#f7f9fc] p-8 text-center text-[#5d6678]">
            Ainda nao existem itens cadastrados para exibir aqui.
          </div>
        )}

        <div className="space-y-4">
          {catalog.length > 0 ? (
            catalog.map((item) => (
              <ItemCard key={item.id} item={item} href={`/items/${item.id}`} />
            ))
          ) : featured ? (
            <div className="rounded-[26px] border border-dashed border-black/10 bg-[#f7f9fc] p-6 text-center text-[#5d6678]">
              Adicione mais itens no catalogo para enriquecer a busca.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
