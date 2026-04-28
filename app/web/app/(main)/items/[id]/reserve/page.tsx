import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { ReserveForm } from "@/components/forms/reserve-form"

export default async function ReservePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="pb-8">
      <div className="flex items-center gap-2 px-4 pb-3 pt-4">
        <Link
          href={`/items/${id}`}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#5d6678] transition hover:bg-black/5"
        >
          <ChevronLeft size={18} />
          <span className="sr-only">Voltar</span>
        </Link>
        <p className="text-base font-semibold text-[#182034]">Reservar item</p>
      </div>
      <ReserveForm itemId={id} />
    </div>
  )
}
