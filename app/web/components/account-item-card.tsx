"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { ImageOff, MoreVertical, SquarePen, Trash2 } from "lucide-react"

import { deleteItemAction, updateItemReservationAction } from "@/lib/app-actions"
import type { CategoryGroup, ItemSummary } from "@/lib/api"
import { getItemPrimaryImage } from "@/lib/item-visuals"
import { cn } from "@/lib/utils"
import { ItemFormDialogShadcn } from "@/components/item-form-dialog-shadcn"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

const AVAILABILITY_STATUS: Record<
  string,
  { label: string; className: string }
> = {
  available: {
    label: "Disponível",
    className: "bg-emerald-500/10 text-emerald-700",
  },
  borrowed: {
    label: "Emprestado",
    className: "bg-amber-500/10 text-amber-700",
  },
  reserved: {
    label: "Reservado",
    className: "bg-sky-500/10 text-sky-700",
  },
  unavailable: {
    label: "Indisponível",
    className: "bg-muted text-muted-foreground",
  },
}

function formatCurrency(value: string | null) {
  if (!value) return null
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return value
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numeric)
}

export function AccountItemCard({
  item,
  categories,
}: {
  item: ItemSummary
  categories: CategoryGroup[]
}) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const href = `/items/${item.id}`
  const image = getItemPrimaryImage(item)
  const price = formatCurrency(item.estimated_value)
  const status =
    AVAILABILITY_STATUS[item.availability] ?? AVAILABILITY_STATUS.available

  const handleReservationToggle = (checked: boolean) => {
    startTransition(async () => {
      setFeedback(null)
      const result = await updateItemReservationAction(item.id, checked)

      if (!result.ok) {
        setFeedback(result.error ?? "Não foi possível atualizar as reservas.")
        return
      }

      router.refresh()
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      setFeedback(null)
      const result = await deleteItemAction(item.id)

      if (!result.ok) {
        setFeedback(result.error ?? "Não foi possível excluir o item.")
        return
      }

      setDeleteOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <article className="rounded-2xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4">
        <div className="flex gap-3 sm:gap-4">
          <Link
            href={href}
            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-24 sm:w-24"
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ImageOff className="h-5 w-5" />
              </div>
            )}
          </Link>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={href}
                  className="block truncate text-base font-semibold text-foreground hover:underline sm:text-lg"
                >
                  {item.name}
                </Link>
                <p className="truncate text-sm text-muted-foreground">
                  {item.category_name ?? "Sem categoria"}
                  {item.subcategory_name ? ` · ${item.subcategory_name}` : ""}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="-mr-1 shrink-0"
                    aria-label="Ações do item"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault()
                      setEditOpen(true)
                    }}
                  >
                    <SquarePen className="h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={(event) => {
                      event.preventDefault()
                      setDeleteOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="mt-1.5 text-sm font-medium">
              {price ? (
                <span className="text-foreground">{price}</span>
              ) : (
                <span className="text-primary">Empréstimo gratuito</span>
              )}
            </p>
          </div>
        </div>

        <Separator className="my-3" />

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2">
            <Switch
              checked={item.allow_reservation}
              onCheckedChange={handleReservationToggle}
              disabled={isPending}
              aria-label="Permitir reservas"
            />
            <span className="text-sm text-muted-foreground">
              {item.allow_reservation ? "Reservas ativas" : "Reservas pausadas"}
            </span>
          </label>

          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
              status.className
            )}
          >
            {status.label}
          </span>
        </div>

        {feedback ? (
          <p className="mt-2 text-xs text-destructive">{feedback}</p>
        ) : null}
      </article>

      <ItemFormDialogShadcn
        categories={categories}
        item={item}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir item?</AlertDialogTitle>
            <AlertDialogDescription>
              O item será removido do catálogo, mas permanecerá guardado no
              histórico com exclusão lógica.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {feedback ? (
            <p className="text-sm text-destructive">{feedback}</p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Excluindo..." : "Excluir item"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
