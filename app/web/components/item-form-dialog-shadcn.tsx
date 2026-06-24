"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useStore } from "@tanstack/react-form"
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
  InputGroupInput,
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
import { ItemImageUploader } from "@/components/item-image-uploader"

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
      category.subcategories.some(
        (subcategory) => subcategory.id === subcategoryId
      )
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

// O FieldError do shadcn espera Array<{ message?: string }>, mas o TanStack Form
// entrega os erros como string (ou objeto com .message). Normaliza para o formato
// que o componente consome.
function normalizeFieldErrors(errors: unknown[]): Array<{ message?: string }> {
  return errors.flatMap((error) => {
    if (typeof error === "string") {
      return [{ message: error }]
    }
    if (error && typeof error === "object" && "message" in error) {
      const message = (error as { message?: unknown }).message
      if (typeof message === "string") {
        return [{ message }]
      }
    }
    return []
  })
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

  // Assinaturas granulares: o pai so re-renderiza quando esses primitivos mudam
  // (selecao de tipo/categoria/subcategoria e tentativas de submit), nunca a
  // cada tecla. Campos "quentes" (nome, descricao, valor) ficam isolados nos
  // proprios form.Field/form.Subscribe.
  const typeValue = useStore(form.store, (state) => state.values.type)
  const categoryIdValue = useStore(
    form.store,
    (state) => state.values.categoryId
  )
  const subcategoryValue = useStore(
    form.store,
    (state) => state.values.subcategory
  )
  const submissionAttempts = useStore(
    form.store,
    (state) => state.submissionAttempts
  )

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === typeValue),
    [categories, typeValue]
  )

  const selectedCategory = useMemo(
    () =>
      filteredCategories.find((category) => category.id === categoryIdValue) ??
      null,
    [filteredCategories, categoryIdValue]
  )

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
      categoryIdValue &&
      !filteredCategories.some((category) => category.id === categoryIdValue)
    ) {
      form.setFieldValue("categoryId", "")
      form.setFieldValue("subcategory", "")
    }
  }, [filteredCategories, form, categoryIdValue])

  useEffect(() => {
    if (!selectedCategory) {
      if (subcategoryValue) {
        form.setFieldValue("subcategory", "")
      }
      return
    }

    if (
      subcategoryValue &&
      selectedCategory.subcategories.some(
        (subcategory) => subcategory.id === subcategoryValue
      )
    ) {
      return
    }

    form.setFieldValue("subcategory", "")
  }, [form, subcategoryValue, selectedCategory])

  const requestClose = () => {
    if (form.state.isSubmitting) {
      return
    }

    if (form.state.isDirty) {
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
              <DialogTitle>
                {item ? "Editar item" : "Adicionar item"}
              </DialogTitle>
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
                          Escolha se este cadastro representa uma ferramenta ou
                          um serviço.
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
                          submissionAttempts
                        )

                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor="item-category">
                              Categoria
                            </FieldLabel>
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
                                  <SelectItem
                                    key={category.id}
                                    value={category.id}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FieldDescription>
                              Define o grupo principal onde o item será exibido.
                            </FieldDescription>
                            {isInvalid ? (
                              <FieldError
                                errors={normalizeFieldErrors(
                                  field.state.meta.errors
                                )}
                              />
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
                          submissionAttempts
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
                                {selectedCategory?.subcategories.map(
                                  (subcategory) => (
                                    <SelectItem
                                      key={subcategory.id}
                                      value={subcategory.id}
                                    >
                                      {subcategory.name}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                            <FieldDescription>
                              {selectedCategory
                                ? "Escolha a opção mais próxima do item ou serviço."
                                : "A lista é liberada depois que você seleciona a categoria."}
                            </FieldDescription>
                            {isInvalid ? (
                              <FieldError
                                errors={normalizeFieldErrors(
                                  field.state.meta.errors
                                )}
                              />
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
                        submissionAttempts
                      )

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor="item-name">Nome</FieldLabel>
                          <Input
                            id="item-name"
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                            aria-invalid={isInvalid}
                            placeholder={
                              typeValue === "service"
                                ? "Ex.: Pintura residencial"
                                : "Ex.: Furadeira de impacto"
                            }
                            className="h-10"
                          />
                          <FieldDescription>
                            Use um nome claro para o anúncio aparecer melhor na
                            busca.
                          </FieldDescription>
                          {isInvalid ? (
                            <FieldError
                              errors={normalizeFieldErrors(
                                field.state.meta.errors
                              )}
                            />
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
                          return "Informe a descrição do item."
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
                        submissionAttempts
                      )

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor="item-description">
                            Descrição
                          </FieldLabel>
                          <InputGroup>
                            <InputGroupTextarea
                              id="item-description"
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(event) =>
                                field.handleChange(event.target.value)
                              }
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
                            Inclua o estado de conservação, o contexto de uso e
                            o que acompanha o item.
                          </FieldDescription>
                          {isInvalid ? (
                            <FieldError
                              errors={normalizeFieldErrors(
                                field.state.meta.errors
                              )}
                            />
                          ) : null}
                        </Field>
                      )
                    }}
                  </form.Field>

                  <div className="grid gap-4 md:grid-cols-2">
                    <form.Field name="condition">
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor="item-condition">
                            Condição
                          </FieldLabel>
                          <Select
                            value={field.state.value}
                            onValueChange={field.handleChange}
                          >
                            <SelectTrigger
                              id="item-condition"
                              className="h-10 w-full"
                            >
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {CONDITION_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FieldDescription>
                            Indica o estado físico de conservação do item.
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
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FieldDescription>
                            Indica se o item é de uso amador, semi-profissional
                            ou profissional.
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
                            Valor estimado{" "}
                            <span className="font-normal text-muted-foreground">
                              (opcional)
                            </span>
                          </FieldLabel>
                          <InputGroup className="h-10">
                            <InputGroupAddon>
                              <InputGroupText>R$</InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                              id="item-estimated-value"
                              inputMode="numeric"
                              value={field.state.value}
                              onChange={(event) =>
                                field.handleChange(
                                  formatCurrencyMask(event.target.value)
                                )
                              }
                              placeholder="0,00"
                            />
                          </InputGroup>
                          <FieldDescription>
                            Uma referência de quanto vale o item. Pode deixar em
                            branco.
                          </FieldDescription>
                        </Field>
                      )}
                    </form.Field>

                    <form.Field name="allow_reservation">
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor="item-reservation">
                            Reservas
                          </FieldLabel>
                          <div className="flex items-center justify-between rounded-lg border border-input bg-background px-3 py-2.5">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-foreground">
                                Permitir reservas
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Depois você pode pausar isso em Meus itens.
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
                          Envie fotos do item. A primeira imagem vira a capa do
                          anúncio.
                        </FieldDescription>
                        <ItemImageUploader
                          value={field.state.value}
                          onChange={field.handleChange}
                        />
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
                <form.Subscribe selector={(state) => state.isSubmitting}>
                  {(isSubmitting) => (
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={requestClose}
                        disabled={isSubmitting}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting
                          ? "Salvando..."
                          : item
                            ? "Salvar alterações"
                            : "Salvar item"}
                      </Button>
                    </div>
                  )}
                </form.Subscribe>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
            <AlertDialogDescription>
              Há mudanças não salvas neste formulário. Se você sair agora, elas
              serão perdidas.
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
