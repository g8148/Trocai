"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { Wrench } from "lucide-react"

import { registerAction } from "@/lib/auth-actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type FieldErrors = Record<string, string[]>

const FIELDS = [
  { name: "first_name" as const, label: "Nome", props: {} },
  { name: "last_name" as const, label: "Sobrenome", props: {} },
  { name: "username" as const, label: "Nome de usuário", props: {} },
  { name: "email" as const, label: "Email", props: { type: "email", placeholder: "seu@email.com" } },
  { name: "cpf" as const, label: "CPF", props: { placeholder: "000.000.000-00" } },
  { name: "password1" as const, label: "Senha", props: { type: "password", placeholder: "••••••••" } },
  { name: "password2" as const, label: "Confirmar senha", props: { type: "password", placeholder: "••••••••" } },
]

export default function RegisterPage() {
  const router = useRouter()
  const [globalError, setGlobalError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      cpf: "",
      password1: "",
      password2: "",
    },
    onSubmit: async ({ value }) => {
      setGlobalError(null)
      const result = await registerAction(value)

      if (result.fieldErrors) {
        const errors = result.fieldErrors as FieldErrors
        if (errors.non_field_errors) {
          setGlobalError(errors.non_field_errors[0])
        }
        for (const field of FIELDS) {
          if (errors[field.name]) {
            form.setFieldMeta(field.name, (prev) => ({
              ...prev,
              errors: errors[field.name],
              errorMap: { onSubmit: errors[field.name][0] },
            }))
          }
        }
        return
      }

      router.push("/")
    },
  })

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="mb-2 flex justify-center">
          <Wrench className="h-7 w-7 text-primary" />
        </div>
        <CardTitle>Criar conta</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="flex flex-col gap-3"
        >
          <div className="grid grid-cols-2 gap-2">
            {FIELDS.slice(0, 2).map(({ name, label, props }) => (
              <form.Field key={name} name={name}>
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={field.name}>{label}</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      {...props}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-xs text-destructive">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            ))}
          </div>

          {FIELDS.slice(2).map(({ name, label, props }) => (
            <form.Field key={name} name={name}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={field.name}>{label}</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    {...props}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          ))}

          {globalError && (
            <p className="text-sm text-destructive">{globalError}</p>
          )}

          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" className="w-full" disabled={!canSubmit}>
                {isSubmitting ? "Criando conta..." : "Criar conta"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        Já tem conta?&nbsp;
        <Link href="/login" className="text-primary hover:underline">
          Entrar
        </Link>
      </CardFooter>
    </Card>
  )
}
