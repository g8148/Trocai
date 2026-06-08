import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/auth"
import { getCategories } from "@/lib/api"
import { ItemForm } from "@/components/forms/item-form"

export default async function NewItemPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const categories = await getCategories()

  return <ItemForm categories={categories} />
}
