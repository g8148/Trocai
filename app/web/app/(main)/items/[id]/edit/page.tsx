import { notFound, redirect } from "next/navigation"

import { getCategories, getItem, getMe } from "@/lib/api"
import { ItemForm } from "@/components/forms/item-form"

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const item = await getItem(id)
  const user = await getMe()

  if (!item) notFound()
  if (!user) {
    redirect("/login")
  }
  if (item.owner.id !== user.id) {
    return notFound()
  }

  const categories = await getCategories()

  return <ItemForm item={item} categories={categories} isEditing />
}
