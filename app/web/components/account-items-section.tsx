import type { CategoryGroup, ItemSummary } from "@/lib/api"
import { AccountItemControls } from "@/components/account-item-controls"
import { ItemDialogButton } from "@/components/item-dialog-button"
import { ItemCard } from "@/components/item-card"

export function AccountItemsSection({
  items,
  categories,
  title = "Meus itens",
  description,
}: {
  items: ItemSummary[]
  categories: CategoryGroup[]
  title?: string
  description?: string
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-[#182034]">{title}</h2>
          {description ? (
            <p className="text-sm text-[#8a92a3]">{description}</p>
          ) : null}
        </div>
        <ItemDialogButton
          categories={categories}
          label="Adicionar item"
          icon="package-plus"
          appearance="pill"
        />
      </div>

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="space-y-2">
              <AccountItemControls item={item} categories={categories} />
              <ItemCard item={item} href={`/items/${item.id}`} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-black/10 bg-[#f7f8fb] px-5 py-8 text-center">
          <p className="text-base font-medium text-[#182034]">
            Você ainda não publicou nenhum item.
          </p>
          <p className="mt-1 text-sm text-[#8a92a3]">
            Crie seu primeiro anúncio para aparecer no catálogo.
          </p>
        </div>
      )}
    </section>
  )
}
