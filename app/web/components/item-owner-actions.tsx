"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { PencilLine, Trash2 } from "lucide-react"

import { deleteItemAction } from "@/lib/app-actions"
import type { CategoryGroup, ItemSummary } from "@/lib/api"
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

interface ItemOwnerActionsProps {
  item: ItemSummary
  categories: CategoryGroup[]
  isOwner: boolean
}

export function ItemOwnerActions({
  item,
  categories,
  isOwner,
}: ItemOwnerActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  if (!isOwner) {
    return null
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteItemAction(item.id)

      if (!result.ok) {
        setDeleteError(result.error ?? "Erro ao excluir o item.")
        return
      }

      setDeleteOpen(false)
      router.push("/account/items")
      router.refresh()
    })
  }

  return (
    <>
      <div className="flex gap-2 lg:flex-col">
        <Button
          type="button"
          onClick={() => setEditOpen(true)}
          className="h-12 flex-1 rounded-2xl bg-[#2fb1c2] px-4 text-sm font-semibold text-white hover:bg-[#2aa0b0] lg:h-14 lg:w-full"
        >
          <span className="inline-flex items-center gap-2">
            <PencilLine size={16} />
            Editar
          </span>
        </Button>

        <Button
          type="button"
          variant="destructive"
          onClick={() => setDeleteOpen(true)}
          disabled={isPending}
          className="h-12 flex-1 rounded-2xl lg:h-14 lg:w-full"
        >
          <span className="inline-flex items-center gap-2">
            <Trash2 size={16} />
            Excluir
          </span>
        </Button>
      </div>

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
              O item será removido do catálogo público, mas continuará salvo no histórico com exclusão lógica.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError ? (
            <p className="text-sm text-destructive">{deleteError}</p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isPending}
              onClick={() => setDeleteError(null)}
            >
              Cancelar
            </AlertDialogCancel>
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
