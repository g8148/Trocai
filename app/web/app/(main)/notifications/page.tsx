import { Bell } from "lucide-react"

import { getNotifications } from "@/lib/api"

const TYPE_LABELS: Record<string, string> = {
  solicitacao: "Solicitação",
  aprovacao: "Aprovação",
  rejeicao: "Rejeição",
  lembrete_devolucao: "Devolução",
  atraso: "Atraso",
  reserva_disponivel: "Reserva disponível",
}

export default async function NotificationsPage() {
  const notifications = await getNotifications()

  return (
    <div className="pb-8">
      <div className="px-4 pb-3 pt-5">
        <h1 className="text-xl font-semibold tracking-tight text-[#182034]">
          Notificações
        </h1>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-4 pt-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ebebea]">
            <Bell className="h-7 w-7 text-[#8a92a3]" />
          </div>
          <p className="text-base font-medium text-[#182034]">Nenhuma notificação</p>
          <p className="text-sm text-[#5d6678]">Avisaremos quando houver novidades.</p>
        </div>
      ) : (
        <div className="space-y-2 px-4">
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
  )
}
