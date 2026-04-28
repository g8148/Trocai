import Link from "next/link"
import { ArrowRight, MapPin, Star } from "lucide-react"

import type { ItemSummary } from "@/lib/api"
import { cn } from "@/lib/utils"

function formatCurrency(value: string | null) {
  if (!value) {
    return null
  }

  const numeric = Number(value)
  if (Number.isNaN(numeric)) {
    return value
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numeric)
}

function ItemThumb({ src, alt, compact = false }: { src: string | null; alt: string; compact?: boolean }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(
          "h-full w-full rounded-[22px] object-cover",
          compact ? "min-h-[118px]" : "min-h-[212px]"
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        "h-full w-full rounded-[22px] bg-[linear-gradient(145deg,#f4f5f7_0%,#eceeef_38%,#ffffff_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]",
        compact ? "min-h-[118px]" : "min-h-[212px]"
      )}
    />
  )
}

export function ItemCard({
  item,
  href,
  featured = false,
}: {
  item: ItemSummary
  href: string
  featured?: boolean
}) {
  const price = formatCurrency(item.estimated_value)

  if (featured) {
    return (
      <Link
        href={href}
        className="group block overflow-hidden rounded-[30px] border border-black/5 bg-white p-3 shadow-[0_18px_50px_rgba(17,24,39,0.08)]"
      >
        <div className="relative overflow-hidden rounded-[24px]">
          <ItemThumb src={item.cover_image} alt={item.name} />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#10182c]/80 via-[#10182c]/25 to-transparent px-5 py-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/75">
                  {item.category_name ?? "Ferramenta"}
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                  {item.name}
                </h2>
              </div>
              <span className="rounded-full bg-white/15 p-2 backdrop-blur">
                <ArrowRight className="h-5 w-5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className="flex gap-3 rounded-[24px] border border-black/7 bg-white p-3 shadow-[0_14px_32px_rgba(17,24,39,0.06)] transition hover:-translate-y-0.5"
    >
      <div className="h-[122px] w-[122px] shrink-0">
        <ItemThumb src={item.cover_image} alt={item.name} compact />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
        <div className="space-y-1">
          <h3 className="line-clamp-1 text-[1.35rem] font-semibold tracking-[-0.04em] text-[#182034]">
            {item.name}
          </h3>
          <p className="line-clamp-2 text-sm leading-5 text-[#5d6678]">
            {item.description}
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-[#5d6678]">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {item.category_name ?? "Perto de voce"}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[#ff8b2c]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={`${item.id}-${index}`}
                  className="h-3.5 w-3.5"
                  fill={index < 4 ? "currentColor" : "none"}
                />
              ))}
            </span>
          </div>
          {price ? (
            <p className="text-[1.8rem] font-semibold tracking-[-0.05em] text-[#ff8b2c]">
              {price}
            </p>
          ) : (
            <p className="text-sm font-medium text-[#2fb1c2]">
              Disponivel para emprestimo
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
