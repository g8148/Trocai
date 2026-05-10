import Link from "next/link"

import { getMe } from "@/lib/api"
import { ProfileForm } from "@/components/forms/profile-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default async function ProfilePage() {
  const user = await getMe()
  if (!user) return null

  return (
    <div className="pb-24 lg:pb-10">
      <div className="px-4 pt-4 pb-5 lg:px-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/account">Conta</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Editar perfil</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <ProfileForm user={user} />
    </div>
  )
}
