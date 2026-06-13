"use client"

import { useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"

import { createReportAction } from "@/lib/app-actions"
import { Button } from "@/components/ui/button"
import { SuccessDialog } from "@/components/success-dialog"

const REASON_OPTIONS = [
  "Produto não corresponde à descrição",
  "Comportamento ofensivo ou abusivo",
  "Tentativa de golpe ou fraude",
  "Conteúdo inapropriado",
  "Outro motivo",
]

export function ReportForm() {
  const params = useSearchParams()
  const [targetType, setTargetType] = useState<"usuario" | "item" | "emprestimo">("usuario")
  const [reason, setReason] = useState(REASON_OPTIONS[0])
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const target_user = params.get("targetUser") ?? undefined
  const target_item = params.get("targetItem") ?? undefined
  const target_loan = params.get("targetLoan") ?? undefined

  return (
    <>
      <div className="space-y-5 px-5 pb-8 pt-6">
        <p className="text-sm text-[#5d6678]">* Campos obrigatórios</p>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#182034]">
            O que você deseja denunciar? *
          </label>
          <div className="space-y-2 text-[1.2rem] text-[#182034]">
            {[
              ["usuario", "Usuário"],
              ["item", "Produto ou serviço"],
              ["emprestimo", "Conversa / comportamento"],
            ].map(([value, label]) => (
              <label key={value} className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={targetType === value}
                  onChange={() => setTargetType(value as "usuario" | "item" | "emprestimo")}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#182034]">
            Selecione o motivo: *
          </label>
          <div className="space-y-2 text-[1.15rem] text-[#182034]">
            {REASON_OPTIONS.map((option) => (
              <label key={option} className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={reason === option}
                  onChange={() => setReason(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#182034]">Descrição *</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-[180px] w-full rounded-[24px] border border-black/10 px-4 py-3 text-base outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#182034]">Anexar imagens</label>
          <div className="h-[140px] rounded-[24px] bg-[linear-gradient(145deg,#f4f5f7_0%,#eceeef_38%,#ffffff_100%)]" />
        </div>
        <p className="text-sm text-[#5d6678]">
          Para registrar no backend, abra esta tela a partir do usuário, item ou empréstimo que deseja denunciar.
        </p>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <Button
          type="button"
          onClick={() =>
            startTransition(async () => {
              if (!description) {
                setError("Descreva o motivo da denúncia.")
                return
              }

              const targetPayload =
                targetType === "usuario"
                  ? { target_user }
                  : targetType === "item"
                    ? { target_item }
                    : { target_loan }

              if (!Object.values(targetPayload)[0]) {
                setError("Selecione um contexto válido para registrar a denúncia.")
                return
              }

              const result = await createReportAction({
                target_type: targetType,
                reason,
                description,
                ...targetPayload,
              })

              if (!result.ok) {
                setError(result.error ?? "Não foi possível enviar a denúncia.")
                return
              }

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
        title="Sua denúncia foi enviada com sucesso!"
        description="Nossa equipe irá analisar o caso e tomará as medidas necessárias."
      />
    </>
  )
}
