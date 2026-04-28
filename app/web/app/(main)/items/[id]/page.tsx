import Link from "next/link"
import { Star, ChevronLeft } from "lucide-react"
import { notFound } from "next/navigation"

import { getItem } from "@/lib/api"
import { StartChatButton } from "@/components/start-chat-button"

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const item = await getItem(id)

  if (!item) {
    notFound()
  }

  return (
    <div className="pb-8">
      <div className="flex items-center gap-2 px-4 pb-2 pt-4">
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#5d6678] transition hover:bg-black/5"
        >
          <ChevronLeft size={18} />
          <span className="sr-only">Voltar</span>
        </Link>
        <p className="text-base font-semibold text-[#182034]">{item.name}</p>
      </div>

      <div className="space-y-4 px-4 pb-8 pt-2">
        {item.cover_image ? (
          <img
            src={item.cover_image}
            alt={item.name}
            className="h-56 w-full rounded-2xl object-cover"
          />
        ) : (
          <div className="h-56 rounded-2xl bg-[linear-gradient(145deg,#f4f5f7_0%,#eceeef_38%,#ffffff_100%)]" />
        )}

        <div className="space-y-3 rounded-2xl bg-[#efeeec] p-4">
          <div>
            <p className="mb-1.5 text-xs text-[#5d6678]">Avaliações</p>
            <div className="flex gap-1 text-[#ff8b2c]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5" fill={i < 4 ? "currentColor" : "none"} />
              ))}
            </div>
          </div>

          {[
            ["Categoria", item.category_name ?? "Ferramentas"],
            ["Subcategoria", item.subcategory_name ?? "—"],
            ["Segregação", item.segregation ?? "—"],
            ["Aceita reservas", item.allow_reservation ? "Sim" : "Não"],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="mb-1 text-xs text-[#5d6678]">{label}</p>
              <div className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-[#182034] shadow-sm">
                {value}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <StartChatButton itemId={item.id} targetUserId={item.owner.id} />
          <Link
            href={`/items/${item.id}/reserve`}
            className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-[#0d1424] text-sm font-semibold text-white transition hover:bg-[#1a2640]"
          >
            Reservar
          </Link>
        </div>
      </div>
    </div>
  )
}
