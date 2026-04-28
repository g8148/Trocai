import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { getMe } from "@/lib/api"
import { DistanceForm } from "@/components/forms/distance-form"

export default async function DistancePage() {
  const user = await getMe()

  if (!user) return null

  return (
    <div className="pb-8">
      <div className="flex items-center gap-2 px-4 pb-3 pt-4">
        <Link
          href="/account"
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#5d6678] transition hover:bg-black/5"
        >
          <ChevronLeft size={18} />
          <span className="sr-only">Voltar</span>
        </Link>
        <p className="text-base font-semibold text-[#182034]">Distância de busca</p>
      </div>
      <DistanceForm user={user} />
    </div>
  )
}
