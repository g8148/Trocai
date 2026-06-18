export const LOAN_STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-amber-50 text-amber-700" },
  approved: { label: "Aprovado", className: "bg-blue-50 text-blue-700" },
  in_progress: { label: "Em andamento", className: "bg-teal-50 text-teal-700" },
  returned: { label: "Devolvido", className: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Rejeitado", className: "bg-red-50 text-red-700" },
  cancelled: { label: "Cancelado", className: "bg-gray-100 text-gray-600" },
  overdue: { label: "Atrasado", className: "bg-red-50 text-red-700" },
  disputed: { label: "Em disputa", className: "bg-red-50 text-red-700" },
}

const TERMINAL = new Set(["returned", "rejected", "cancelled"])

export function isTerminalLoan(status: string) {
  return TERMINAL.has(status)
}

export function loanStatusInfo(status: string) {
  return (
    LOAN_STATUS[status] ?? { label: status, className: "bg-gray-100 text-gray-600" }
  )
}

export function formatLoanDate(value: string | null) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}
