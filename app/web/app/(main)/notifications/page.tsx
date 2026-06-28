import { Bell } from "lucide-react"

import { getNotifications } from "@/lib/api"

const TYPE_LABELS: Record<string, string> = {
  loan_request: "Solicitação de empréstimo",
  loan_approved: "Empréstimo aprovado",
  loan_rejected: "Solicitação recusada",
  return_reminder: "Devolução",
  return_overdue: "Devolução em atraso",
  reservation: "Nova reserva",
  new_message: "Nova mensagem",
  review: "Nova avaliação",
  system: "Sistema",
}

export default async function NotificationsPage() {
  const notifications = await getNotifications()

  return (
    <div className="pb-16 pt-8">
      <div className="mx-auto max-w-2xl px-4 lg:px-0">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight text-[#182034]">
          Notificações
        </h1>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[24px] border border-black/5 bg-white px-4 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ebebea]">
              <Bell className="h-7 w-7 text-[#8a92a3]" />
            </div>
            <p className="text-base font-medium text-[#182034]">Nenhuma notificação</p>
            <p className="text-sm text-[#5d6678]">Avisaremos quando houver novidades.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="rounded-2xl border border-black/6 bg-white p-4"
              >
                <p className="text-xs font-medium uppercase tracking-widest text-[#2fb1c2]">
                  {TYPE_LABELS[notification.type] ?? notification.type}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#182034]">
                  {notification.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
