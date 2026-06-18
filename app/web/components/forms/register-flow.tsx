"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { registerAction } from "@/lib/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SuccessDialog } from "@/components/success-dialog"

type RegisterValues = {
  fullName: string
  cpf: string
  phone: string
  email: string
  password: string
  zip_code: string
  street: string
  neighborhood: string
  city: string
  state: string
}

const INITIAL_VALUES: RegisterValues = {
  fullName: "",
  cpf: "",
  phone: "",
  email: "",
  password: "",
  zip_code: "",
  street: "",
  neighborhood: "",
  city: "",
  state: "",
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  return {
    first_name: parts[0] ?? "Usuário",
    last_name: parts.slice(1).join(" ") || "Trocai",
  }
}

function deriveUsername(email: string) {
  return email.split("@")[0]?.replace(/[^a-zA-Z0-9._-]/g, "") || `usuario${Date.now()}`
}

export function RegisterFlow() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [values, setValues] = useState(INITIAL_VALUES)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  function updateField(name: keyof RegisterValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    setError(null)

    const { first_name, last_name } = splitName(values.fullName)
    const result = await registerAction({
      first_name,
      last_name,
      username: deriveUsername(values.email),
      email: values.email,
      cpf: values.cpf,
      phone: values.phone,
      password1: values.password,
      password2: values.password,
      zip_code: values.zip_code,
      street: values.street,
      neighborhood: values.neighborhood,
      city: values.city,
      state: values.state,
    })

    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.fieldErrors) {
      const firstFieldError = Object.values(result.fieldErrors)[0]?.[0]
      setError(firstFieldError ?? "Não foi possível concluir o cadastro.")
      return
    }

    setShowSuccess(true)
  }

  return (
    <>
      <div className="space-y-6">
        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#182034]">
                Nome completo *
              </label>
              <Input
                value={values.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                className="h-12 rounded-2xl border-black/10 px-4 text-base"
                placeholder="Aluno Unoesc"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#182034]">CPF *</label>
              <Input
                value={values.cpf}
                onChange={(event) => updateField("cpf", event.target.value)}
                className="h-12 rounded-2xl border-black/10 px-4 text-base"
                placeholder="999.999.999-99"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#182034]">
                Telefone *
              </label>
              <Input
                value={values.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="h-12 rounded-2xl border-black/10 px-4 text-base"
                placeholder="(99) 9 9999-9999"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#182034]">
                E-mail *
              </label>
              <Input
                type="email"
                value={values.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="h-12 rounded-2xl border-black/10 px-4 text-base"
                placeholder="exemplo@email.com"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#182034]">Senha *</label>
              <Input
                type="password"
                value={values.password}
                onChange={(event) => updateField("password", event.target.value)}
                className="h-12 rounded-2xl border-black/10 px-4 text-base"
                placeholder="Digite sua senha"
              />
            </div>
            <p className="text-sm text-[#5d6678]">* Campos obrigatórios</p>
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            <Button
              type="button"
              onClick={() => setStep(2)}
              className="h-14 w-full rounded-2xl bg-[#10182c] text-base font-semibold"
            >
              Continuar
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {[
              ["zip_code", "CEP *", "99999-999"],
              ["street", "Rua *", ""],
              ["neighborhood", "Bairro *", ""],
              ["city", "Cidade *", ""],
              ["state", "Estado *", ""],
            ].map(([key, label, placeholder]) => (
              <div key={key} className="space-y-2">
                <label className="block text-sm font-medium text-[#182034]">
                  {label}
                </label>
                <Input
                  value={values[key as keyof RegisterValues]}
                  onChange={(event) =>
                    updateField(key as keyof RegisterValues, event.target.value)
                  }
                  className="h-12 rounded-2xl border-black/10 px-4 text-base"
                  placeholder={placeholder}
                />
              </div>
            ))}
            <p className="text-sm leading-6 text-[#5d6678]">
              Ao se cadastrar, você concorda com os Termos de Serviço e a Política de Privacidade.
            </p>
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="h-14 flex-1 rounded-2xl"
              >
                Voltar
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-14 flex-1 rounded-2xl bg-[#10182c] text-base font-semibold"
              >
                {isSubmitting ? "Criando..." : "Finalizar cadastro"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <SuccessDialog
        open={showSuccess}
        onOpenChange={(open) => {
          setShowSuccess(open)
          if (!open) {
            router.push("/")
          }
        }}
        title="Cadastro concluído com sucesso!"
        description={
          "Sua conta foi criada e já está ativa.\n\nVerifique seu e-mail ou telefone para confirmar sua identidade e começar a usar o app."
        }
      />
    </>
  )
}
