import { ConfirmReservation } from "@/components/forms/confirm-reservation"
import { MobileHeader } from "@/components/mobile-header"

export default async function ConfirmReservationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    pickupDate?: string
    pickupTime?: string
    period?: string
    displayDate?: string
  }>
}) {
  const { id } = await params
  const {
    pickupDate = "2026-06-17",
    pickupTime = "09:30",
    period = "AM",
    displayDate = "17 de junho de 2026",
  } = await searchParams

  return (
    <div className="pb-8">
      <MobileHeader title="Detalhes do Agendamento" backHref={`/items/${id}/reserve`} />
      <ConfirmReservation
        itemId={id}
        pickupDate={pickupDate}
        pickupTime={pickupTime}
        period={period}
        displayDate={displayDate}
      />
    </div>
  )
}
