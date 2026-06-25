"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Check, Loader2, MapPin, UserRound } from "lucide-react"

import { registerAction } from "@/lib/auth-actions"
import { cn } from "@/lib/utils"
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

type FieldErrors = Partial<Record<keyof RegisterValues, string>>

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

// O backend retorna erros com as chaves da API; traz de volta para os campos do form.
const API_TO_FIELD: Record<string, keyof RegisterValues> = {
  first_name: "fullName",
  last_name: "fullName",
  email: "email",
  cpf: "cpf",
  phone: "phone",
  password1: "password",
  password2: "password",
  password: "password",
  zip_code: "zip_code",
  street: "street",
  neighborhood: "neighborhood",
  city: "city",
  state: "state",
}

// Rótulos amigáveis para chaves de erro que não têm um campo no formulário,
// usados para montar uma mensagem geral explicando o motivo da recusa.
const API_KEY_LABELS: Record<string, string> = {
  non_field_errors: "",
  detail: "",
  username: "Nome de usuário",
}

const STEP_1_FIELDS: Array<keyof RegisterValues> = [
  "fullName",
  "cpf",
  "phone",
  "email",
  "password",
]

const inputClassName =
  "h-11 rounded-lg border-[#e0e0de] bg-white px-3.5 text-sm text-[#182034] shadow-none placeholder:text-[#b3b8c2] focus-visible:border-[#2fb1c2] focus-visible:ring-1 focus-visible:ring-[#2fb1c2]/40 aria-[invalid=true]:border-red-300 aria-[invalid=true]:ring-red-200"

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  return {
    first_name: parts[0] ?? "Usuário",
    last_name: parts.slice(1).join(" ") || "Trocai",
  }
}

function maskCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
}

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 7)
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7)}`
}

function maskCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

function validateStepOne(values: RegisterValues): FieldErrors {
  const errors: FieldErrors = {}

  if (values.fullName.trim().split(/\s+/).filter(Boolean).length < 2) {
    errors.fullName = "Informe nome e sobrenome."
  }
  if (values.cpf.replace(/\D/g, "").length !== 11) {
    errors.cpf = "CPF deve ter 11 dígitos."
  }
  if (values.phone.replace(/\D/g, "").length < 10) {
    errors.phone = "Informe um telefone com DDD."
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Informe um e-mail válido."
  }
  if (values.password.length < 6) {
    errors.password = "A senha precisa de pelo menos 6 caracteres."
  }

  return errors
}

function validateStepTwo(values: RegisterValues): FieldErrors {
  const errors: FieldErrors = {}

  if (values.zip_code.replace(/\D/g, "").length !== 8) {
    errors.zip_code = "CEP deve ter 8 dígitos."
  }
  if (!values.street.trim()) errors.street = "Informe a rua."
  if (!values.neighborhood.trim()) errors.neighborhood = "Informe o bairro."
  if (!values.city.trim()) errors.city = "Informe a cidade."
  if (values.state.trim().length !== 2) errors.state = "Use a sigla (ex.: SC)."

  return errors
}

function StepIndicator({ step }: { step: 1 | 2 }) {
  const nodes = [
    { id: 1, label: "Identidade", Icon: UserRound },
    { id: 2, label: "Vizinhança", Icon: MapPin },
  ] as const

  return (
    <div className="flex items-center justify-center gap-3">
      {nodes.map((node, index) => {
        const done = step > node.id
        const active = step === node.id

        return (
          <div key={node.id} className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                  done && "border-[#2fb1c2] bg-[#2fb1c2] text-white",
                  active &&
                    "border-[#2fb1c2] bg-[#2fb1c2]/10 text-[#1f8d9c]",
                  !done && !active && "border-[#e0e0de] bg-white text-[#b3b8c2]"
                )}
              >
                {done ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : (
                  <node.Icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium tracking-wide",
                  active || done ? "text-[#182034]" : "text-[#b3b8c2]"
                )}
              >
                {node.label}
              </span>
            </div>

            {index === 0 ? (
              <div className="mb-5 h-0.5 w-12 overflow-hidden rounded-full bg-[#e0e0de]">
                <div
                  className={cn(
                    "h-full rounded-full bg-[#2fb1c2] transition-all duration-500",
                    step > 1 ? "w-full" : "w-0"
                  )}
                />
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

function FieldRow({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-[11px] font-medium uppercase tracking-widest text-[#666]"
      >
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  )
}

export function RegisterFlow() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLookingUpCep, setIsLookingUpCep] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  function updateField(name: keyof RegisterValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => {
      if (!current[name]) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  async function lookupCep() {
    const digits = values.zip_code.replace(/\D/g, "")
    if (digits.length !== 8) return

    setIsLookingUpCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (!data?.erro) {
        setValues((current) => ({
          ...current,
          street: data.logradouro || current.street,
          neighborhood: data.bairro || current.neighborhood,
          city: data.localidade || current.city,
          state: data.uf || current.state,
        }))
        setErrors((current) => ({
          ...current,
          street: undefined,
          neighborhood: undefined,
          city: undefined,
          state: undefined,
        }))
      }
    } catch {
      // Busca de CEP é só uma conveniência: se falhar, o usuário preenche à mão.
    } finally {
      setIsLookingUpCep(false)
    }
  }

  function goToStepTwo() {
    const stepErrors = validateStepOne(values)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }
    setErrors({})
    setFormError(null)
    setStep(2)
  }

  // Retorna a mensagem geral montada (ou null), para o chamador decidir o texto.
  function applyApiErrors(fieldErrors: Record<string, string[] | string>): string | null {
    const mapped: FieldErrors = {}
    const generalMessages: string[] = []
    let hasStepOneError = false

    for (const [apiKey, raw] of Object.entries(fieldErrors)) {
      const message = Array.isArray(raw) ? raw[0] : raw
      if (!message) continue

      const field = API_TO_FIELD[apiKey]
      if (field) {
        mapped[field] = message
        if (STEP_1_FIELDS.includes(field)) hasStepOneError = true
        continue
      }

      // Erro sem campo correspondente no formulário: vira mensagem geral,
      // assim o usuário sempre vê o motivo real da recusa.
      const label = API_KEY_LABELS[apiKey]
      generalMessages.push(label ? `${label}: ${message}` : message)
    }

    setErrors(mapped)
    if (hasStepOneError) setStep(1)

    if (generalMessages.length > 0) {
      return generalMessages.join(" ")
    }
    if (Object.keys(mapped).length === 0) {
      return "Não foi possível concluir o cadastro. Tente novamente."
    }
    return null
  }

  async function handleSubmit() {
    const stepErrors = validateStepTwo(values)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }

    setIsSubmitting(true)
    setFormError(null)
    setErrors({})

    const { first_name, last_name } = splitName(values.fullName)
    const result = await registerAction({
      first_name,
      last_name,
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

    if (result.fieldErrors) {
      const general = applyApiErrors(result.fieldErrors)
      setFormError(general ?? "Revise os campos destacados e tente de novo.")
      return
    }

    if (result.error) {
      setFormError(result.error)
      return
    }

    setShowSuccess(true)
  }

  return (
    <>
      <div>
        <div className="mb-6 flex flex-col items-center text-center">
          <Image
            src="/logo.png"
            alt="Trocaí"
            width={120}
            height={86}
            className="mb-4 h-14 w-auto"
            priority
          />
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[#182034]">
            Crie sua conta
          </h1>
          <p className="mt-1 text-sm text-[#5d6678]">
            {step === 1
              ? "Comece com seus dados pessoais."
              : "Agora, onde você mora — é assim que te conectamos a vizinhos por perto."}
          </p>
        </div>

        <div className="mb-7">
          <StepIndicator step={step} />
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <FieldRow label="Nome completo" htmlFor="fullName" error={errors.fullName}>
              <Input
                id="fullName"
                value={values.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                aria-invalid={Boolean(errors.fullName)}
                className={inputClassName}
                placeholder="Aluno Unoesc"
                autoComplete="name"
              />
            </FieldRow>

            <FieldRow label="CPF" htmlFor="cpf" error={errors.cpf}>
              <Input
                id="cpf"
                inputMode="numeric"
                value={values.cpf}
                onChange={(event) =>
                  updateField("cpf", maskCpf(event.target.value))
                }
                aria-invalid={Boolean(errors.cpf)}
                className={inputClassName}
                placeholder="999.999.999-99"
              />
            </FieldRow>

            <FieldRow label="Telefone" htmlFor="phone" error={errors.phone}>
              <Input
                id="phone"
                inputMode="tel"
                value={values.phone}
                onChange={(event) =>
                  updateField("phone", maskPhone(event.target.value))
                }
                aria-invalid={Boolean(errors.phone)}
                className={inputClassName}
                placeholder="(99) 9 9999-9999"
                autoComplete="tel"
              />
            </FieldRow>

            <FieldRow label="E-mail" htmlFor="email" error={errors.email}>
              <Input
                id="email"
                type="email"
                value={values.email}
                onChange={(event) => updateField("email", event.target.value)}
                aria-invalid={Boolean(errors.email)}
                className={inputClassName}
                placeholder="exemplo@email.com"
                autoComplete="email"
              />
            </FieldRow>

            <FieldRow label="Senha" htmlFor="password" error={errors.password}>
              <Input
                id="password"
                type="password"
                value={values.password}
                onChange={(event) => updateField("password", event.target.value)}
                aria-invalid={Boolean(errors.password)}
                className={inputClassName}
                placeholder="Pelo menos 8 caracteres"
                autoComplete="new-password"
              />
            </FieldRow>

            {formError ? (
              <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                {formError}
              </p>
            ) : null}

            <Button
              type="button"
              onClick={goToStepTwo}
              className="h-11 w-full rounded-lg bg-[#2fb1c2] text-sm font-semibold text-white shadow-none hover:bg-[#26a0b0]"
            >
              Continuar
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <FieldRow label="CEP" htmlFor="zip_code" error={errors.zip_code}>
              <div className="relative">
                <Input
                  id="zip_code"
                  inputMode="numeric"
                  value={values.zip_code}
                  onChange={(event) =>
                    updateField("zip_code", maskCep(event.target.value))
                  }
                  onBlur={lookupCep}
                  aria-invalid={Boolean(errors.zip_code)}
                  className={inputClassName}
                  placeholder="99999-999"
                  autoComplete="postal-code"
                />
                {isLookingUpCep ? (
                  <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-[#8a92a3]" />
                ) : null}
              </div>
            </FieldRow>

            <FieldRow label="Rua" htmlFor="street" error={errors.street}>
              <Input
                id="street"
                value={values.street}
                onChange={(event) => updateField("street", event.target.value)}
                aria-invalid={Boolean(errors.street)}
                className={inputClassName}
                placeholder="Rua das Trocas"
                autoComplete="address-line1"
              />
            </FieldRow>

            <FieldRow
              label="Bairro"
              htmlFor="neighborhood"
              error={errors.neighborhood}
            >
              <Input
                id="neighborhood"
                value={values.neighborhood}
                onChange={(event) =>
                  updateField("neighborhood", event.target.value)
                }
                aria-invalid={Boolean(errors.neighborhood)}
                className={inputClassName}
                placeholder="Centro"
              />
            </FieldRow>

            <div className="grid grid-cols-[1fr_auto] gap-3">
              <FieldRow label="Cidade" htmlFor="city" error={errors.city}>
                <Input
                  id="city"
                  value={values.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  aria-invalid={Boolean(errors.city)}
                  className={inputClassName}
                  placeholder="Joaçaba"
                />
              </FieldRow>

              <FieldRow label="UF" htmlFor="state" error={errors.state}>
                <Input
                  id="state"
                  value={values.state}
                  onChange={(event) =>
                    updateField(
                      "state",
                      event.target.value.toUpperCase().slice(0, 2)
                    )
                  }
                  aria-invalid={Boolean(errors.state)}
                  className={cn(inputClassName, "w-16 text-center uppercase")}
                  placeholder="SC"
                />
              </FieldRow>
            </div>

            <p className="text-xs leading-5 text-[#8a92a3]">
              Ao criar a conta, você concorda com os{" "}
              <a href="/termos" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#182034] transition-colors">
                Termos de Serviço
              </a>{" "}
              e a{" "}
              <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#182034] transition-colors">
                Política de Privacidade
              </a>
              .
            </p>

            {formError ? (
              <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                {formError}
              </p>
            ) : null}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setErrors({})
                  setFormError(null)
                  setStep(1)
                }}
                className="h-11 flex-1 rounded-lg"
              >
                Voltar
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-11 flex-1 rounded-lg bg-[#2fb1c2] text-sm font-semibold text-white shadow-none hover:bg-[#26a0b0]"
              >
                {isSubmitting ? "Criando conta..." : "Criar conta"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-[#8a92a3]">
        Já tem conta?{" "}
        <a
          href="/login"
          className="font-medium text-[#2fb1c2] hover:underline"
        >
          Entrar
        </a>
      </p>

      <SuccessDialog
        open={showSuccess}
        onOpenChange={(open) => {
          setShowSuccess(open)
          if (!open) {
            router.push("/")
          }
        }}
        title="Conta criada com sucesso!"
        description={
          "Sua conta já está ativa.\n\nConfirme seu e-mail ou telefone para validar sua identidade e começar a trocar com a vizinhança."
        }
      />
    </>
  )
}
