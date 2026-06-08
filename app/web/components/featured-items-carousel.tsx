"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import type { ItemSummary } from "@/lib/api"
import { getItemPrimaryImage } from "@/lib/item-visuals"

const AUTO_ADVANCE_MS = 5200

function formatCurrency(value: string | null) {
  if (!value) {
    return null
  }

  const numeric = Number(value)
  if (Number.isNaN(numeric)) {
    return value
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numeric)
}

function getSuggestionScore(item: ItemSummary) {
  let score = item.times_borrowed * 8

  if (item.allow_reservation) {
    score += 4
  }

  if (getItemPrimaryImage(item)) {
    score += 6
  }

  if (item.category_name) {
    score += 2
  }

  if (item.estimated_value) {
    score += 2
  }

  return score
}

export function FeaturedItemsCarousel({ items }: { items: ItemSummary[] }) {
  const slides = [...items]
    .sort((left, right) => {
      const scoreDiff = getSuggestionScore(right) - getSuggestionScore(left)
      if (scoreDiff !== 0) {
        return scoreDiff
      }

      return (
        new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime()
      )
    })
    .slice(0, 5)

  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) {
      return
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length)
    }, AUTO_ADVANCE_MS)

    return () => window.clearInterval(timer)
  }, [slides.length])

  if (slides.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-black/10 bg-[#f6f5f2] p-8 text-center text-[#5d6678]">
        Ainda nao existem itens cadastrados para exibir aqui.
      </div>
    )
  }

  const current = slides[index]
  const currentImage = getItemPrimaryImage(current)
  const price = formatCurrency(current.estimated_value)

  return (
    <section className="rounded-[30px] border border-black/6 bg-white/78 p-4 shadow-[0_12px_34px_rgba(17,24,39,0.05)] backdrop-blur-xl lg:p-5">
      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="order-2 flex min-w-0 flex-col justify-between rounded-[24px] bg-[#fbfbf8] p-4 lg:order-1 lg:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[#7b8494]">
                Ferramentas recentes
              </p>
              <div className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#96a0b0]">
                  {current.category_name ?? "Catalogo"}
                </p>
                <h1 className="max-w-[22ch] text-[1.5rem] font-semibold leading-tight tracking-[-0.05em] text-[#182034] lg:text-[1.85rem]">
                  {current.name}
                </h1>
              </div>
            </div>

            {slides.length > 1 ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setIndex((currentIndex) =>
                      currentIndex === 0 ? slides.length - 1 : currentIndex - 1
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-black/8 bg-white text-[#5d6678] transition hover:text-[#182034]"
                  aria-label="Slide anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setIndex((currentIndex) => (currentIndex + 1) % slides.length)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-black/8 bg-white text-[#5d6678] transition hover:text-[#182034]"
                  aria-label="Proximo slide"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>

          <div className="mt-4 space-y-4">
            <p className="max-w-[62ch] text-sm leading-6 text-[#5d6678]">
              {current.description}
            </p>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-full bg-white px-3 py-1.5 text-sm text-[#5d6678] ring-1 ring-black/6">
                {current.subcategory_name ?? current.category_name ?? "Ferramenta"}
              </span>
              {price ? (
                <span className="rounded-full bg-[#eef4f5] px-3 py-1.5 text-sm font-medium text-[#182034]">
                  {price}
                </span>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <Link
                href={`/items/${current.id}`}
                className="inline-flex h-10 items-center justify-center rounded-full bg-[#182034] px-4 text-sm font-medium text-white transition hover:bg-[#243149]"
              >
                Ver item
              </Link>

              {slides.length > 1 ? (
                <div className="flex items-center gap-1.5">
                  {slides.map((slide, slideIndex) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setIndex(slideIndex)}
                      className={`h-2 rounded-full transition-all ${
                        slideIndex === index
                          ? "w-7 bg-[#182034]"
                          : "w-2 bg-black/14 hover:bg-black/24"
                      }`}
                      aria-label={`Ir para o item ${slideIndex + 1}`}
                    />
                  ))}
                </div>
              ) : <div />}
            </div>
          </div>
        </div>

        <div className="order-1 overflow-hidden rounded-[24px] bg-[#f3f4f2] lg:order-2 lg:h-full">
          {currentImage ? (
            <img
              src={currentImage}
              alt={current.name}
              className="h-[180px] w-full object-cover lg:h-full"
            />
          ) : (
            <div className="h-[180px] w-full bg-[linear-gradient(145deg,#f4f5f7_0%,#eceeef_38%,#ffffff_100%)] lg:h-full" />
          )}
        </div>
      </div>
    </section>
  )
}
