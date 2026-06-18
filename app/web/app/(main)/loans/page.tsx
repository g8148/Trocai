import { getLoans, getMe } from "@/lib/api"
import { LoansView } from "@/components/loans-view"

export default async function LoansPage() {
  const [me, loans] = await Promise.all([getMe(), getLoans()])

  const received = me ? loans.filter((loan) => loan.lender.id === me.id) : []
  const sent = me ? loans.filter((loan) => loan.borrower.id === me.id) : []

  return (
    <div className="px-4 pt-4 pb-12 lg:px-0 lg:pt-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-[#111]">
          Meus empréstimos
        </h1>
        <p className="mt-1 text-sm text-[#999]">
          Acompanhe os pedidos que você fez e as solicitações nos seus itens.
        </p>
      </header>
      <LoansView received={received} sent={sent} />
    </div>
  )
}
