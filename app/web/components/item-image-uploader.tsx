"use client"

import { useRef, useState } from "react"
import { ImagePlus, Loader2, Star, Trash2, TriangleAlert } from "lucide-react"

import { uploadItemImageAction } from "@/lib/app-actions"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const MAX_FILE_SIZE = 5 * 1024 * 1024

type UploadSlot =
  | { status: "uploading"; id: string; preview: string; name: string }
  | { status: "error"; id: string; name: string; error: string }

interface ItemImageUploaderProps {
  value: string[]
  onChange: (next: string[]) => void
}

function validateFile(file: File) {
  if (!file.type.startsWith("image/")) {
    return "Envie apenas imagens."
  }
  if (file.size > MAX_FILE_SIZE) {
    return "Imagem deve ter no máximo 5MB."
  }
  return null
}

export function ItemImageUploader({ value, onChange }: ItemImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<UploadSlot[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const urls = value.filter((url) => url.trim())

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return
    }

    // Acumulador local: o prop `value` nao atualiza dentro deste loop (closure),
    // entao cada upload concluido precisa partir das URLs ja acumuladas aqui,
    // senao uploads em sequencia se sobrescreveriam.
    let accumulated = value.filter((url) => url.trim())

    for (const file of Array.from(files)) {
      const slotId = `${file.name}-${file.size}-${crypto.randomUUID()}`
      const validationError = validateFile(file)

      if (validationError) {
        setPending((prev) => [
          ...prev,
          { status: "error", id: slotId, name: file.name, error: validationError },
        ])
        continue
      }

      const preview = URL.createObjectURL(file)
      setPending((prev) => [
        ...prev,
        { status: "uploading", id: slotId, preview, name: file.name },
      ])

      const formData = new FormData()
      formData.append("file", file)
      const result = await uploadItemImageAction(formData)

      URL.revokeObjectURL(preview)

      if (result.ok) {
        accumulated = [...accumulated, result.url]
        onChange(accumulated)
        setPending((prev) => prev.filter((slot) => slot.id !== slotId))
      } else {
        setPending((prev) =>
          prev.map((slot) =>
            slot.id === slotId
              ? { status: "error", id: slotId, name: file.name, error: result.error }
              : slot
          )
        )
      }
    }
  }

  const removeUrl = (target: string) => {
    onChange(urls.filter((url) => url !== target))
  }

  const makeCover = (target: string) => {
    onChange([target, ...urls.filter((url) => url !== target)])
  }

  const dismissError = (slotId: string) => {
    setPending((prev) => prev.filter((slot) => slot.id !== slotId))
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          void handleFiles(event.dataTransfer.files)
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center transition-colors hover:bg-muted/50",
          isDragging && "border-primary bg-primary/5"
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background text-muted-foreground">
          <ImagePlus className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Clique ou arraste imagens
          </p>
          <p className="text-xs text-muted-foreground">
            PNG ou JPG até 5MB cada. A primeira imagem vira a capa.
          </p>
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          void handleFiles(event.target.files)
          event.target.value = ""
        }}
      />

      {urls.length > 0 || pending.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {urls.map((url, index) => (
            <div
              key={url}
              className="group relative overflow-hidden rounded-lg border border-border bg-background"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Imagem ${index + 1}`}
                className="h-28 w-full object-cover"
              />
              {index === 0 ? (
                <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                  <Star className="h-3 w-3" />
                  Capa
                </span>
              ) : null}
              <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {index !== 0 ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    className="h-7 w-7"
                    onClick={() => makeCover(url)}
                    aria-label="Definir como capa"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-sm"
                  className="h-7 w-7"
                  onClick={() => removeUrl(url)}
                  aria-label="Remover imagem"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}

          {pending.map((slot) =>
            slot.status === "uploading" ? (
              <div
                key={slot.id}
                className="relative overflow-hidden rounded-lg border border-border bg-background"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slot.preview}
                  alt={slot.name}
                  className="h-28 w-full object-cover opacity-40"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            ) : (
              <button
                key={slot.id}
                type="button"
                onClick={() => dismissError(slot.id)}
                className="flex h-28 flex-col items-center justify-center gap-1 rounded-lg border border-destructive/30 bg-destructive/5 px-2 text-center"
              >
                <TriangleAlert className="h-4 w-4 text-destructive" />
                <span className="text-[11px] leading-tight text-destructive">
                  {slot.error}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Toque para dispensar
                </span>
              </button>
            )
          )}
        </div>
      ) : null}
    </div>
  )
}
