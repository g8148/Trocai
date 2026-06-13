import Link from "next/link"
import {
  ChevronRight,
  FileText,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Ruler,
} from "lucide-react"

import { getCategories, getItems, getMe } from "@/lib/api"
import { logoutAction } from "@/lib/auth-actions"
import { AccountItemsSection } from "@/components/account-items-section"
import { ItemDialogButton } from "@/components/item-dialog-button"

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
      className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5 transition-colors hover:bg-muted/50"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-[#c8ccd4]" />
    </Link>
  )
}

export default async function AccountPage() {
  const user = await getMe()
  if (!user) return null

  const [ownItems, categories] = await Promise.all([
    getItems(undefined, undefined, "me"),
    getCategories(),
  ])

  const statusInfo = STATUS[user.status] ?? STATUS.available
  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username
  const location = [user.street, user.neighborhood, user.city, user.state]
    .filter(Boolean)
    .join(", ")
  const maskedCpf = user.cpf
    ? user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    : null
  const initial = (user.first_name?.[0] ?? user.username[0]).toUpperCase()

  return (
    <div className="mx-auto max-w-lg px-4 py-6 pb-12">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#10182c] text-2xl font-bold text-white">
          {initial}
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#182034]">
            {fullName}
          </h1>
          <p className="mt-0.5 text-sm text-[#8a92a3]">@{user.username}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusInfo.className}`}
        >
          {statusInfo.label}
        </span>
      </div>

      <div className="mb-6 divide-y divide-black/5 rounded-2xl border border-black/6 bg-white px-4 shadow-[0_2px_8px_rgba(17,24,39,0.04)]">
        <InfoRow icon={Mail} label="E-mail" value={user.email} />
        <InfoRow icon={Phone} label="Telefone" value={user.phone} />
        {location ? <InfoRow icon={MapPin} label="Localização" value={location} /> : null}
        {maskedCpf ? <InfoRow icon={FileText} label="CPF" value={maskedCpf} /> : null}
      </div>

      <div className="mb-8 flex flex-col gap-2.5">
        <ItemDialogButton
          categories={categories}
          label="Adicionar item"
          description="Publique uma ferramenta ou serviço"
          icon="package-plus"
          appearance="action-card"
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

      <div className="mb-8">
        <AccountItemsSection
          items={ownItems}
          categories={categories}
          description="Acompanhe, edite e publique os seus anúncios."
        />
      </div>

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
