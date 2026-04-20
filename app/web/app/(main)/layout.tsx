import { getMe } from "@/lib/api"
import { MobileShell } from "@/components/mobile-shell"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getMe()

  return <MobileShell user={user}>{children}</MobileShell>
}
