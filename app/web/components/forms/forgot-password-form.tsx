"use client"

import { useState, useTransition } from "react"

import { requestPasswordResetAction } from "@/lib/app-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SuccessDialog } from "@/components/success-dialog"

export function ForgotPasswordForm() {
  const [login, setLogin] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#182034]">
            Usuário ou e-mail
          </label>
          <Input
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            className="h-12 rounded-2xl border-black/10 px-4 text-base"
            placeholder="exemplo@email.com"
          />
        </div>

        <p className="whitespace-pre-line text-[1rem] leading-7 text-[#182034]">
          * Caso seu cadastro seja identificado,
          {"\n"}você receberá um link para redefinição de senha.
        </p>

        <Button
          type="button"
          onClick={() =>
            startTransition(async () => {
              await requestPasswordResetAction(login)
              setShowSuccess(true)
            })
          }
          disabled={isPending || !login}
          className="h-14 w-full rounded-2xl bg-[#10182c] text-base font-semibold"
        >
          {isPending ? "Enviando..." : "Enviar"}
        </Button>
      </div>

      <SuccessDialog
        open={showSuccess}
        onOpenChange={setShowSuccess}
        title="Link enviado"
        description="Se o cadastro existir, você receberá as instruções para redefinir sua senha."
      />
    </>
  )
}
