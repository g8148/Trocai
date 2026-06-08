"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState, useTransition } from "react"
import { ChevronLeft, ImagePlus, Link2, Plus, X } from "lucide-react"

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

type ItemType = "tool" | "service"

type DemoImageOption = {
  path: string
  label: string
  type: ItemType
  keywords: string[]
}

const ITEM_TYPE_OPTIONS: Array<{ value: ItemType; label: string }> = [
  { value: "tool", label: "Ferramenta" },
  { value: "service", label: "Servico" },
]

const CONDITION_OPTIONS = [
  { value: "new", label: "Novo" },
  { value: "good", label: "Bom estado" },
  { value: "used", label: "Usado" },
  { value: "worn", label: "Desgastado" },
] as const

const SEGREGATION_OPTIONS = [
  { value: "hobby", label: "Hobby" },
  { value: "semi_professional", label: "Semi profissional" },
  { value: "professional", label: "Profissional" },
] as const

const DEMO_IMAGE_OPTIONS: DemoImageOption[] = [
  {
    path: "/demo-items/furadeira-bosch-usada.png",
    label: "Furadeira usada",
    type: "tool",
    keywords: ["furadeira", "parafusadeira", "bosch"],
  },
  {
    path: "/demo-items/chave-fenda-usada.png",
    label: "Chave de fenda",
    type: "tool",
    keywords: ["chave", "fenda", "philips"],
  },
  {
    path: "/demo-items/martelo-usado.png",
    label: "Martelo usado",
    type: "tool",
    keywords: ["martelo", "mk2"],
  },
  {
    path: "/demo-items/marreta-demolicao-usada.png",
    label: "Marreta de demolicao",
    type: "tool",
    keywords: ["marreta", "demolidor", "martelete", "demolicao"],
  },
  {
    path: "/demo-items/esmerilhadeira-usada.png",
    label: "Esmerilhadeira",
    type: "tool",
    keywords: ["esmerilhadeira", "grinder"],
  },
  {
    path: "/demo-items/escada-extensivel-usada.png",
    label: "Escada extensivel",
    type: "tool",
    keywords: ["escada", "andaime", "altura"],
  },
  {
    path: "/demo-items/pintura-residencial.png",
    label: "Servico residencial",
    type: "service",
    keywords: ["pintura", "servico", "instalacao", "hidraulica", "domestico"],
  },
]

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

function normalizeEstimatedValueInput(rawValue: string) {
  const trimmed = rawValue.trim()

  if (!trimmed) {
    return { display: "", payload: null as string | null, error: null as string | null }
  }

  let normalized = trimmed.replace(/^R\$\s*/i, "").replace(/\s+/g, "")

  if (normalized.includes(",") && normalized.includes(".")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".")
  } else if (normalized.includes(",")) {
    normalized = normalized.replace(",", ".")
  } else {
    const dotParts = normalized.split(".")
    if (dotParts.length > 2) {
      const decimalPart = dotParts.pop() ?? ""
      normalized = `${dotParts.join("")}.${decimalPart}`
    }
  }

  normalized = normalized.replace(/[^0-9.]/g, "")

  if (!normalized) {
    return {
      display: trimmed,
      payload: null,
      error: "Informe um valor estimado valido.",
    }
  }

  const numericValue = Number(normalized)

  if (Number.isNaN(numericValue)) {
    return {
      display: trimmed,
      payload: null,
      error: "Informe um valor estimado valido.",
    }
  }

  return {
    display: numericValue.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    payload: numericValue.toFixed(2),
    error: null,
  }
}

function buildAbsoluteImageUrl(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value
  }

  if (typeof window === "undefined") {
    return value
  }

  return new URL(value, window.location.origin).toString()
}

function getSuggestionScore(option: DemoImageOption, haystack: string) {
  return option.keywords.reduce(
    (total, keyword) => total + (haystack.includes(keyword) ? 3 : 0),
    0
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

  const initialType: ItemType = item?.category_type === "service" ? "service" : "tool"

  const [selectedType, setSelectedType] = useState<ItemType>(initialType)
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
    item?.estimated_value
      ? Number(item.estimated_value).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : ""
  )
  const [imageUrls, setImageUrls] = useState<string[]>(
    item?.images?.map((image) => image.image) ?? [""]
  )
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([])

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === selectedType),
    [categories, selectedType]
  )

  const selectedCategory = useMemo(
    () =>
      filteredCategories.find((category) => category.id === selectedCategoryId) ?? null,
    [filteredCategories, selectedCategoryId]
  )

  const selectedSubcategory = useMemo(
    () =>
      subcategories.find((subcategory) => subcategory.id === selectedSubcategoryId) ??
      null,
    [subcategories, selectedSubcategoryId]
  )

  const imageSuggestions = useMemo(() => {
    const haystack = [
      name,
      selectedCategory?.name ?? "",
      selectedSubcategory?.name ?? "",
      selectedType,
    ]
      .join(" ")
      .toLowerCase()

    return DEMO_IMAGE_OPTIONS
      .filter((option) => option.type === selectedType)
      .map((option) => ({
        ...option,
        score: getSuggestionScore(option, haystack),
      }))
      .sort((first, second) => second.score - first.score)
      .slice(0, selectedType === "service" ? 1 : 3)
  }, [name, selectedCategory?.name, selectedSubcategory?.name, selectedType])

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
    if (
      selectedCategoryId &&
      !filteredCategories.some((category) => category.id === selectedCategoryId)
    ) {
      setSelectedCategoryId("")
      setSelectedSubcategoryId("")
    }
  }, [filteredCategories, selectedCategoryId])

  useEffect(() => {
    const category = filteredCategories.find(
      (currentCategory) => currentCategory.id === selectedCategoryId
    )

    if (!category) {
      setSubcategories([])
      if (selectedSubcategoryId) {
        setSelectedSubcategoryId("")
      }
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
  }, [filteredCategories, selectedCategoryId, selectedSubcategoryId])

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

  const applySuggestedImage = (path: string) => {
    const absoluteUrl = buildAbsoluteImageUrl(path)

    setImageUrls((current) => {
      const next = [...current]
      const emptyIndex = next.findIndex((url) => !url.trim())

      if (emptyIndex >= 0) {
        next[emptyIndex] = absoluteUrl
      } else {
        next.unshift(absoluteUrl)
      }

      return Array.from(new Set(next))
    })
  }

  const handleEstimatedValueBlur = () => {
    const normalized = normalizeEstimatedValueInput(estimatedValue)
    if (!normalized.error) {
      setEstimatedValue(normalized.display)
    }
  }

  const handleSuccessOpenChange = (open: boolean) => {
    setShowSuccess(open)

    if (open) {
      return
    }

    if (isEditing && item) {
      router.push(`/items/${item.id}`)
      return
    }

    router.push("/account/items")
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

    const normalizedEstimatedValue = normalizeEstimatedValueInput(estimatedValue)

    if (normalizedEstimatedValue.error) {
      setError(normalizedEstimatedValue.error)
      return
    }

    const cleanedImageUrls = Array.from(
      new Set(
        imageUrls
          .map((url) => url.trim())
          .filter(Boolean)
          .map((url) => buildAbsoluteImageUrl(url))
      )
    )

    startTransition(async () => {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        subcategory: selectedSubcategoryId,
        condition,
        segregation,
        allow_reservation: allowReservation,
        estimated_value: normalizedEstimatedValue.payload,
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

  const pageTitle = isEditing ? "Editar item" : "Novo item"
  const buttonLabel = isEditing ? "Salvar alteracoes" : "Publicar item"
  const successTitle = isEditing ? "Item atualizado" : "Item publicado"
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
              Tipo de item *
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-[24px] border border-black/8 bg-[#f6f7fa] p-1">
              {ITEM_TYPE_OPTIONS.map((option) => {
                const active = selectedType === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedType(option.value)}
                    className={`rounded-[20px] px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-white text-[#182034] shadow-[0_10px_20px_rgba(16,24,44,0.08)]"
                        : "text-[#778094]"
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#182034]">
              Nome *
            </label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={
                selectedType === "service"
                  ? "Ex: Pintura residencial"
                  : "Ex: Furadeira de impacto"
              }
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
              placeholder="Descreva o item, estado, detalhes de uso e combinacoes importantes."
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
                {filteredCategories.map((category) => (
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
                {CONDITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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
                {SEGREGATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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
              onBlur={handleEstimatedValueBlur}
              inputMode="decimal"
              placeholder="Ex: 99,00"
              className="h-12 rounded-2xl border-black/10 px-4 text-base"
            />
            <p className="text-xs text-[#8a92a3]">
              Voce pode informar com virgula, por exemplo: 89,90.
            </p>
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

          <div className="space-y-3">
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
                  Adicionar link
                </button>
              </div>

              <div className="rounded-[24px] border border-black/10 bg-[#fafbfc] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#edfafe] text-[#2fb1c2]">
                    <ImagePlus size={18} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[#182034]">
                      Fotos sugeridas
                    </p>
                    <p className="text-xs leading-5 text-[#8a92a3]">
                      Se voce ainda nao tiver um link pronto, pode usar uma foto
                      sugerida para publicar e trocar depois.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {imageSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.path}
                          type="button"
                          onClick={() => applySuggestedImage(suggestion.path)}
                          className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium text-[#182034] transition hover:bg-black/5"
                        >
                          {suggestion.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
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
                      src={buildAbsoluteImageUrl(imageUrl)}
                      alt={`Preview ${index + 1}`}
                      className="h-28 w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-28 items-center justify-center rounded-2xl border border-dashed border-black/8 bg-[linear-gradient(145deg,#f4f5f7_0%,#eceeef_38%,#ffffff_100%)] text-xs text-[#8a92a3]">
                      Cole um link ou use uma sugestao acima
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-[#8a92a3]">
              O sistema salva imagens por link. Se preferir, publique primeiro com
              uma sugestao e depois edite.
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
        onOpenChange={handleSuccessOpenChange}
        title={successTitle}
        description={successDescription}
        actionLabel={isEditing ? "Voltar para o item" : "Ver meus itens"}
      />
    </>
  )
}
