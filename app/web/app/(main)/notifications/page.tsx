import { getNotifications } from "@/lib/api"
import { MobileHeader } from "@/components/mobile-header"

export default async function NotificationsPage() {
  const notifications = await getNotifications()

  return (
    <div className="min-h-full pb-8">
      <MobileHeader title="Usuario" backHref="/" />
      <div className="px-8 py-12">
        {notifications.length === 0 ? (
          <div className="space-y-8 text-[#182034]">
            <h2 className="text-[3.5rem] font-medium leading-[0.95] tracking-[-0.08em]">
              Nenhuma nova notificacao.
            </h2>
            <p className="text-[3.2rem] leading-[0.95] tracking-[-0.08em]">
              Voltamos a avisar quando houver novidades!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="rounded-[28px] border border-black/6 bg-white p-5 shadow-[0_18px_40px_rgba(17,24,39,0.06)]"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-[#2fb1c2]">
                  {notification.type}
                </p>
                <h2 className="mt-2 text-[1.4rem] font-semibold tracking-[-0.04em] text-[#182034]">
                  {notification.title}
                </h2>
                <p className="mt-2 text-[1rem] leading-6 text-[#5d6678]">
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
