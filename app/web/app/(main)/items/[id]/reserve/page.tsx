import { MobileHeader } from "@/components/mobile-header"
import { ReserveForm } from "@/components/forms/reserve-form"

export default async function ReservePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="pb-8">
      <MobileHeader title="Reserva" backHref={`/items/${id}`} />
      <ReserveForm itemId={id} />
    </div>
  )
}
