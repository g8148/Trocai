import Image from "next/image"
import { cn } from "@/lib/utils"

export function AppLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Trocaí"
      width={172}
      height={123}
      className={cn("h-10 w-auto", className)}
      priority
    />
  )
}
