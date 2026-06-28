import { ShieldAlert } from "lucide-react"

import { ReportForm, type ReportTargets } from "@/components/forms/report-form"

export default async function NewReportPage({
  searchParams,
}: {
  searchParams: Promise<{
    targetItem?: string
    targetUser?: string
    targetLoan?: string
    itemName?: string
    userName?: string
    loanLabel?: string
  }>
}) {
  const sp = await searchParams

  const targets: ReportTargets = {
    item: sp.targetItem
      ? { id: sp.targetItem, label: sp.itemName ?? "Item" }
      : null,
    user: sp.targetUser
      ? { id: sp.targetUser, label: sp.userName ?? "Usuário" }
      : null,
    loan: sp.targetLoan
      ? { id: sp.targetLoan, label: sp.loanLabel ?? "Empréstimo" }
      : null,
  }

  return (
    <div className="pb-16 pt-8">
      <div className="mx-auto max-w-2xl px-4 lg:px-0">
        <div className="mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/15 bg-red-50 px-3 py-1">
            <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
            <span className="text-xs font-medium text-red-500">
              Central de denúncias
            </span>
          </div>
          <h1 className="text-[2rem] leading-[1.1] font-semibold tracking-[-0.04em] text-[#182034] lg:text-[2.5rem]">
            Reportar um
            <br />
            problema
          </h1>
          <p className="text-[#5d6678]">
            Algo fora do lugar? Conte o que aconteceu e nossa equipe analisa cada
            caso com cuidado e sigilo.
          </p>
        </div>

        <ReportForm targets={targets} />
      </div>
    </div>
  )
}
