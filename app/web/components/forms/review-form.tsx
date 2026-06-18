"use client"

import { useMemo, useState, useTransition } from "react"
import { Star } from "lucide-react"

import { createReviewAction } from "@/lib/app-actions"
import type { LoanEntry } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SuccessDialog } from "@/components/success-dialog"

function StarRating({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[#182034]">{label}</label>
      <div className="flex gap-4 text-[#ff8b2c]">
        {Array.from({ length: 5 }).map((_, index) => {
          const rating = index + 1
          return (
            <button key={rating} type="button" onClick={() => onChange(rating)}>
              <Star
                className="h-8 w-8"
                fill={rating <= value ? "currentColor" : "none"}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function ReviewForm({ loans }: { loans: LoanEntry[] }) {
  const reviewableLoans = useMemo(
    () => loans.filter((loan) => loan.status === "returned"),
    [loans]
  )
  const [selectedLoan, setSelectedLoan] = useState(reviewableLoans[0]?.id ?? "")
  const [itemRating, setItemRating] = useState(4)
  const [userRating, setUserRating] = useState(4)
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const currentLoan = reviewableLoans.find((loan) => loan.id === selectedLoan) ?? null

  return (
    <>
      <div className="space-y-5 px-5 pb-8 pt-6">
        <p className="text-sm text-[#5d6678]">* Campos obrigatórios</p>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#182034]">Ferramenta *</label>
          <select
            value={selectedLoan}
            onChange={(event) => setSelectedLoan(event.target.value)}
            className="h-12 w-full rounded-2xl border border-black/10 px-4 text-base text-[#182034]"
          >
            {reviewableLoans.length === 0 ? (
              <option value="">Nenhum empréstimo devolvido encontrado</option>
            ) : null}
            {reviewableLoans.map((loan) => (
              <option key={loan.id} value={loan.id}>
                {loan.item_name ?? loan.item}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#182034]">Fornecedor *</label>
          <Input
            value={currentLoan?.lender.first_name || currentLoan?.lender.username || ""}
            disabled
            className="h-12 rounded-2xl border-black/10 px-4 text-base"
          />
        </div>
        <StarRating
          label="Como foi a experiência com o item? *"
          value={itemRating}
          onChange={setItemRating}
        />
        <StarRating
          label="Como foi o atendimento do fornecedor? *"
          value={userRating}
          onChange={setUserRating}
        />
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#182034]">Descrição</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-[180px] w-full rounded-[24px] border border-black/10 px-4 py-3 text-base outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#182034]">Foto</label>
          <div className="h-[150px] rounded-[24px] bg-[linear-gradient(145deg,#f4f5f7_0%,#eceeef_38%,#ffffff_100%)]" />
        </div>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <Button
          type="button"
          onClick={() =>
            startTransition(async () => {
              if (!selectedLoan) {
                setError("Selecione um empréstimo devolvido.")
                return
              }

              const result = await createReviewAction({
                loan: selectedLoan,
                item_rating: itemRating,
                user_rating: userRating,
                description,
              })

              if (!result.ok) {
                setError(result.error ?? "Erro ao enviar avaliação.")
                return
              }

              setShowSuccess(true)
            })
          }
          disabled={isPending || reviewableLoans.length === 0}
          className="h-14 w-full rounded-2xl bg-[#10182c] text-base font-semibold"
        >
          {isPending ? "Enviando..." : "Finalizar"}
        </Button>
      </div>

      <SuccessDialog
        open={showSuccess}
        onOpenChange={setShowSuccess}
        title="Avaliação enviada"
        description="Obrigado! Sua avaliação já foi registrada com sucesso."
      />
    </>
  )
}
