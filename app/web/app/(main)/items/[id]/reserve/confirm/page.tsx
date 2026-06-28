import { ConfirmReservation } from "@/components/forms/confirm-reservation"

export default async function ConfirmReservationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    pickupDate?: string
    pickupTime?: string
    returnDate?: string
  }>
}) {
  const { id } = await params
  const {
    pickupDate = "",
    pickupTime = "09:00",
    returnDate = "",
  } = await searchParams

  const displayDate = pickupDate
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(`${pickupDate}T12:00:00`))
    : ""

  return (
    <div className="pb-16 pt-10">
      <div className="mx-auto max-w-lg px-4 lg:px-0">
        <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-widest text-[#2fb1c2]">
          Reserva · Etapa 2 de 2
        </p>
        <ConfirmReservation
          itemId={id}
          pickupDate={pickupDate}
          pickupTime={pickupTime}
          returnDate={returnDate}
          displayDate={displayDate}
        />
      </div>
    </div>
  )
}
