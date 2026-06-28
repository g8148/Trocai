"use client"

import { Check } from "lucide-react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function SuccessDialog({
  open,
  onOpenChange,
  title,
  description,
  actionLabel = "Entendi",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  actionLabel?: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[min(400px,calc(100%-2rem))] gap-0 rounded-[28px] border-0 p-7 shadow-[0_24px_80px_rgba(16,24,44,0.18)]"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check className="h-6 w-6" strokeWidth={2.5} />
            </span>
          </div>

          <DialogTitle className="mt-5 text-xl font-semibold tracking-[-0.01em] text-[#182034]">
            {title}
          </DialogTitle>

          <DialogDescription className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#5d6678]">
            {description}
          </DialogDescription>

          <DialogClose asChild>
            <Button className="mt-7 h-12 w-full rounded-2xl bg-[#10182c] text-sm font-semibold text-white hover:bg-[#243149]">
              {actionLabel}
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
