import Link from "next/link"

import { getCategories, getItems, getMe } from "@/lib/api"
import { AccountItemsSection } from "@/components/account-items-section"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default async function AccountItemsPage() {
  const user = await getMe()
  if (!user) return null

  const [ownItems, categories] = await Promise.all([
    getItems(undefined, undefined, "me"),
    getCategories(),
  ])

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-12">
      <div className="mb-5">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/account">Minha conta</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Meus itens</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mb-6 space-y-1">
        <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[#8a92a3]">
          Painel de itens
        </p>
        <h1 className="text-2xl font-semibold tracking-[-0.05em] text-[#182034]">
          Meus itens
        </h1>
        <p className="text-sm text-[#5d6678]">
          Veja seus produtos cadastrados e publique novos anúncios.
        </p>
      </div>

      <AccountItemsSection
        items={ownItems}
        categories={categories}
        title={`${ownItems.length} ${ownItems.length === 1 ? "item cadastrado" : "itens cadastrados"}`}
      />
    </div>
  )
}
