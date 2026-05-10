import { getMe } from "@/lib/api"
import { AppHeader } from "@/components/app-header"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getMe()

  return (
    <div className="min-h-svh bg-white">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-7xl lg:px-6">
        {children}
      </main>
    </div>
  )
}
