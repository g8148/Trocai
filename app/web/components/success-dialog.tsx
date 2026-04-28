"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

export function SuccessDialog({
  open,
  onOpenChange,
  title,
  description,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
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
      </DialogContent>
    </Dialog>
  )
}
