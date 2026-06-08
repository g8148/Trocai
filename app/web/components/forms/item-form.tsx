"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState, useTransition } from "react"
import { ChevronLeft, Link2, Plus, X } from "lucide-react"

import { createItemAction, updateItemAction } from "@/lib/app-actions"
import type { CategoryGroup, ItemSummary } from "@/lib/api"
import { SuccessDialog } from "@/components/success-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ItemFormProps {
  item?: ItemSummary
  categories: CategoryGroup[]
  isEditing?: boolean
}

interface SubcategoryOption {
  id: string
  name: string
}

function getInitialCategoryId(
  categories: CategoryGroup[],
  subcategoryId: string | null | undefined
) {
  if (!subcategoryId) {
    return ""
  }

  return (
    categories.find((category) =>
      category.subcategories.some((subcategory) => subcategory.id === subcategoryId)
    )?.id ?? ""
  )
}

export function ItemForm({
  item,
  categories,
  isEditing = false,
}: ItemFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initialCategoryId = useMemo(
    () => getInitialCategoryId(categories, item?.subcategory),
    [categories, item?.subcategory]
  )

  const [name, setName] = useState(item?.name ?? "")
  const [description, setDescription] = useState(item?.description ?? "")
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId)
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(
    item?.subcategory ?? ""
  )
  const [condition, setCondition] = useState(item?.condition ?? "good")
  const [segregation, setSegregation] = useState(item?.segregation ?? "hobby")
  const [allowReservation, setAllowReservation] = useState(
    item?.allow_reservation ?? true
  )
  const [estimatedValue, setEstimatedValue] = useState(
    item?.estimated_value ?? ""
  )
  const [imageUrls, setImageUrls] = useState<string[]>(
    item?.images?.map((image) => image.image) ?? [""]
  )
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([])

  useEffect(() => {
    if (initialCategoryId) {
      setSelectedCategoryId(initialCategoryId)
    }
  }, [initialCategoryId])

  useEffect(() => {
    if (item?.subcategory) {
      setSelectedSubcategoryId(item.subcategory)
    }
  }, [item?.subcategory])

  useEffect(() => {
    const category = categories.find(
      (currentCategory) => currentCategory.id === selectedCategoryId
    )

    if (!category) {
      setSubcategories([])
      return
    }

    setSubcategories(category.subcategories)

    if (
      !selectedSubcategoryId ||
      !category.subcategories.some(
        (subcategory) => subcategory.id === selectedSubcategoryId
      )
    ) {
      setSelectedSubcategoryId(category.subcategories[0]?.id ?? "")
    }
  }, [categories, selectedCategoryId, selectedSubcategoryId])

  const updateImageUrl = (index: number, value: string) => {
    setImageUrls((current) =>
      current.map((currentUrl, currentIndex) =>
        currentIndex === index ? value : currentUrl
      )
    )
  }

  const addImageField = () => {
    setImageUrls((current) => [...current, ""])
  }

  const removeImageField = (index: number) => {
    setImageUrls((current) => {
      const next = current.filter((_, currentIndex) => currentIndex !== index)
      return next.length > 0 ? next : [""]
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("Nome do item e obrigatorio.")
      return
    }

    if (!description.trim()) {
      setError("Descricao e obrigatoria.")
      return
    }

    if (!selectedCategoryId || !selectedSubcategoryId) {
      setError("Selecione a categoria e a subcategoria.")
      return
    }

    const cleanedImageUrls = imageUrls.map((url) => url.trim()).filter(Boolean)

    startTransition(async () => {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        subcategory: selectedSubcategoryId,
        condition,
        segregation,
        allow_reservation: allowReservation,
        estimated_value: estimatedValue.trim() || null,
        image_urls: cleanedImageUrls,
      }

      const result =
        isEditing && item
          ? await updateItemAction(item.id, payload)
          : await createItemAction(payload)

      if (!result.ok) {
        setError(result.error ?? "Erro ao salvar item.")
        return
      }

      setShowSuccess(true)
    })
  }

  const handleSuccessClose = () => {
    setShowSuccess(false)

    if (isEditing && item) {
      router.push(`/items/${item.id}`)
      return
    }

    router.push("/account")
  }

  const pageTitle = isEditing ? "Editar item" : "Novo item"
  const buttonLabel = isEditing ? "Salvar alteracoes" : "Criar item"
  const successTitle = isEditing ? "Item atualizado" : "Item criado"
  const successDescription = isEditing
    ? "Seu item foi atualizado com sucesso."
    : "Seu item ja esta disponivel no catalogo."

  return (
    <>
      <div className="pb-8">
        <div className="flex items-center gap-2 px-4 pb-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#5d6678] transition hover:bg-black/5"
          >
            <ChevronLeft size={18} />
            <span className="sr-only">Voltar</span>
          </button>
          <p className="text-base font-semibold text-[#182034]">{pageTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-5 pb-8 pt-6">
          <p className="text-sm text-[#5d6678]">* Campos obrigatorios</p>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#182034]">
              Nome *
            </label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Furadeira de impacto"
              className="h-12 rounded-2xl border-black/10 px-4 text-base"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#182034]">
              Descricao *
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Descreva o item, condicao e detalhes de uso."
              className="min-h-[120px] w-full rounded-[24px] border border-black/10 px-4 py-3 text-base outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#182034]">
                Categoria *
              </label>
              <select
                value={selectedCategoryId}
                onChange={(event) => setSelectedCategoryId(event.target.value)}
                className="h-12 w-full rounded-2xl border border-black/10 px-4 text-base text-[#182034]"
              >
                <option value="">Selecione...</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#182034]">
                Subcategoria *
              </label>
              <select
                value={selectedSubcategoryId}
                onChange={(event) => setSelectedSubcategoryId(event.target.value)}
                className="h-12 w-full rounded-2xl border border-black/10 px-4 text-base text-[#182034]"
              >
                <option value="">Selecione...</option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#182034]">
                Condicao *
              </label>
              <select
                value={condition}
                onChange={(event) => setCondition(event.target.value)}
                className="h-12 w-full rounded-2xl border border-black/10 px-4 text-base text-[#182034]"
              >
                <option value="new">Novo</option>
                <option value="good">Bom estado</option>
                <option value="used">Usado</option>
                <option value="worn">Desgastado</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#182034]">
                Segregacao *
              </label>
              <select
                value={segregation}
                onChange={(event) => setSegregation(event.target.value)}
                className="h-12 w-full rounded-2xl border border-black/10 px-4 text-base text-[#182034]"
              >
                <option value="hobby">Hobby</option>
                <option value="semi_professional">Semi profissional</option>
                <option value="professional">Profissional</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#182034]">
              Valor estimado
            </label>
            <Input
              value={estimatedValue}
              onChange={(event) => setEstimatedValue(event.target.value)}
              inputMode="decimal"
              placeholder="Ex: 99.90"
              className="h-12 rounded-2xl border-black/10 px-4 text-base"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-3 rounded-2xl border border-black/8 bg-[#fafbfc] px-4 py-3">
              <input
                type="checkbox"
                checked={allowReservation}
                onChange={(event) => setAllowReservation(event.target.checked)}
                className="h-5 w-5 rounded border-black/10 text-[#2fb1c2]"
              />
              <span className="text-sm font-medium text-[#182034]">
                Permitir reservas
              </span>
            </label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-[#182034]">
                Fotos
              </label>
              <button
                type="button"
                onClick={addImageField}
                className="inline-flex items-center gap-1 rounded-full border border-black/8 px-3 py-1 text-xs font-medium text-[#182034] transition hover:bg-black/5"
              >
                <Plus size={14} />
                Adicionar
              </button>
            </div>

            <div className="space-y-3 rounded-[24px] border border-black/10 bg-[#fafbfc] p-4">
              {imageUrls.map((imageUrl, index) => (
                <div
                  key={`${index}-${imageUrl}`}
                  className="space-y-2 rounded-[20px] border border-black/6 bg-white p-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edfafe] text-[#2fb1c2]">
                      <Link2 size={16} />
                    </div>
                    <Input
                      value={imageUrl}
                      onChange={(event) =>
                        updateImageUrl(index, event.target.value)
                      }
                      placeholder="https://exemplo.com/foto.jpg"
                      className="h-11 rounded-2xl border-black/10 px-4 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/5 text-[#5d6678] transition hover:bg-black/10"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {imageUrl.trim() ? (
                    <img
                      src={imageUrl}
                      alt={`Preview ${index + 1}`}
                      className="h-28 w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-28 items-center justify-center rounded-2xl border border-dashed border-black/8 bg-[linear-gradient(145deg,#f4f5f7_0%,#eceeef_38%,#ffffff_100%)] text-xs text-[#8a92a3]">
                      Cole um link de imagem para visualizar
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-[#8a92a3]">
              O backend atual salva as imagens a partir de links.
            </p>
          </div>

          {error ? (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={isPending}
            className="h-14 w-full rounded-2xl bg-[#10182c] text-base font-semibold"
          >
            {isPending ? "Salvando..." : buttonLabel}
          </Button>
        </form>
      </div>

      <SuccessDialog
        open={showSuccess}
        onOpenChange={handleSuccessClose}
        title={successTitle}
        description={successDescription}
      />
    </>
  )
}
