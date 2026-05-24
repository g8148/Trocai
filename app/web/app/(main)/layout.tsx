import { getMe } from "@/lib/api"
import { AppHeader } from "@/components/app-header"
import { Footer } from "@/components/footer"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getMe()

  return (
    <div className="flex min-h-svh flex-col bg-white">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-7xl flex-1 lg:px-6">
        {children}
      </main>
      <Footer />
    </div>
  )
}
