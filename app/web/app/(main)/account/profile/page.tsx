import { getMe } from "@/lib/api"
import { ProfileForm } from "@/components/forms/profile-form"
import { MobileHeader } from "@/components/mobile-header"

export default async function ProfilePage() {
  const user = await getMe()

  if (!user) {
    return null
  }

  return (
    <div className="pb-8">
      <MobileHeader title="Meus Dados" backHref="/account" />
      <ProfileForm user={user} />
    </div>
  )
}
