import { getMe } from "@/lib/api"
import { AccountMenu } from "@/components/account-menu"
import { MobileHeader } from "@/components/mobile-header"

export default async function AccountPage() {
  const user = await getMe()

  if (!user) {
    return null
  }

  return (
    <div className="pb-8">
      <MobileHeader title="" backHref="/" />
      <AccountMenu user={user} />
    </div>
  )
}
