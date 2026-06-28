"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Loader2,
  MapPin,
  Minus,
  Pencil,
  Plus,
  Ruler,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"

import { updateProfileAction } from "@/lib/app-actions"
import type { AppUser } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const MIN_RADIUS = 1
const MAX_RADIUS = 30

function maskCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

function DialogField({
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  placeholder,
  maxLength,
  suffix,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  type?: string
  placeholder?: string
  maxLength?: number
  suffix?: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8a92a3]">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          className="h-11 w-full rounded-xl border border-black/10 bg-white px-3.5 text-sm text-[#182034] outline-none transition focus:border-[#2fb1c2] focus:ring-2 focus:ring-[#2fb1c2]/10"
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function DialogActions({
  onCancel,
  onSave,
  isPending,
}: {
  onCancel: () => void
  onSave: () => void
  isPending: boolean
}) {
  return (
    <DialogFooter className="gap-2 sm:gap-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={isPending}
        className="h-11 rounded-xl border border-black/10 px-5 text-sm font-medium text-[#5d6678] transition hover:bg-[#f6f7f9] disabled:opacity-50"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={isPending}
        className="h-11 rounded-xl bg-[#2fb1c2] px-5 text-sm font-semibold text-white transition hover:bg-[#26a0b0] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Salvando..." : "Salvar"}
      </button>
    </DialogFooter>
  )
}

function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
      {message}
    </p>
  )
}

function useSaveProfile(onDone: () => void) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function save(payload: Partial<AppUser>) {
    setError(null)
    startTransition(async () => {
      const result = await updateProfileAction(payload)
      if (!result.ok) {
        const message = result.error ?? "Não foi possível salvar."
        setError(message)
        toast.error(message)
        return
      }
      toast.success("Dados atualizados.")
      onDone()
      router.refresh()
    })
  }

  return { save, isPending, error, setError }
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  return {
    first_name: parts[0] ?? "Usuário",
    last_name: parts.slice(1).join(" ") || "Trocai",
  }
}

function PersonalDataDialog({
  user,
  open,
  onOpenChange,
}: {
  user: AppUser
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [fullName, setFullName] = useState(
    [user.first_name, user.last_name].filter(Boolean).join(" ")
  )
  const [username, setUsername] = useState(user.username)
  const [email, setEmail] = useState(user.email)
  const [phone, setPhone] = useState(user.phone ?? "")
  const { save, isPending, error, setError } = useSaveProfile(() =>
    onOpenChange(false)
  )

  function handleOpenChange(next: boolean) {
    if (!next) setError(null)
    onOpenChange(next)
  }

  function handleSave() {
    const { first_name, last_name } = splitName(fullName)
    save({ first_name, last_name, username, email, phone })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dados pessoais</DialogTitle>
          <DialogDescription>
            Como você aparece para a comunidade.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <DialogField label="Nome completo" value={fullName} onChange={setFullName} />
          <DialogField
            label="Usuário"
            value={username}
            onChange={setUsername}
            placeholder="seu_usuario"
          />
          <DialogField label="E-mail" type="email" value={email} onChange={setEmail} />
          <DialogField
            label="Telefone"
            type="tel"
            value={phone}
            onChange={setPhone}
            placeholder="(11) 99999-9999"
          />
          <ErrorNote message={error} />
        </div>
        <DialogActions
          onCancel={() => handleOpenChange(false)}
          onSave={handleSave}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

function AddressDialog({
  user,
  open,
  onOpenChange,
}: {
  user: AppUser
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [zip, setZip] = useState(user.zip_code ?? "")
  const [street, setStreet] = useState(user.street ?? "")
  const [neighborhood, setNeighborhood] = useState(user.neighborhood ?? "")
  const [city, setCity] = useState(user.city ?? "")
  const [state, setState] = useState(user.state ?? "")
  const [isLookingUpCep, setIsLookingUpCep] = useState(false)
  const { save, isPending, error, setError } = useSaveProfile(() =>
    onOpenChange(false)
  )

  function handleOpenChange(next: boolean) {
    if (!next) setError(null)
    onOpenChange(next)
  }

  async function lookupCep() {
    const digits = zip.replace(/\D/g, "")
    if (digits.length !== 8) return

    setIsLookingUpCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (!data?.erro) {
        if (data.logradouro) setStreet(data.logradouro)
        if (data.bairro) setNeighborhood(data.bairro)
        if (data.localidade) setCity(data.localidade)
        if (data.uf) setState(data.uf)
      }
    } catch {
      // conveniência: falha silenciosa, usuário preenche à mão
    } finally {
      setIsLookingUpCep(false)
    }
  }

  function handleSave() {
    save({
      zip_code: zip,
      street,
      neighborhood,
      city,
      state,
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Endereço</DialogTitle>
          <DialogDescription>
            Define o centro do seu raio de busca.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <DialogField
            label="CEP"
            value={zip}
            onChange={(v) => setZip(maskCep(v))}
            onBlur={lookupCep}
            placeholder="00000-000"
            suffix={
              isLookingUpCep ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#2fb1c2]" />
              ) : null
            }
          />
          <DialogField label="Rua" value={street} onChange={setStreet} />
          <DialogField
            label="Bairro"
            value={neighborhood}
            onChange={setNeighborhood}
          />
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <DialogField label="Cidade" value={city} onChange={setCity} />
            <div className="w-20">
              <DialogField
                label="UF"
                value={state}
                onChange={setState}
                placeholder="SP"
                maxLength={2}
              />
            </div>
          </div>
          <ErrorNote message={error} />
        </div>
        <DialogActions
          onCancel={() => handleOpenChange(false)}
          onSave={handleSave}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

function RadiusDialog({
  current,
  open,
  onOpenChange,
}: {
  current: number
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [radius, setRadius] = useState(current)
  const { save, isPending, error, setError } = useSaveProfile(() =>
    onOpenChange(false)
  )

  function handleOpenChange(next: boolean) {
    if (next) setRadius(current)
    else setError(null)
    onOpenChange(next)
  }

  function step(delta: number) {
    setRadius((value) => Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, value + delta)))
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Raio de busca</DialogTitle>
          <DialogDescription>
            O alcance dos itens que aparecem para você.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <div className="text-center">
            <span className="text-4xl font-semibold tracking-tight text-[#182034] tabular-nums">
              {radius}
              <span className="ml-1 text-lg font-medium text-[#8a92a3]">km</span>
            </span>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={radius <= MIN_RADIUS}
              aria-label="Diminuir raio"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 text-[#5d6678] transition hover:border-[#2fb1c2] hover:text-[#2fb1c2] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="range"
              min={MIN_RADIUS}
              max={MAX_RADIUS}
              value={radius}
              onChange={(event) => setRadius(Number(event.target.value))}
              className="h-1.5 flex-1 cursor-pointer accent-[#2fb1c2]"
            />
            <button
              type="button"
              onClick={() => step(1)}
              disabled={radius >= MAX_RADIUS}
              aria-label="Aumentar raio"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 text-[#5d6678] transition hover:border-[#2fb1c2] hover:text-[#2fb1c2] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-4 text-center text-xs text-[#8a92a3]">
            Mostramos itens em até {radius} km do seu endereço. O padrão é 5 km.
          </p>
          {error ? (
            <div className="mt-3">
              <ErrorNote message={error} />
            </div>
          ) : null}
        </div>
        <DialogActions
          onCancel={() => handleOpenChange(false)}
          onSave={() => save({ search_radius_km: radius })}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

function RailButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[#f6f7f9]"
    >
      <Icon className="h-4 w-4 shrink-0 text-[#8a92a3]" />
      <span className="flex-1 text-sm font-medium text-[#182034]">{label}</span>
      <Pencil className="h-3.5 w-3.5 shrink-0 text-[#c8ccd4] transition-colors group-hover:text-[#8a92a3]" />
    </button>
  )
}

export function AccountEditRail({ user }: { user: AppUser }) {
  const [personalOpen, setPersonalOpen] = useState(false)
  const [addressOpen, setAddressOpen] = useState(false)

  return (
    <>
      <nav className="flex flex-col gap-0.5">
        <RailButton
          icon={UserRound}
          label="Dados pessoais"
          onClick={() => setPersonalOpen(true)}
        />
        <RailButton
          icon={MapPin}
          label="Endereço"
          onClick={() => setAddressOpen(true)}
        />
      </nav>
      <PersonalDataDialog
        user={user}
        open={personalOpen}
        onOpenChange={setPersonalOpen}
      />
      <AddressDialog user={user} open={addressOpen} onOpenChange={setAddressOpen} />
    </>
  )
}

export function AccountRadiusCard({ radius }: { radius: number }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex items-center justify-between rounded-xl border border-black/6 bg-white px-4 py-3.5 text-left transition hover:border-[#2fb1c2]/40 hover:bg-[#f9fdfd]"
      >
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Ruler className="h-3.5 w-3.5 shrink-0 text-[#c8ccd4]" />
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#b0b8c5]">
              Raio de busca
            </p>
          </div>
          <p className="text-sm font-medium leading-snug text-[#182034]">
            {radius} km
          </p>
        </div>
        <Pencil className="h-3.5 w-3.5 shrink-0 text-[#c8ccd4] transition-colors group-hover:text-[#2fb1c2]" />
      </button>
      <RadiusDialog current={radius} open={open} onOpenChange={setOpen} />
    </>
  )
}
