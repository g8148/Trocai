"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { MoreVertical, SquarePen, Trash2 } from "lucide-react"

import { deleteItemAction, updateItemReservationAction } from "@/lib/app-actions"
import type { CategoryGroup, ItemSummary } from "@/lib/api"
import { ItemFormDialog } from "@/components/item-form-dialog"
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
import { Switch } from "@/components/ui/switch"

export function AccountItemControls({
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
      <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Switch
              checked={item.allow_reservation}
              onCheckedChange={handleReservationToggle}
              disabled={isPending}
              aria-label="Permitir reservas"
            />
            <span className="text-sm font-medium text-foreground">
              Permitir reservas
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Desative para pausar novas reservas sem editar o cadastro.
          </p>
          {feedback ? (
            <p className="text-xs text-destructive">{feedback}</p>
          ) : null}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0"
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

      <ItemFormDialog
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
              O item será removido do catálogo, mas permanecerá guardado no histórico com exclusão lógica.
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
