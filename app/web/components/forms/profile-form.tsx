"use client"

import { useState, useTransition } from "react"
import { CheckCircle, Lock, XCircle } from "lucide-react"

import { updateProfileAction } from "@/lib/app-actions"
import type { AppUser } from "@/lib/api"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#b0b8c5]">
        {title}
      </p>
      <div className="space-y-3 rounded-2xl border border-black/6 bg-white px-4 py-4 shadow-[0_2px_8px_rgba(17,24,39,0.04)]">
        {children}
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  hint,
  placeholder,
}: {
  label: string
  value: string
  onChange?: (value: string) => void
  type?: string
  disabled?: boolean
  hint?: string
  placeholder?: string
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
          onChange={(event) => onChange?.(event.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={`h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition ${
            disabled
              ? "cursor-not-allowed border-black/5 bg-[#f7f8fb] text-[#8a92a3]"
              : "border-black/10 bg-white text-[#182034] focus:border-[#2fb1c2] focus:ring-2 focus:ring-[#2fb1c2]/10"
          }`}
        />
        {disabled ? (
          <Lock className="absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#c8ccd4]" />
        ) : null}
      </div>
      {hint ? <p className="mt-1.5 text-xs text-[#8a92a3]">{hint}</p> : null}
    </div>
  )
}

export function ProfileForm({ user }: { user: AppUser }) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null)

  const [values, setValues] = useState({
    fullName: [user.first_name, user.last_name].filter(Boolean).join(" "),
    username: user.username,
    email: user.email,
    phone: user.phone ?? "",
    zip_code: user.zip_code ?? "",
    street: user.street ?? "",
    neighborhood: user.neighborhood ?? "",
    city: user.city ?? "",
    state: user.state ?? "",
  })

  function set(key: keyof typeof values) {
    return (value: string) => setValues((prev) => ({ ...prev, [key]: value }))
  }

  function splitName(fullName: string) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean)
    return {
      first_name: parts[0] ?? "Usuário",
      last_name: parts.slice(1).join(" ") || "Trocai",
    }
  }

  function handleSave() {
    startTransition(async () => {
      const { first_name, last_name } = splitName(values.fullName)
      const result = await updateProfileAction({
        first_name,
        last_name,
        username: values.username,
        email: values.email,
        phone: values.phone,
        zip_code: values.zip_code,
        street: values.street,
        neighborhood: values.neighborhood,
        city: values.city,
        state: values.state,
      })

      setFeedback({
        ok: result.ok,
        message: result.ok ? "Dados salvos com sucesso." : result.error ?? "Erro ao salvar.",
      })

      if (result.ok) {
        setTimeout(() => setFeedback(null), 3500)
      }
    })
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 lg:px-0">
      <Section title="Perfil">
        <Field label="Nome completo" value={values.fullName} onChange={set("fullName")} />
        <Field
          label="Usuário"
          value={values.username}
          onChange={set("username")}
          placeholder="seu_usuario"
        />
      </Section>

      <Section title="Contato">
        <Field label="E-mail" type="email" value={values.email} onChange={set("email")} />
        <Field
          label="Telefone"
          type="tel"
          value={values.phone}
          onChange={set("phone")}
          placeholder="(11) 99999-9999"
        />
      </Section>

      <Section title="Endereço">
        <Field
          label="CEP"
          value={values.zip_code}
          onChange={set("zip_code")}
          placeholder="00000-000"
        />
        <Field label="Rua" value={values.street} onChange={set("street")} />
        <Field label="Bairro" value={values.neighborhood} onChange={set("neighborhood")} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cidade" value={values.city} onChange={set("city")} />
          <Field label="Estado" value={values.state} onChange={set("state")} placeholder="SP" />
        </div>
      </Section>

      <Section title="Identificação">
        <Field
          label="CPF"
          value={user.cpf ?? ""}
          disabled
          hint="O CPF não pode ser alterado após o cadastro."
        />
      </Section>

      {feedback ? (
        <div
          className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium ${
            feedback.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
          }`}
        >
          {feedback.ok ? (
            <CheckCircle className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          {feedback.message}
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-black/5 bg-white/95 px-4 py-3 backdrop-blur-xl lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="h-12 w-full rounded-2xl bg-[#10182c] text-sm font-semibold text-white transition hover:bg-[#1a2640] disabled:opacity-50"
        >
          {isPending ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </div>
  )
}
