"use client"

import { useState, useTransition } from "react"

import { updateProfileAction } from "@/lib/app-actions"
import type { AppUser } from "@/lib/api"
import { logoutAction } from "@/lib/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ProfileForm({ user }: { user: AppUser }) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [values, setValues] = useState({
    username: user.username,
    fullName: `${user.first_name} ${user.last_name}`.trim(),
    cpf: user.cpf,
    phone: user.phone,
    zip_code: user.zip_code,
    street: user.street,
    neighborhood: user.neighborhood,
    city: user.city,
    state: user.state,
    email: user.email,
  })

  function splitName(fullName: string) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean)
    return {
      first_name: parts[0] ?? "Usuario",
      last_name: parts.slice(1).join(" ") || "Trocai",
    }
  }

  return (
    <div className="space-y-4 px-5 pb-8 pt-6">
      {[
        ["username", "Usuario *"],
        ["fullName", "Nome Completo *"],
        ["cpf", "CPF *"],
        ["phone", "Telefone *"],
        ["zip_code", "CEP"],
        ["street", "Rua"],
        ["neighborhood", "Bairro"],
        ["city", "Cidade"],
        ["state", "Estado"],
        ["email", "E-mail *"],
      ].map(([key, label]) => (
        <div key={key} className="space-y-2">
          <label className="block text-sm font-medium text-[#182034]">{label}</label>
          <Input
            value={values[key as keyof typeof values]}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                [key]: event.target.value,
              }))
            }
            className="h-12 rounded-2xl border-black/10 px-4 text-base"
          />
        </div>
      ))}

      {message ? <p className="text-sm text-[#2fb1c2]">{message}</p> : null}

      <Button
        type="button"
        onClick={() =>
          startTransition(async () => {
            const { first_name, last_name } = splitName(values.fullName)
            const result = await updateProfileAction({
              username: values.username,
              first_name,
              last_name,
              cpf: values.cpf,
              phone: values.phone,
              zip_code: values.zip_code,
              street: values.street,
              neighborhood: values.neighborhood,
              city: values.city,
              state: values.state,
              email: values.email,
            })
            setMessage(result.ok ? "Dados salvos com sucesso." : result.error ?? "Erro ao salvar.")
          })
        }
        disabled={isPending}
        className="mt-4 h-14 w-full rounded-2xl bg-[#10182c] text-base font-semibold"
      >
        {isPending ? "Salvando..." : "Salvar ajustes"}
      </Button>

      <form action={logoutAction}>
        <Button
          type="submit"
          className="h-14 w-full rounded-2xl bg-[#10182c] text-base font-semibold"
        >
          Sair
        </Button>
      </form>
    </div>
  )
}
