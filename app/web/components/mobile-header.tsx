import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { cn } from "@/lib/utils"

export function MobileHeader({
  title,
  backHref,
  right,
  className,
}: {
  title: string
  backHref?: string
  right?: React.ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-black/5 bg-white/90 px-5 backdrop-blur-xl",
        className
      )}
    >
      <div className="w-8">
        {backHref ? (
          <Link
            href={backHref}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#182034] transition hover:bg-black/5"
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Voltar</span>
          </Link>
        ) : null}
      </div>
      <h1 className="flex-1 text-[1.6rem] font-medium tracking-[-0.03em] text-[#182034]">
        {title}
      </h1>
      <div className="flex min-w-8 justify-end">{right}</div>
    </header>
  )
}
