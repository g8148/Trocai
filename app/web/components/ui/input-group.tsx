"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type InputGroupAddonAlign = "block-start" | "block-end" | "inline-end"

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      className={cn("relative", className)}
      {...props}
    />
  )
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="input-group-textarea"
      className={cn(
        "flex min-h-28 w-full rounded-lg border border-input bg-transparent px-3 py-2 pb-10 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

function InputGroupAddon({
  align = "block-end",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  align?: InputGroupAddonAlign
}) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(
        "pointer-events-none absolute text-muted-foreground",
        align === "block-start" && "right-3 top-3",
        align === "block-end" && "bottom-3 right-3",
        align === "inline-end" && "inset-y-0 right-3 flex items-center",
        className
      )}
      {...props}
    />
  )
}

function InputGroupText({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="input-group-text"
      className={cn("text-xs", className)}
      {...props}
    />
  )
}

export { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea }
