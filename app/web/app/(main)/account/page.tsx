import Link from "next/link"
import { UserRound, Mail, Phone, MapPin, FileText } from "lucide-react"

import { getMe } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  available: { label: "Disponível", className: "bg-green-100 text-green-700" },
  away: { label: "Ausente", className: "bg-yellow-100 text-yellow-700" },
  blocked: { label: "Bloqueado", className: "bg-red-100 text-red-700" },
}

function ProfileField({ icon: Icon, label, value }: {
  icon: React.ElementType
  label: string
  value: string | null | undefined
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#5d6678]" />
      <div>
        <p className="text-xs text-[#5d6678]">{label}</p>
        <p className="text-sm font-medium text-[#182034]">{value}</p>
      </div>
    </div>
  )
}

export default async function AccountPage() {
  const user = await getMe()

  if (!user) return null

  const statusInfo = STATUS_LABELS[user.status] ?? STATUS_LABELS.available
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username
  const location = [user.city, user.state].filter(Boolean).join(", ")
  const maskedCpf = user.cpf
    ? user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    : null

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {/* Avatar + nome */}
      <div className="flex flex-col items-center gap-3 pb-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e8f7f9]">
          <UserRound className="h-11 w-11 text-[#2fb1c2]" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#182034]">{fullName}</h1>
          <p className="text-sm text-[#5d6678]">@{user.username}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
      </div>

      <Separator />

      {/* Dados do perfil */}
      <div className="space-y-4 py-6">
        <ProfileField icon={Mail} label="Email" value={user.email} />
        <ProfileField icon={Phone} label="Telefone" value={user.phone} />
        <ProfileField icon={FileText} label="CPF" value={maskedCpf} />
        <ProfileField icon={MapPin} label="Localização" value={location || user.street} />
      </div>

      <Separator />

      {/* Ações */}
      <div className="flex flex-col gap-3 pt-6">
        <Button asChild className="h-11 rounded-2xl bg-[#10182c] text-base font-semibold">
          <Link href="/account/profile">Editar perfil</Link>
        </Button>
        <Button asChild variant="outline" className="h-11 rounded-2xl border-black/10 text-base">
          <Link href="/account/distance">Configurar distância</Link>
        </Button>
      </div>
    </div>
  )
}
