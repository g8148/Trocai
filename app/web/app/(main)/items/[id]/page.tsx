import Link from "next/link"
import { Star } from "lucide-react"
import { notFound } from "next/navigation"

import { getItem } from "@/lib/api"
import { MobileHeader } from "@/components/mobile-header"
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
      <MobileHeader title="Detalhes" backHref="/" />
      <div className="space-y-4 px-5 pb-8 pt-6">
        {item.cover_image ? (
          <img
            src={item.cover_image}
            alt={item.name}
            className="h-[230px] w-full rounded-[30px] object-cover"
          />
        ) : (
          <div className="h-[230px] rounded-[30px] bg-[linear-gradient(145deg,#f4f5f7_0%,#eceeef_38%,#ffffff_100%)]" />
        )}

        <div className="space-y-3 rounded-[28px] bg-[#f7f9fc] p-5">
          <div>
            <p className="text-sm text-[#5d6678]">Avaliacoes</p>
            <div className="mt-2 flex gap-4 text-[#ff8b2c]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className="h-6 w-6"
                  fill={index < 4 ? "currentColor" : "none"}
                />
              ))}
            </div>
          </div>
          {[
            ["Distancia", "Ate 5 KM"],
            ["Tipo de Ferramenta", item.name],
            ["Categoria", item.category_name ?? "Ferramentas"],
            ["SubCategoria", item.subcategory_name ?? "Categoria principal"],
            ["Segregacao", item.segregation],
            ["Disponivel para Reservas?", item.allow_reservation ? "Sim" : "Nao"],
          ].map(([label, value]) => (
            <div key={label} className="space-y-2">
              <p className="text-sm text-[#5d6678]">{label}</p>
              <div className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-[#182034] shadow-[0_10px_24px_rgba(24,32,52,0.05)]">
                {value}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <StartChatButton itemId={item.id} targetUserId={item.owner.id} />
          <Link
            href={`/items/${item.id}/reserve`}
            className="flex h-14 flex-1 items-center justify-center rounded-2xl bg-[#10182c] text-base font-semibold text-white"
          >
            Reservar
          </Link>
        </div>
      </div>
    </div>
  )
}
