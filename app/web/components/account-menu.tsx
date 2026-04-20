"use client"

import Link from "next/link"
import { ChevronDown, LoaderCircle, UserRound } from "lucide-react"
import { useState, useTransition } from "react"

import { updateUserStatusAction } from "@/lib/app-actions"
import type { AppUser } from "@/lib/api"
import { logoutAction } from "@/lib/auth-actions"
import { cn } from "@/lib/utils"

const USER_STATUSES = [
  { value: "available", label: "Disponivel" },
  { value: "away", label: "Ausente" },
] as const

type SectionItem = {
  label: string
  href?: string
}

function AccountSection({
  label,
  items,
}: {
  label: string
  items: SectionItem[]
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-center gap-2 text-[1.05rem] font-medium tracking-[-0.03em] text-[#182034]"
      >
        <span>{label}</span>
        <ChevronDown className={cn("h-5 w-5 transition", open ? "rotate-180" : "")} />
      </button>
      {open ? (
        <div className="space-y-2 text-center">
          {items.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className="block text-[1rem] text-[#182034] transition hover:text-[#2fb1c2]"
              >
                {item.label}
              </Link>
            ) : (
              <span
                key={item.label}
                className="block text-[1rem] text-[#8a92a3]"
              >
                {item.label}
              </span>
            )
          )}
        </div>
      ) : null}
    </div>
  )
}

export function AccountMenu({ user }: { user: AppUser }) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<AppUser["status"]>(user.status)

  return (
    <div className="space-y-10 px-6 pb-10 pt-6">
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-black/5 bg-[#f5f7fb] text-[#182034] shadow-[0_10px_28px_rgba(24,32,52,0.08)]">
          <UserRound className="h-14 w-14" />
        </div>
        <div>
          <h2 className="text-[2.15rem] font-medium tracking-[-0.06em] text-[#182034]">
            Usuario
          </h2>
          <p className="mt-1 text-sm text-[#5d6678]">
            {user.first_name} {user.last_name}
          </p>
        </div>
        <div className="mx-auto flex max-w-[220px] rounded-2xl bg-[#f1f3f6] p-1">
          {USER_STATUSES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                startTransition(async () => {
                  setStatus(option.value)
                  await updateUserStatusAction(option.value)
                })
              }
              className={cn(
                "flex-1 rounded-xl px-4 py-2 text-sm transition",
                status === option.value
                  ? "bg-white font-semibold text-[#182034] shadow-[0_6px_20px_rgba(24,32,52,0.08)]"
                  : "text-[#7d8494]"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        {isPending ? (
          <div className="inline-flex items-center gap-2 text-sm text-[#5d6678]">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Salvando status
          </div>
        ) : null}
      </div>

      <div className="space-y-8 text-center">
        <Link
          href="/account/profile"
          className="block text-[1.2rem] font-medium tracking-[-0.03em] text-[#182034]"
        >
          Meus dados
        </Link>

        <AccountSection
          label="Minhas solicitacoes"
          items={[
            { label: "Emprestimos/Trocas" },
            { label: "Reservas" },
            { label: "Nova avaliacao", href: "/reviews/new" },
          ]}
        />

        <AccountSection
          label="Meus Produtos/Servicos"
          items={[
            { label: "Novo Item" },
            { label: "Editar Item" },
            { label: "Ocultar Item" },
            { label: "Catalogo" },
          ]}
        />

        <Link
          href="/account/distance"
          className="block text-[1.2rem] font-medium tracking-[-0.03em] text-[#182034]"
        >
          Distancia
        </Link>

        <div className="space-y-2">
          <Link
            href="/support"
            className="block text-[1.2rem] font-medium tracking-[-0.03em] text-[#182034]"
          >
            Suporte
          </Link>
          <AccountSection
            label="Denuncia"
            items={[
              { label: "Nova Denuncia", href: "/reports/new" },
              { label: "Minhas Denuncias" },
            ]}
          />
        </div>

        <div className="space-y-2 text-[1.1rem] tracking-[-0.03em] text-[#182034]">
          <span className="block text-[#8a92a3]">Perguntas Frequentes</span>
          <span className="block text-[#8a92a3]">Termos e Privacidade</span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="mt-2 text-[1.2rem] font-medium text-[#182034]"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
