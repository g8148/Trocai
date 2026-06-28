import { Star } from "lucide-react"

import { getLoans } from "@/lib/api"
import { ReviewForm } from "@/components/forms/review-form"

export default async function NewReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ loan?: string }>
}) {
  const { loan } = await searchParams
  const loans = await getLoans()

  return (
    <div className="pb-16 pt-8">
      <div className="mx-auto max-w-2xl px-4 lg:px-0">
        <div className="mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ff8b2c]/20 bg-[#fff5ec] px-3 py-1">
            <Star className="h-3.5 w-3.5 text-[#ff8b2c]" />
            <span className="text-xs font-medium text-[#ff8b2c]">Avaliação</span>
          </div>
          <h1 className="text-[2rem] leading-[1.1] font-semibold tracking-[-0.04em] text-[#182034] lg:text-[2.5rem]">
            Avalie seu
            <br />
            empréstimo
          </h1>
          <p className="text-[#5d6678]">
            Sua avaliação ajuda a comunidade a confiar em quem empresta e em quem
            pega emprestado.
          </p>
        </div>

        <ReviewForm loans={loans} preselectedLoanId={loan} />
      </div>
    </div>
  )
}
