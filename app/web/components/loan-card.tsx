"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { UserRound, CalendarDays, RotateCcw, Flag } from "lucide-react"
import { toast } from "sonner"

import type { LoanEntry } from "@/lib/api"
import {
  approveLoanAction,
  rejectLoanAction,
  cancelLoanAction,
  pickupLoanAction,
  returnLoanAction,
} from "@/lib/app-actions"
import { loanStatusInfo, isTerminalLoan, formatLoanDate } from "@/lib/loan-status"

type Role = "lender" | "borrower"

type Action = {
  label: string
  run: (id: string) => Promise<{ ok: boolean; error?: string }>
  variant: "primary" | "danger" | "neutral"
}

function actionsFor(role: Role, status: string): Action[] {
  if (role === "lender") {
    if (status === "pending") {
      return [
        { label: "Aprovar", run: approveLoanAction, variant: "primary" },
        { label: "Rejeitar", run: rejectLoanAction, variant: "danger" },
      ]
    }
    if (status === "approved" || status === "in_progress") {
      return [
        { label: "Registrar devolução", run: returnLoanAction, variant: "primary" },
      ]
    }
    return []
  }
  // borrower
  if (status === "pending") {
    return [{ label: "Cancelar", run: cancelLoanAction, variant: "neutral" }]
  }
  if (status === "approved") {
    return [
      { label: "Confirmar retirada", run: pickupLoanAction, variant: "primary" },
      { label: "Cancelar", run: cancelLoanAction, variant: "neutral" },
    ]
  }
  return []
}

const VARIANT_CLASS: Record<Action["variant"], string> = {
  primary: "bg-[#2fb1c2] text-white hover:bg-[#26a0b0]",
  danger: "border border-red-200 text-red-600 hover:bg-red-50",
  neutral: "border border-[#e0e0de] text-[#333] hover:bg-[#fafafa]",
}

export function LoanCard({ loan, role }: { loan: LoanEntry; role: Role }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const counterpart = role === "lender" ? loan.borrower : loan.lender
  const counterpartName = counterpart.first_name || counterpart.username
  const status = loanStatusInfo(loan.status)
  const actions = actionsFor(role, loan.status)
  const terminal = isTerminalLoan(loan.status)

  function handle(action: Action) {
    setError(null)
    startTransition(async () => {
      const result = await action.run(loan.id)
      if (!result.ok) {
        const message = result.error ?? "Não foi possível concluir a ação."
        setError(message)
        toast.error(message)
        return
      }
      toast.success("Tudo certo! Empréstimo atualizado.")
      router.refresh()
    })
  }

  return (
    <div
      className={`flex flex-col rounded-2xl border border-black/7 bg-white p-5 shadow-[0_14px_32px_rgba(17,24,39,0.06)] transition ${
        terminal ? "opacity-65" : "hover:-translate-y-0.5"
      }`}
    >
      {/* Header: contraparte + status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8f7f9]">
            {counterpart.avatar ? (
              <img
                src={counterpart.avatar}
                alt={counterpartName}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound className="h-5 w-5 text-[#2fb1c2]" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium tracking-widest text-[#999] uppercase">
              {role === "lender" ? "Solicitado por" : "Dono do item"}
            </p>
            <p className="truncate text-sm font-semibold text-[#182034]">
              {counterpartName}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      {/* Item */}
      <h3 className="mt-4 line-clamp-1 text-lg font-semibold tracking-[-0.02em] text-[#182034]">
        {loan.item_name ?? "Item"}
      </h3>

      {/* Datas */}
      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-black/5 pt-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 shrink-0 text-[#b0b8c5]" />
          <div className="min-w-0">
            <p className="text-[10px] font-medium tracking-widest text-[#999] uppercase">
              Retirada
            </p>
            <p className="truncate text-sm text-[#5d6678]">
              {formatLoanDate(loan.pickup_date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4 shrink-0 text-[#b0b8c5]" />
          <div className="min-w-0">
            <p className="text-[10px] font-medium tracking-widest text-[#999] uppercase">
              Devolução
            </p>
            <p className="truncate text-sm text-[#5d6678]">
              {formatLoanDate(loan.expected_return_date)}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}

      {actions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              disabled={isPending}
              onClick={() => handle(action)}
              className={`h-10 rounded-lg px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${VARIANT_CLASS[action.variant]}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {loan.status === "returned" && (
        <div className="mt-4">
          <Link
            href={`/reviews/new?loan=${loan.id}`}
            className="inline-flex h-10 items-center rounded-lg bg-[#2fb1c2] px-4 text-sm font-medium text-white transition-colors hover:bg-[#26a0b0]"
          >
            Avaliar
          </Link>
        </div>
      )}

      {!["pending", "rejected", "cancelled"].includes(loan.status) && (
        <div className="mt-3 border-t border-black/5 pt-3">
          <Link
            href={`/reports/new?targetLoan=${loan.id}&loanLabel=${encodeURIComponent(loan.item_name ?? "Empréstimo")}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8a92a3] transition hover:text-red-500"
          >
            <Flag className="h-3.5 w-3.5" />
            Denunciar
          </Link>
        </div>
      )}
    </div>
  )
}
