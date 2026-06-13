"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useStore } from "@tanstack/react-form"
import { ImagePlus, Plus, Trash2 } from "lucide-react"
import * as z from "zod"

import { createItemAction, updateItemAction } from "@/lib/app-actions"
import type { CategoryGroup, ItemSummary } from "@/lib/api"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

type ItemType = "tool" | "service"

type ItemFormValues = {
  type: ItemType
  categoryId: string
  subcategory: string
  name: string
  description: string
  condition: string
  segregation: string
  estimatedValue: string
  allow_reservation: boolean
  image_urls: string[]
}

type DemoImageOption = {
  path: string
  label: string
  type: ItemType
  keywords: string[]
}

const ITEM_TYPE_OPTIONS: Array<{ value: ItemType; label: string }> = [
  { value: "tool", label: "Ferramenta" },
  { value: "service", label: "Serviço" },
]

const CONDITION_OPTIONS = [
  { value: "new", label: "Novo" },
  { value: "good", label: "Bom estado" },
  { value: "used", label: "Usado" },
  { value: "worn", label: "Desgastado" },
] as const

const SEGREGATION_OPTIONS = [
  { value: "hobby", label: "Hobby" },
  { value: "semi_professional", label: "Semi-profissional" },
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
    keywords: ["chave", "fenda", "phillips", "philips"],
  },
  {
    path: "/demo-items/martelo-usado.png",
    label: "Martelo usado",
    type: "tool",
    keywords: ["martelo"],
  },
  {
    path: "/demo-items/marreta-demolicao-usada.png",
    label: "Marreta de demolição",
    type: "tool",
    keywords: ["marreta", "demolidor", "martelete"],
  },
  {
    path: "/demo-items/esmerilhadeira-usada.png",
    label: "Esmerilhadeira",
    type: "tool",
    keywords: ["esmerilhadeira"],
  },
  {
    path: "/demo-items/escada-extensivel-usada.png",
    label: "Escada extensível",
    type: "tool",
    keywords: ["escada", "andaime", "altura"],
  },
  {
    path: "/demo-items/pintura-residencial.png",
    label: "Serviço residencial",
    type: "service",
    keywords: ["pintura", "serviço", "instalação", "hidráulica", "doméstico"],
  },
]

const itemFormSchema = z.object({
  type: z.enum(["tool", "service"]),
  categoryId: z.string().min(1, "Selecione uma categoria."),
  subcategory: z.string().min(1, "Selecione uma subcategoria."),
  name: z
    .string()
    .trim()
    .min(3, "Informe o nome do item com pelo menos 3 caracteres.")
    .max(200, "Use no máximo 200 caracteres no nome."),
  description: z
    .string()
    .trim()
    .min(10, "Descreva melhor o item com pelo menos 10 caracteres."),
  condition: z.enum(["new", "good", "used", "worn"]),
  segregation: z.enum(["hobby", "semi_professional", "professional"]),
  estimatedValue: z.string(),
  allow_reservation: z.boolean(),
  image_urls: z.array(z.string()),
})

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

function formatCurrencyMask(rawValue: string) {
  const digits = rawValue.replace(/\D/g, "")

  if (!digits) {
    return ""
  }

  return (Number(digits) / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function normalizeEstimatedValue(value: string) {
  const digits = value.replace(/\D/g, "")
  if (!digits) {
    return null
  }

  return (Number(digits) / 100).toFixed(2)
}

function getAbsoluteImageUrl(value: string) {
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

function getInitialValues(
  categories: CategoryGroup[],
  item?: ItemSummary
): ItemFormValues {
  const categoryId = getInitialCategoryId(categories, item?.subcategory)

  return {
    type: item?.category_type === "service" ? "service" : "tool",
    categoryId,
    subcategory: item?.subcategory ?? "",
    name: item?.name ?? "",
    description: item?.description ?? "",
    condition: item?.condition ?? "good",
    segregation: item?.segregation ?? "hobby",
    estimatedValue: item?.estimated_value
      ? formatCurrencyMask(item.estimated_value)
      : "",
    allow_reservation: item?.allow_reservation ?? true,
    image_urls: item?.images?.map((image) => image.image) ?? [""],
  }
}

function shouldShowFieldError(
  meta: { isTouched: boolean; errors: unknown[] },
  submissionAttempts: number
) {
  return (meta.isTouched || submissionAttempts > 0) && meta.errors.length > 0
}

interface ItemFormDialogShadcnProps {
  categories: CategoryGroup[]
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: ItemSummary
}

export function ItemFormDialogShadcn({
  categories,
  open,
  onOpenChange,
  item,
}: ItemFormDialogShadcnProps) {
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false)

  const initialValues = useMemo(
    () => getInitialValues(categories, item),
    [categories, item]
  )

  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onSubmit: itemFormSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)

      const imageUrls = Array.from(
        new Set(
          value.image_urls
            .map((url) => url.trim())
            .filter(Boolean)
            .map((url) => getAbsoluteImageUrl(url))
        )
      )

      const payload = {
        name: value.name.trim(),
        description: value.description.trim(),
        subcategory: value.subcategory,
        condition: value.condition,
        segregation: value.segregation,
        allow_reservation: value.allow_reservation,
        estimated_value: normalizeEstimatedValue(value.estimatedValue),
        image_urls: imageUrls,
      }

      const result = item
        ? await updateItemAction(item.id, payload)
        : await createItemAction(payload)

      if (!result.ok) {
        setSubmitError(result.error ?? "Não foi possível salvar o item.")
        return
      }

      form.reset(initialValues)
      onOpenChange(false)
      router.refresh()
    },
  })

  const formState = useStore(form.store, (state) => ({
    values: state.values,
    isDirty: state.isDirty,
    isSubmitting: Boolean(state.isSubmitting),
    submissionAttempts: state.submissionAttempts,
  }))

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === formState.values.type),
    [categories, formState.values.type]
  )

  const selectedCategory = useMemo(
    () =>
      filteredCategories.find(
        (category) => category.id === formState.values.categoryId
      ) ?? null,
    [filteredCategories, formState.values.categoryId]
  )

  const selectedSubcategory = useMemo(
    () =>
      selectedCategory?.subcategories.find(
        (subcategory) => subcategory.id === formState.values.subcategory
      ) ?? null,
    [selectedCategory, formState.values.subcategory]
  )

  const imageSuggestions = useMemo(() => {
    const haystack = [
      formState.values.name,
      selectedCategory?.name ?? "",
      selectedSubcategory?.name ?? "",
      formState.values.type,
    ]
      .join(" ")
      .toLowerCase()

    return DEMO_IMAGE_OPTIONS
      .filter((option) => option.type === formState.values.type)
      .map((option) => ({
        ...option,
        score: getSuggestionScore(option, haystack),
      }))
      .sort((left, right) => right.score - left.score)
      .slice(0, formState.values.type === "service" ? 1 : 3)
  }, [
    formState.values.name,
    formState.values.type,
    selectedCategory?.name,
    selectedSubcategory?.name,
  ])

  useEffect(() => {
    if (!open) {
      return
    }

    form.reset(initialValues)
    setSubmitError(null)
    setDiscardDialogOpen(false)
  }, [form, initialValues, open])

  useEffect(() => {
    if (
      formState.values.categoryId &&
      !filteredCategories.some((category) => category.id === formState.values.categoryId)
    ) {
      form.setFieldValue("categoryId", "")
      form.setFieldValue("subcategory", "")
    }
  }, [filteredCategories, form, formState.values.categoryId])

  useEffect(() => {
    if (!selectedCategory) {
      if (formState.values.subcategory) {
        form.setFieldValue("subcategory", "")
      }
      return
    }

    if (
      formState.values.subcategory &&
      selectedCategory.subcategories.some(
        (subcategory) => subcategory.id === formState.values.subcategory
      )
    ) {
      return
    }

    form.setFieldValue("subcategory", "")
  }, [form, formState.values.subcategory, selectedCategory])

  const requestClose = () => {
    if (formState.isSubmitting) {
      return
    }

    if (formState.isDirty) {
      setDiscardDialogOpen(true)
      return
    }

    onOpenChange(false)
  }

  const confirmDiscardChanges = () => {
    form.reset(initialValues)
    setSubmitError(null)
    setDiscardDialogOpen(false)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen) {
            onOpenChange(true)
            return
          }

          requestClose()
        }}
      >
        <DialogContent className="max-w-3xl overflow-hidden p-0 sm:max-w-3xl">
          <div className="flex max-h-[85vh] flex-col">
            <DialogHeader className="border-b px-6 py-4 text-left">
              <DialogTitle>{item ? "Editar item" : "Adicionar item"}</DialogTitle>
              <DialogDescription>
                {item
                  ? "Atualize as informações e publique as mudanças sem sair da página."
                  : "Cadastre uma ferramenta ou serviço e publique direto no catálogo."}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(event) => {
                event.preventDefault()
                event.stopPropagation()
                void form.handleSubmit()
              }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <FieldGroup>
                  <form.Field name="type">
                    {(field) => (
                      <Field>
                        <FieldLabel>Tipo do item</FieldLabel>
                        <FieldDescription>
                          Escolha se este cadastro representa uma ferramenta ou um serviço.
                        </FieldDescription>
                        <div className="flex flex-wrap items-center gap-2">
                          {ITEM_TYPE_OPTIONS.map((option) => {
                            const active = field.state.value === option.value

                            return (
                              <Button
                                key={option.value}
                                type="button"
                                variant={active ? "default" : "outline"}
                                size="sm"
                                onClick={() => field.handleChange(option.value)}
                                className="justify-start"
                              >
                                {option.label}
                              </Button>
                            )
                          })}
                        </div>
                      </Field>
                    )}
                  </form.Field>

                  <div className="grid gap-4 md:grid-cols-2">
                    <form.Field
                      name="categoryId"
                      validators={{
                        onSubmit: ({ value }) =>
                          value ? undefined : "Selecione uma categoria.",
                      }}
                    >
                      {(field) => {
                        const isInvalid = shouldShowFieldError(
                          field.state.meta,
                          formState.submissionAttempts
                        )

                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor="item-category">Categoria</FieldLabel>
                            <Select
                              value={field.state.value || undefined}
                              onValueChange={(value) => {
                                field.handleChange(value)
                                form.setFieldValue("subcategory", "")
                              }}
                            >
                              <SelectTrigger
                                id="item-category"
                                aria-invalid={isInvalid}
                                className="h-10 w-full"
                              >
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                              <SelectContent>
                                {filteredCategories.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FieldDescription>
                              Define o grupo principal em que o item sera exibido.
                            </FieldDescription>
                            {isInvalid ? (
                              <FieldError errors={field.state.meta.errors} />
                            ) : null}
                          </Field>
                        )
                      }}
                    </form.Field>

                    <form.Field
                      name="subcategory"
                      validators={{
                        onSubmit: ({ value }) =>
                          value ? undefined : "Selecione uma subcategoria.",
                      }}
                    >
                      {(field) => {
                        const isInvalid = shouldShowFieldError(
                          field.state.meta,
                          formState.submissionAttempts
                        )

                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor="item-subcategory">
                              Subcategoria
                            </FieldLabel>
                            <Select
                              value={field.state.value || undefined}
                              onValueChange={field.handleChange}
                              disabled={!selectedCategory}
                            >
                              <SelectTrigger
                                id="item-subcategory"
                                aria-invalid={isInvalid}
                                className="h-10 w-full"
                              >
                                <SelectValue
                                  placeholder={
                                    selectedCategory
                                      ? "Selecione uma subcategoria"
                                      : "Escolha a categoria primeiro"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {selectedCategory?.subcategories.map((subcategory) => (
                                  <SelectItem
                                    key={subcategory.id}
                                    value={subcategory.id}
                                  >
                                    {subcategory.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FieldDescription>
                              {selectedCategory
                                ? "Escolha a opção mais próxima do item ou serviço."
                                : "A lista e liberada depois que voce seleciona a categoria."}
                            </FieldDescription>
                            {isInvalid ? (
                              <FieldError errors={field.state.meta.errors} />
                            ) : null}
                          </Field>
                        )
                      }}
                    </form.Field>
                  </div>

                  <form.Field
                    name="name"
                    validators={{
                      onBlur: ({ value }) => {
                        const trimmed = value.trim()
                        if (!trimmed) {
                          return "Informe o nome do item."
                        }
                        if (trimmed.length < 3) {
                          return "Informe o nome do item com pelo menos 3 caracteres."
                        }
                        return undefined
                      },
                    }}
                  >
                    {(field) => {
                      const isInvalid = shouldShowFieldError(
                        field.state.meta,
                        formState.submissionAttempts
                      )

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor="item-name">Nome</FieldLabel>
                          <Input
                            id="item-name"
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) => field.handleChange(event.target.value)}
                            aria-invalid={isInvalid}
                            placeholder={
                              formState.values.type === "service"
                                ? "Ex.: Pintura residencial"
                                : "Ex.: Furadeira de impacto"
                            }
                            className="h-10"
                          />
                          <FieldDescription>
                            Use um nome claro para o anuncio aparecer melhor na busca.
                          </FieldDescription>
                          {isInvalid ? (
                            <FieldError errors={field.state.meta.errors} />
                          ) : null}
                        </Field>
                      )
                    }}
                  </form.Field>

                  <form.Field
                    name="description"
                    validators={{
                      onBlur: ({ value }) => {
                        const trimmed = value.trim()
                        if (!trimmed) {
                          return "Informe a descricao do item."
                        }
                        if (trimmed.length < 10) {
                          return "Descreva melhor o item com pelo menos 10 caracteres."
                        }
                        return undefined
                      },
                    }}
                  >
                    {(field) => {
                      const isInvalid = shouldShowFieldError(
                        field.state.meta,
                        formState.submissionAttempts
                      )

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor="item-description">Descricao</FieldLabel>
                          <InputGroup>
                            <InputGroupTextarea
                              id="item-description"
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              placeholder="Descreva o estado, a forma de uso e os detalhes importantes."
                              rows={6}
                              className="resize-none"
                              aria-invalid={isInvalid}
                            />
                            <InputGroupAddon align="block-end">
                              <InputGroupText className="tabular-nums">
                                {field.state.value.length} caracteres
                              </InputGroupText>
                            </InputGroupAddon>
                          </InputGroup>
                          <FieldDescription>
                            Inclua estado de conservacao, contexto de uso e o que acompanha o item.
                          </FieldDescription>
                          {isInvalid ? (
                            <FieldError errors={field.state.meta.errors} />
                          ) : null}
                        </Field>
                      )
                    }}
                  </form.Field>

                  <div className="grid gap-4 md:grid-cols-2">
                    <form.Field name="condition">
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor="item-condition">Condicao</FieldLabel>
                          <Select
                            value={field.state.value}
                            onValueChange={field.handleChange}
                          >
                            <SelectTrigger id="item-condition" className="h-10 w-full">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {CONDITION_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FieldDescription>
                            Ajuda o usuario a entender o estado real do item.
                          </FieldDescription>
                        </Field>
                      )}
                    </form.Field>

                    <form.Field name="segregation">
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor="item-segregation">
                            Perfil de uso
                          </FieldLabel>
                          <Select
                            value={field.state.value}
                            onValueChange={field.handleChange}
                          >
                            <SelectTrigger
                              id="item-segregation"
                              className="h-10 w-full"
                            >
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {SEGREGATION_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FieldDescription>
                            Mostra o nivel de exigencia ou robustez do item.
                          </FieldDescription>
                        </Field>
                      )}
                    </form.Field>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <form.Field name="estimatedValue">
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor="item-estimated-value">
                            Valor estimado
                          </FieldLabel>
                          <Input
                            id="item-estimated-value"
                            inputMode="numeric"
                            value={field.state.value}
                            onChange={(event) =>
                              field.handleChange(
                                formatCurrencyMask(event.target.value)
                              )
                            }
                            placeholder="0,00"
                            className="h-10"
                          />
                          <FieldDescription>
                            O valor e formatado automaticamente enquanto voce digita.
                          </FieldDescription>
                        </Field>
                      )}
                    </form.Field>

                    <form.Field name="allow_reservation">
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor="item-reservation">Reservas</FieldLabel>
                          <div className="flex items-center justify-between rounded-lg border border-input bg-background px-3 py-2.5">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-foreground">
                                Permitir reservas
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Depois voce pode pausar isso em Meus itens.
                              </p>
                            </div>
                            <Switch
                              checked={field.state.value}
                              onCheckedChange={field.handleChange}
                              aria-label="Permitir reservas"
                            />
                          </div>
                        </Field>
                      )}
                    </form.Field>
                  </div>

                  <form.Field name="image_urls">
                    {(field) => (
                      <Field>
                        <FieldLabel>Imagens</FieldLabel>
                        <FieldDescription>
                          Enquanto o upload nao entra, voce pode colar links ou usar as sugestoes abaixo.
                        </FieldDescription>

                        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-muted-foreground">
                              <ImagePlus className="h-4 w-4" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-foreground">
                                Upload em preparacao
                              </p>
                              <p className="text-xs leading-5 text-muted-foreground">
                                Escolha uma foto de apoio para acelerar o cadastro ate a rota de upload ficar pronta.
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {imageSuggestions.map((suggestion) => (
                                  <Button
                                    key={suggestion.path}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const nextValues = [...field.state.value]
                                      const emptyIndex = nextValues.findIndex(
                                        (url) => !url.trim()
                                      )
                                      const absoluteUrl = getAbsoluteImageUrl(
                                        suggestion.path
                                      )

                                      if (emptyIndex >= 0) {
                                        nextValues[emptyIndex] = absoluteUrl
                                      } else {
                                        nextValues.unshift(absoluteUrl)
                                      }

                                      field.handleChange(Array.from(new Set(nextValues)))
                                    }}
                                  >
                                    {suggestion.label}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {field.state.value.map((imageUrl, index) => (
                            <div
                              key={`${index}-${imageUrl}`}
                              className="rounded-lg border border-border bg-background p-3"
                            >
                              <div className="flex items-center gap-2">
                                <Input
                                  value={imageUrl}
                                  onChange={(event) => {
                                    const nextValues = [...field.state.value]
                                    nextValues[index] = event.target.value
                                    field.handleChange(nextValues)
                                  }}
                                  placeholder="https://exemplo.com/foto.jpg"
                                  className="h-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => {
                                    const nextValues = field.state.value.filter(
                                      (_, currentIndex) => currentIndex !== index
                                    )
                                    field.handleChange(
                                      nextValues.length ? nextValues : [""]
                                    )
                                  }}
                                  aria-label="Remover imagem"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              {imageUrl.trim() ? (
                                <img
                                  src={getAbsoluteImageUrl(imageUrl)}
                                  alt={`Imagem ${index + 1}`}
                                  className="mt-3 h-32 w-full rounded-md object-cover"
                                />
                              ) : null}
                            </div>
                          ))}

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              field.handleChange([...field.state.value, ""])
                            }
                          >
                            <Plus className="h-4 w-4" />
                            Adicionar link
                          </Button>
                        </div>
                      </Field>
                    )}
                  </form.Field>

                  {submitError ? (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {submitError}
                    </div>
                  ) : null}
                </FieldGroup>
              </div>

              <div className="sticky bottom-0 border-t bg-background px-6 py-4">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={requestClose}
                    disabled={formState.isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={formState.isSubmitting}>
                    {formState.isSubmitting
                      ? "Salvando..."
                      : item
                        ? "Salvar alteracoes"
                        : "Salvar item"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar alteracoes?</AlertDialogTitle>
            <AlertDialogDescription>
              Ha mudancas nao salvas neste formulario. Se voce sair agora, elas serao perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar editando</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDiscardChanges}>
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
