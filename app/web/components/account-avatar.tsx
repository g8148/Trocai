"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Camera, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { uploadAvatarAction } from "@/lib/app-actions"

const MAX_FILE_SIZE = 5 * 1024 * 1024

export function AccountAvatar({
  avatarUrl,
  initial,
  name,
}: {
  avatarUrl: string | null
  initial: string
  name: string
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, startTransition] = useTransition()

  const shownImage = preview ?? avatarUrl

  function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("O arquivo precisa ser uma imagem.")
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("A imagem deve ter no máximo 5 MB.")
      return
    }

    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)

    startTransition(async () => {
      const formData = new FormData()
      formData.append("avatar", file)
      const result = await uploadAvatarAction(formData)
      URL.revokeObjectURL(localPreview)

      if (!result.ok) {
        setPreview(null)
        toast.error(result.error)
        return
      }

      toast.success("Foto atualizada.")
      router.refresh()
    })
  }

  return (
    <div className="relative h-28 w-28">
      <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[#10182c] text-3xl font-bold text-white">
        {shownImage ? (
          <img
            src={shownImage}
            alt={name}
            className={`h-full w-full object-cover transition ${
              isUploading ? "opacity-60" : ""
            }`}
          />
        ) : (
          initial
        )}
        {isUploading ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </span>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        aria-label="Trocar foto"
        className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#2fb1c2] text-white shadow-sm transition hover:bg-[#26a0b0] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Camera className="h-4 w-4" />
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleSelect}
        className="hidden"
      />
    </div>
  )
}
