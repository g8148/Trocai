import Link from "next/link"
import { Star } from "lucide-react"
import { notFound } from "next/navigation"

import { getItem, getMe } from "@/lib/api"
import { getItemGalleryImages } from "@/lib/item-visuals"
import { ItemGallery } from "@/components/item-gallery"
import { StartChatButton } from "@/components/start-chat-button"
import { ItemOwnerActions } from "@/components/item-owner-actions"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const CONDITION_LABEL: Record<string, string> = {
  new: "Novo",
  good: "Bom estado",
  used: "Usado",
  worn: "Desgastado",
}

const SEGREGATION_LABEL: Record<string, string> = {
  hobby: "Hobby",
  semi_professional: "Semi profissional",
  professional: "Profissional",
}

const AVAILABILITY: Record<string, { label: string; className: string }> = {
  available: { label: "Disponível", className: "bg-emerald-50 text-emerald-700" },
  borrowed: { label: "Emprestado", className: "bg-amber-50 text-amber-700" },
  reserved: { label: "Reservado", className: "bg-blue-50 text-blue-700" },
  unavailable: { label: "Indisponível", className: "bg-red-50 text-red-700" },
}

function formatCurrency(value: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value))
}

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const item = await getItem(id)
  const user = await getMe()

  if (!item) notFound()

  const isOwner = user?.id === item.owner.id

  const avail = AVAILABILITY[item.availability] ?? {
    label: item.availability,
    className: "bg-gray-50 text-gray-600",
  }
  const ownerInitial = (
    item.owner.first_name?.[0] ?? item.owner.username[0]
  ).toUpperCase()

  const images = getItemGalleryImages(item)

  return (
    <div className="pb-28 lg:pb-10">
      {/* Breadcrumbs */}
      <div className="px-4 pt-4 pb-4 lg:px-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Início</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {item.category_name && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/search">{item.category_name}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[200px] truncate">
                {item.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Conteúdo principal */}
      <div className="lg:grid lg:grid-cols-[1fr_420px] lg:gap-10">
        {/* Galeria */}
        <div className="px-4 lg:px-0">
          <ItemGallery images={images} name={item.name} />
        </div>

        {/* Detalhes */}
        <div className="px-4 pt-5 lg:px-0 lg:pt-0">
          {/* Categoria + título */}
          {item.category_name && (
            <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.16em] text-[#2fb1c2]">
              {item.category_name}
              {item.subcategory_name ? ` · ${item.subcategory_name}` : ""}
            </p>
          )}
          <h1 className="text-2xl font-semibold leading-tight tracking-[-0.03em] text-[#182034] lg:text-3xl">
            {item.name}
          </h1>

          {/* Rating */}
          <div className="mt-2 mb-4 flex items-center gap-2">
            <div className="flex gap-0.5 text-[#ff8b2c]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5" fill={i < 4 ? "currentColor" : "none"} />
              ))}
            </div>
            <span className="text-xs text-[#8a92a3]">4.0</span>
            <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium ${avail.className}`}>
              {avail.label}
            </span>
          </div>

          {/* Proprietário — linha compacta */}
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#10182c] text-[11px] font-semibold text-white">
              {ownerInitial}
            </div>
            <span className="text-sm text-[#5d6678]">
              <span className="font-medium text-[#182034]">
                {item.owner.first_name || item.owner.username}
              </span>
              {" · Proprietário"}
            </span>
          </div>

          {/* Badges */}
          <div className="mb-5 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-[#f4f5f7] px-2.5 py-1 text-xs font-medium text-[#5d6678]">
              {CONDITION_LABEL[item.condition] ?? item.condition}
            </span>
            <span className="rounded-md bg-[#f4f5f7] px-2.5 py-1 text-xs font-medium text-[#5d6678]">
              {SEGREGATION_LABEL[item.segregation] ?? item.segregation}
            </span>
            {item.allow_reservation && (
              <span className="rounded-md bg-[#edfafe] px-2.5 py-1 text-xs font-medium text-[#2fb1c2]">
                Aceita reservas
              </span>
            )}
          </div>

          {/* Descrição */}
          {item.description && (
            <div className="mb-5">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#b0b8c5]">
                Descrição
              </p>
              <p className="text-sm leading-relaxed text-[#5d6678]">
                {item.description}
              </p>
            </div>
          )}

          {/* Valor */}
          {item.estimated_value && (
            <div className="mb-6">
              <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#b0b8c5]">
                Valor estimado
              </p>
              <p className="text-2xl font-semibold tracking-[-0.04em] text-[#ff8b2c]">
                {formatCurrency(item.estimated_value)}
              </p>
            </div>
          )}

          {/* Ações — desktop */}
          <div className="hidden flex-col gap-2.5 lg:flex">
            {isOwner ? (
              <ItemOwnerActions itemId={item.id} isOwner={isOwner} />
            ) : (
              <>
                <StartChatButton itemId={item.id} targetUserId={item.owner.id} />
                <Link
                  href={`/items/${item.id}/reserve`}
                  className="flex h-14 w-full items-center justify-center rounded-2xl border border-black/10 text-sm font-semibold text-[#182034] transition hover:bg-black/5"
                >
                  Solicitar empréstimo
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Ações — mobile fixo na base */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-black/5 bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex gap-2.5">
          {isOwner ? (
            <ItemOwnerActions itemId={item.id} isOwner={isOwner} />
          ) : (
            <>
              <StartChatButton itemId={item.id} targetUserId={item.owner.id} />
              <Link
                href={`/items/${item.id}/reserve`}
                className="flex h-14 flex-1 items-center justify-center rounded-2xl border border-black/10 text-sm font-semibold text-[#182034] transition hover:bg-black/5"
              >
                Reservar
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
