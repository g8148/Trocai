import { ReserveForm } from "@/components/forms/reserve-form"

export default async function ReservePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="pb-16 pt-10">
      <div className="mx-auto max-w-lg px-4 lg:px-0">
        <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-widest text-[#2fb1c2]">
          Reserva · Etapa 1 de 2
        </p>
        <ReserveForm itemId={id} />
      </div>
    </div>
  )
}
