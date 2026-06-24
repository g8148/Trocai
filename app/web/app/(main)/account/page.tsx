import { FileText, LogOut, Mail, MapPin, Phone, Star } from "lucide-react"

import { getCategories, getItems, getMe, getReviews } from "@/lib/api"
import { logoutAction } from "@/lib/auth-actions"
import { AccountAvatar } from "@/components/account-avatar"
import { AccountEditRail, AccountRadiusCard } from "@/components/account-edit"
import { AccountItemsSection } from "@/components/account-items-section"

const STATUS: Record<string, { label: string; className: string }> = {
  available: { label: "Disponível", className: "bg-emerald-50 text-emerald-700" },
  away: { label: "Ausente", className: "bg-amber-50 text-amber-700" },
  blocked: { label: "Bloqueado", className: "bg-red-50 text-red-700" },
}

function DetailCard({
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
    <div className="rounded-xl border border-black/6 bg-white px-4 py-3.5">
      <div className="mb-1 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 shrink-0 text-[#c8ccd4]" />
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#b0b8c5]">
          {label}
        </p>
      </div>
      <p className="text-sm font-medium leading-snug text-[#182034]">{value}</p>
    </div>
  )
}

export default async function AccountPage() {
  const user = await getMe()
  if (!user) return null

  const [ownItems, categories, receivedReviews] = await Promise.all([
    getItems(undefined, undefined, "me"),
    getCategories(),
    getReviews({ reviewed_user: user.id }),
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
  const itemCount = ownItems.length

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 pb-12 lg:py-8">
      <div className="lg:grid lg:grid-cols-[320px_1fr] lg:items-start lg:gap-8">
        {/* Rail de identidade */}
        <aside className="lg:sticky lg:top-8">
          <div className="rounded-2xl border border-black/6 bg-white p-6 shadow-[0_2px_8px_rgba(17,24,39,0.04)]">
            <div className="flex flex-col items-center text-center">
              <AccountAvatar
                avatarUrl={user.avatar}
                initial={initial}
                name={fullName}
              />
              <h1 className="mt-4 text-lg font-semibold tracking-tight text-[#182034]">
                {fullName}
              </h1>
              <p className="mt-0.5 text-sm text-[#8a92a3]">@{user.username}</p>
              <span
                className={`mt-3 rounded-full px-3 py-1 text-xs font-medium ${statusInfo.className}`}
              >
                {statusInfo.label}
              </span>
              <p className="mt-3 text-xs text-[#8a92a3]">
                {itemCount} {itemCount === 1 ? "anúncio" : "anúncios"}
              </p>
              {user.average_rating !== null ? (
                <p className="mt-1 flex items-center justify-center gap-1 text-xs text-[#8a92a3]">
                  <Star className="h-3.5 w-3.5 text-[#ff8b2c]" fill="currentColor" />
                  {user.average_rating} como fornecedor
                </p>
              ) : null}
            </div>

            <div className="my-5 h-px bg-black/5" />

            <AccountEditRail user={user} />

            <div className="my-5 h-px bg-black/5" />

            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-[#8a92a3] transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Sair da conta
              </button>
            </form>
          </div>
        </aside>

        {/* Coluna principal */}
        <div className="mt-6 space-y-8 lg:mt-0">
          <section className="space-y-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#b0b8c5]">
              Detalhes
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailCard icon={Mail} label="E-mail" value={user.email} />
              <DetailCard icon={Phone} label="Telefone" value={user.phone} />
              <DetailCard icon={MapPin} label="Localização" value={location} />
              <DetailCard icon={FileText} label="CPF" value={maskedCpf} />
              <AccountRadiusCard radius={user.search_radius_km ?? 5} />
            </div>
          </section>

          <AccountItemsSection
            items={ownItems}
            categories={categories}
            description="Acompanhe, edite e publique os seus anúncios."
          />

          {receivedReviews.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#b0b8c5]">
                Avaliações recebidas
              </h2>
              <div className="space-y-3">
                {receivedReviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-black/6 bg-white p-4"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm font-medium text-[#182034]">
                        {review.reviewer.first_name || review.reviewer.username}
                      </span>
                      <span className="flex gap-0.5 text-[#ff8b2c]">
                        {Array.from({ length: review.user_rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3" fill="currentColor" />
                        ))}
                      </span>
                    </div>
                    {review.description ? (
                      <p className="text-sm text-[#5d6678]">{review.description}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  )
}
