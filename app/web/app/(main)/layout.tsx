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
    <div className="relative flex min-h-svh flex-col">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-[1180px] flex-1 lg:px-6">
        {children}
      </main>
      <Footer />
    </div>
  )
}
