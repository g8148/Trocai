import { redirect } from "next/navigation"

import { getCategories, getMe } from "@/lib/api"
import { ItemForm } from "@/components/forms/item-form"

export default async function NewItemPage() {
  const user = await getMe()

  if (!user) {
    redirect("/login")
  }

  const categories = await getCategories()

  return <ItemForm categories={categories} />
}
