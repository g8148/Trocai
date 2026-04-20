import { getMe } from "@/lib/api"
import { DistanceForm } from "@/components/forms/distance-form"
import { MobileHeader } from "@/components/mobile-header"

export default async function DistancePage() {
  const user = await getMe()

  if (!user) {
    return null
  }

  return (
    <div className="pb-8">
      <MobileHeader title="Distancia" backHref="/account" />
      <DistanceForm user={user} />
    </div>
  )
}
