import { getCurrentUser } from "@/lib/auth"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <>
      <Navbar user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
