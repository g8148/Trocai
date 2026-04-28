import Image from "next/image"
import { cn } from "@/lib/utils"

export function AppLogo({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  return (
    <Image
      src="/logo.png"
      alt="Trocaí"
      width={172}
      height={123}
      className={cn(compact ? "h-7 w-auto" : "h-10 w-auto", className)}
      priority
    />
  )
}
