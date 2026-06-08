"use client"

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
  actionLabel,
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
        className="max-w-[min(360px,calc(100%-2rem))] rounded-[34px] border-0 px-8 py-18 text-center shadow-[0_24px_80px_rgba(16,24,44,0.18)]"
        showCloseButton
      >
        <DialogTitle className="text-[2rem] font-medium tracking-[-0.05em] text-[#182034]">
          {title}
        </DialogTitle>
        <DialogDescription className="mt-6 whitespace-pre-line text-[1.55rem] leading-[1.28] tracking-[-0.04em] text-[#182034]">
          {description}
        </DialogDescription>
        {actionLabel ? (
          <DialogClose asChild>
            <Button className="mt-6 h-12 rounded-2xl bg-[#10182c] text-sm font-semibold text-white hover:bg-[#243149]">
              {actionLabel}
            </Button>
          </DialogClose>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
