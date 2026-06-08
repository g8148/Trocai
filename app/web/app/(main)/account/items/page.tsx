import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { getItems, getMe } from "@/lib/api"
import { AccountItemsSection } from "@/components/account-items-section"

export default async function AccountItemsPage() {
  const user = await getMe()
  if (!user) return null

  const ownItems = await getItems(undefined, undefined, "me")

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-12">
      <div className="mb-5">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-sm text-[#5d6678] transition hover:text-[#182034]"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar para minha conta
        </Link>
      </div>

      <div className="mb-6 space-y-1">
        <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[#8a92a3]">
          Painel de itens
        </p>
        <h1 className="text-2xl font-semibold tracking-[-0.05em] text-[#182034]">
          Meus itens
        </h1>
        <p className="text-sm text-[#5d6678]">
          Veja seus produtos cadastrados e publique novos anuncios.
        </p>
      </div>

      <AccountItemsSection
        items={ownItems}
        title={`${ownItems.length} ${ownItems.length === 1 ? "item cadastrado" : "itens cadastrados"}`}
      />
    </div>
  )
}
