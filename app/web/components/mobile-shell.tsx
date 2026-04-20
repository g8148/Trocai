import type { AppUser } from "@/lib/api"

import { MobileBottomNav } from "@/components/mobile-bottom-nav"

export function MobileShell({
  children,
  user,
}: {
  children: React.ReactNode
  user: AppUser | null
}) {
  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_top,_rgba(47,177,194,0.15),_transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef3fb_100%)] px-0 md:px-6 md:py-6">
      <div className="mx-auto flex min-h-svh max-w-[430px] flex-col overflow-hidden bg-white shadow-[0_18px_60px_rgba(17,24,39,0.12)] md:min-h-[920px] md:rounded-[36px] md:ring-1 md:ring-black/5">
        <main className="flex-1">{children}</main>
        {user ? <MobileBottomNav /> : null}
      </div>
    </div>
  )
}
