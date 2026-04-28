import type { AppUser } from "@/lib/api"

import { AppHeader } from "@/components/app-header"

export function MobileShell({
  children,
  user,
}: {
  children: React.ReactNode
  user: AppUser | null
}) {
  return (
    <div className="min-h-svh bg-white">
      <AppHeader user={user} />
      <main>{children}</main>
    </div>
  )
}
