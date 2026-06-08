import type { ItemImage, ItemSummary } from "@/lib/api"

type ItemVisualTarget = Pick<
  ItemSummary,
  | "id"
  | "name"
  | "owner"
  | "cover_image"
  | "images"
  | "category_type"
  | "category_name"
  | "subcategory_name"
>

const DEMO_ITEM_IMAGES = {
  drill: "/demo-items/furadeira-bosch-usada.png",
  hammer: "/demo-items/martelo-usado.png",
  demolitionHammer: "/demo-items/marreta-demolicao-usada.png",
  screwdriver: "/demo-items/chave-fenda-usada.png",
  grinder: "/demo-items/esmerilhadeira-usada.png",
  ladder: "/demo-items/escada-extensivel-usada.png",
  painting: "/demo-items/pintura-residencial.png",
} as const

function getStableVariantIndex(seed: string, length: number) {
  if (length <= 1) {
    return 0
  }

  let total = 0
  for (const char of seed) {
    total += char.charCodeAt(0)
  }

  return total % length
}

function getDemoImageByName(item: ItemVisualTarget) {
  const haystack = [
    item.name,
    item.category_name ?? "",
    item.subcategory_name ?? "",
  ]
    .join(" ")
    .toLowerCase()

  const seed = `${item.owner?.id ?? ""}:${item.owner?.username ?? ""}:${item.name}:${item.id}`

  if (
    haystack.includes("furadeira") ||
    haystack.includes("bosch") ||
    haystack.includes("parafusadeira")
  ) {
    return DEMO_ITEM_IMAGES.drill
  }

  if (
    haystack.includes("demolidor") ||
    haystack.includes("marreta") ||
    haystack.includes("5kg")
  ) {
    return DEMO_ITEM_IMAGES.demolitionHammer
  }

  if (haystack.includes("martelo mk2") || haystack.includes("mk2")) {
    return DEMO_ITEM_IMAGES.hammer
  }

  if (haystack.includes("chave de fenda")) {
    return DEMO_ITEM_IMAGES.screwdriver
  }

  if (
    haystack.includes("esmerilhadeira") ||
    haystack.includes("grinder")
  ) {
    return DEMO_ITEM_IMAGES.grinder
  }

  if (haystack.includes("escada")) {
    return DEMO_ITEM_IMAGES.ladder
  }

  if (
    item.category_type === "service" ||
    haystack.includes("pintura") ||
    haystack.includes("pintor")
  ) {
    return DEMO_ITEM_IMAGES.painting
  }

  if (haystack.includes("martelo")) {
    const hammerVariants = [
      DEMO_ITEM_IMAGES.hammer,
      DEMO_ITEM_IMAGES.demolitionHammer,
    ]

    return hammerVariants[getStableVariantIndex(seed, hammerVariants.length)]
  }

  return null
}

export function getItemPrimaryImage(item: ItemVisualTarget) {
  if (item.cover_image) {
    return item.cover_image
  }

  const coverFromImages =
    item.images?.find((image) => image.is_cover)?.image ?? item.images?.[0]?.image

  if (coverFromImages) {
    return coverFromImages
  }

  return getDemoImageByName(item)
}

export function getItemGalleryImages(item: ItemVisualTarget): ItemImage[] {
  if (item.images?.length) {
    return item.images
  }

  const fallback = getDemoImageByName(item)
  if (!fallback) {
    return []
  }

  return [
    {
      id: `demo-${item.id}`,
      image: fallback,
      is_cover: true,
    },
  ]
}
