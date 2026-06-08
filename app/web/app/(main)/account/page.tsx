import Link from "next/link"
import {
  Mail,
  Phone,
  MapPin,
  FileText,
  ChevronRight,
  LogOut,
  PackagePlus,
  Ruler,
  SquarePen,
} from "lucide-react"

import { getItems, getMe } from "@/lib/api"
import { logoutAction } from "@/lib/auth-actions"
import { ItemCard } from "@/components/item-card"

const STATUS: Record<string, { label: string; className: string }> = {
  available: { label: "Disponível", className: "bg-emerald-50 text-emerald-700" },
  away: { label: "Ausente", className: "bg-amber-50 text-amber-700" },
  blocked: { label: "Bloqueado", className: "bg-red-50 text-red-700" },
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string | null | undefined
}) {
  if (!value) return null
  return (
    <div className="flex items-center gap-3 py-3">
      <Icon className="h-4 w-4 shrink-0 text-[#c8ccd4]" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#b0b8c5]">
          {label}
        </p>
        <p className="truncate text-sm font-medium text-[#182034]">{value}</p>
      </div>
    </div>
  )
}

function ActionLink({
  href,
  icon: Icon,
  label,
  description,
}: {
  href: string
  icon: React.ElementType
  label: string
  description?: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-black/6 bg-white px-4 py-3.5 shadow-[0_2px_8px_rgba(17,24,39,0.04)] transition hover:bg-[#f7f8fb]"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f4f5f7]">
        <Icon className="h-4 w-4 text-[#5d6678]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#182034]">{label}</p>
        {description && <p className="text-xs text-[#8a92a3]">{description}</p>}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-[#c8ccd4]" />
    </Link>
  )
}

export default async function AccountPage() {
  const user = await getMe()
  if (!user) return null
  const ownItems = await getItems(undefined, undefined, "me")

  const statusInfo = STATUS[user.status] ?? STATUS.available
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username
  const location = [user.street, user.neighborhood, user.city, user.state]
    .filter(Boolean)
    .join(", ")
  const maskedCpf = user.cpf
    ? user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    : null
  const initial = (user.first_name?.[0] ?? user.username[0]).toUpperCase()

  return (
    <div className="mx-auto max-w-lg px-4 py-6 pb-12">
      {/* Avatar + identidade */}
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#10182c] text-2xl font-bold text-white">
          {initial}
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#182034]">{fullName}</h1>
          <p className="mt-0.5 text-sm text-[#8a92a3]">@{user.username}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusInfo.className}`}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Info */}
      <div className="mb-6 divide-y divide-black/5 rounded-2xl border border-black/6 bg-white px-4 shadow-[0_2px_8px_rgba(17,24,39,0.04)]">
        <InfoRow icon={Mail} label="Email" value={user.email} />
        <InfoRow icon={Phone} label="Telefone" value={user.phone} />
        {location && <InfoRow icon={MapPin} label="Localização" value={location} />}
        {maskedCpf && <InfoRow icon={FileText} label="CPF" value={maskedCpf} />}
      </div>

      {/* Ações */}
      <div className="mb-8 flex flex-col gap-2.5">
        <ActionLink
          href="/items/new"
          icon={PackagePlus}
          label="Novo item"
          description="Publique uma ferramenta ou servico"
        />
        <ActionLink
          href="/account/profile"
          icon={FileText}
          label="Editar perfil"
          description="Nome, contato e endereço"
        />
        <ActionLink
          href="/account/distance"
          icon={Ruler}
          label="Distância de busca"
          description={user.search_radius_km ? `${user.search_radius_km} km` : undefined}
        />
      </div>

      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#182034]">Meus itens</h2>
          <Link
            href="/items/new"
            className="rounded-full border border-black/8 px-3 py-1.5 text-xs font-medium text-[#182034] transition hover:bg-black/5"
          >
            Novo item
          </Link>
        </div>

        {ownItems.length > 0 ? (
          <div className="space-y-3">
            {ownItems.map((item) => (
              <div key={item.id} className="space-y-2">
                <ItemCard item={item} href={`/items/${item.id}`} />
                <Link
                  href={`/items/${item.id}/edit`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-black/8 px-4 py-2 text-sm font-medium text-[#182034] transition hover:bg-black/5"
                >
                  <SquarePen className="h-4 w-4" />
                  Editar item
                </Link>
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
      </div>

      {/* Sair */}
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Sair da conta
        </button>
      </form>
    </div>
  )
}
