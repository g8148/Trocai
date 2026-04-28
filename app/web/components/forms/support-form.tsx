"use client"

import { useState, useTransition } from "react"

import { submitSupportAction } from "@/lib/app-actions"
import { Button } from "@/components/ui/button"
import { SuccessDialog } from "@/components/success-dialog"

const SUPPORT_OPTIONS = [
  "Solicitar intermediacao de emprestimo",
  "Solicitar intermediacao de devolucao",
  "Outro problema",
]

export function SupportForm() {
  const [selected, setSelected] = useState<string[]>([SUPPORT_OPTIONS[0]])
  const [description, setDescription] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function toggleOption(option: string) {
    setSelected((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option]
    )
  }

  return (
    <>
      <div className="space-y-5 px-5 pb-8 pt-6">
        <p className="text-sm text-[#5d6678]">* Campos obrigatorios</p>
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[#182034]">
            Como podemos te ajudar? *
          </label>
          <div className="space-y-3 text-[1.2rem] text-[#182034]">
            {SUPPORT_OPTIONS.map((option) => (
              <label key={option} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggleOption(option)}
                  className="mt-1"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#182034]">
            Descreva a situacao *
          </label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-[180px] w-full rounded-[24px] border border-black/10 px-4 py-3 text-base outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#182034]">Anexar Imagens</label>
          <div className="h-[190px] rounded-[24px] bg-[linear-gradient(145deg,#f4f5f7_0%,#eceeef_38%,#ffffff_100%)]" />
        </div>
        <Button
          type="button"
          onClick={() =>
            startTransition(async () => {
              await submitSupportAction()
              setShowSuccess(true)
            })
          }
          disabled={isPending}
          className="h-14 w-full rounded-2xl bg-[#10182c] text-base font-semibold"
        >
          {isPending ? "Enviando..." : "Finalizar"}
        </Button>
      </div>

      <SuccessDialog
        open={showSuccess}
        onOpenChange={setShowSuccess}
        title="Sua solicitacao foi enviada!"
        description="Nosso time de suporte entrara em contato em breve para ajudar a resolver a situacao."
      />
    </>
  )
}
