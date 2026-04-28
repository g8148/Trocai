import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { getLoans } from "@/lib/api"
import { ReviewForm } from "@/components/forms/review-form"

export default async function NewReviewPage() {
  const loans = await getLoans()

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
        <p className="text-base font-semibold text-[#182034]">Avaliar empréstimo</p>
      </div>
      <ReviewForm loans={loans} />
    </div>
  )
}
