"use client"

import type { LoanEntry } from "@/lib/api"
import { LoanCard } from "@/components/loan-card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { isTerminalLoan } from "@/lib/loan-status"

function byStatusThenDate(a: LoanEntry, b: LoanEntry) {
  const at = isTerminalLoan(a.status) ? 1 : 0
  const bt = isTerminalLoan(b.status) ? 1 : 0
  if (at !== bt) return at - bt
  return b.requested_at.localeCompare(a.requested_at)
}

function activeCount(loans: LoanEntry[]) {
  return loans.filter((loan) => !isTerminalLoan(loan.status)).length
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="col-span-full rounded-2xl border border-dashed border-[#e0e0de] bg-[#fafafa] px-4 py-16 text-center text-sm text-[#999]">
      {message}
    </div>
  )
}

function CountBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2fb1c2] px-1.5 text-[11px] font-semibold text-white">
      {count}
    </span>
  )
}

export function LoansView({
  received,
  sent,
}: {
  received: LoanEntry[]
  sent: LoanEntry[]
}) {
  const receivedSorted = [...received].sort(byStatusThenDate)
  const sentSorted = [...sent].sort(byStatusThenDate)

  return (
    <Tabs defaultValue="received" className="w-full">
      <TabsList className="h-10 w-fit p-1">
        <TabsTrigger value="received" className="px-4 text-sm">
          Recebidos
          <CountBadge count={activeCount(received)} />
        </TabsTrigger>
        <TabsTrigger value="sent" className="px-4 text-sm">
          Enviados
          <CountBadge count={activeCount(sent)} />
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="received"
        className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {receivedSorted.length === 0 ? (
          <EmptyState message="Nenhuma solicitação nos seus itens ainda." />
        ) : (
          receivedSorted.map((loan) => (
            <LoanCard key={loan.id} loan={loan} role="lender" />
          ))
        )}
      </TabsContent>

      <TabsContent
        value="sent"
        className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {sentSorted.length === 0 ? (
          <EmptyState message="Você ainda não pediu nenhum item emprestado." />
        ) : (
          sentSorted.map((loan) => (
            <LoanCard key={loan.id} loan={loan} role="borrower" />
          ))
        )}
      </TabsContent>
    </Tabs>
  )
}
