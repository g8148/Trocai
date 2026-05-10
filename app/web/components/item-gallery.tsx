"use client"

import { useState } from "react"
import Lightbox from "yet-another-react-lightbox"
import "yet-another-react-lightbox/styles.css"

import type { ItemImage } from "@/lib/api"

const PLACEHOLDER_CLASS =
  "aspect-[4/3] w-full rounded-[20px] bg-[linear-gradient(145deg,#f4f5f7_0%,#eceeef_38%,#ffffff_100%)] lg:aspect-square"

export function ItemGallery({ images, name }: { images: ItemImage[]; name: string }) {
  const [current, setCurrent] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (images.length === 0) {
    return <div className={PLACEHOLDER_CLASS} />
  }

  const slides = images.map((img) => ({ src: img.image, alt: name }))

  return (
    <>
      <div>
        {/* Imagem principal */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="group block w-full overflow-hidden rounded-[20px]"
        >
          <img
            src={images[current].image}
            alt={name}
            className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.02] lg:aspect-square"
          />
        </button>

        {/* Miniaturas */}
        {images.length > 1 && (
          <div className="mt-2.5 flex gap-2">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setCurrent(i)}
                className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                  i === current
                    ? "border-[#2fb1c2] opacity-100"
                    : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                <img
                  src={img.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={current}
        slides={slides}
        on={{ view: ({ index }) => setCurrent(index) }}
      />
    </>
  )
}
