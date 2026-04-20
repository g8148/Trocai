import { getLoans } from "@/lib/api"
import { MobileHeader } from "@/components/mobile-header"
import { ReviewForm } from "@/components/forms/review-form"

export default async function NewReviewPage() {
  const loans = await getLoans()

  return (
    <div className="pb-8">
      <MobileHeader title="Avaliacao" backHref="/account" />
      <ReviewForm loans={loans} />
    </div>
  )
}
