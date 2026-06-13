"use client"

import { useState } from "react"
import { PackagePlus } from "lucide-react"

import type { CategoryGroup, ItemSummary } from "@/lib/api"
import { ItemFormDialogShadcn } from "@/components/item-form-dialog-shadcn"

type ItemDialogButtonAppearance = "action-card" | "pill" | "primary"
type ItemDialogButtonIcon = "package-plus"

interface ItemDialogButtonProps {
  categories: CategoryGroup[]
  item?: ItemSummary
  label: string
  description?: string
  icon?: ItemDialogButtonIcon
  appearance?: ItemDialogButtonAppearance
  className?: string
}

const APPEARANCE_CLASSNAMES: Record<ItemDialogButtonAppearance, string> = {
  "action-card":
    "flex w-full items-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5 text-left transition-colors hover:bg-muted/60",
  pill:
    "inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/60",
  primary:
    "inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90",
}

const ICONS: Record<ItemDialogButtonIcon, typeof PackagePlus> = {
  "package-plus": PackagePlus,
}

export function ItemDialogButton({
  categories,
  item,
  label,
  description,
  icon,
  appearance = "pill",
  className = "",
}: ItemDialogButtonProps) {
  const [open, setOpen] = useState(false)
  const ButtonIcon = icon ? ICONS[icon] : null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${APPEARANCE_CLASSNAMES[appearance]} ${className}`.trim()}
      >
        {ButtonIcon ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <ButtonIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </button>

      <ItemFormDialogShadcn
        categories={categories}
        item={item}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
