import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { ConfirmReservation } from "@/components/forms/confirm-reservation"

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
      <div className="flex items-center gap-2 px-4 pb-3 pt-4">
        <Link
          href={`/items/${id}/reserve`}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#5d6678] transition hover:bg-black/5"
        >
          <ChevronLeft size={18} />
          <span className="sr-only">Voltar</span>
        </Link>
        <p className="text-base font-semibold text-[#182034]">Confirmar agendamento</p>
      </div>
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
