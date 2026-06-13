"use client"

import * as React from "react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type FieldOrientation = "vertical" | "horizontal"

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & {
  orientation?: FieldOrientation
}) {
  return (
    <div
      data-slot="field"
      data-orientation={orientation}
      className={cn(
        "group/field grid gap-2",
        orientation === "horizontal" && "flex items-center gap-3",
        className
      )}
      {...props}
    />
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn("flex flex-col gap-6", className)}
      {...props}
    />
  )
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "group-data-[invalid=true]/field:text-destructive",
        className
      )}
      {...props}
    />
  )
}

function FieldDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-xs leading-5 text-muted-foreground", className)}
      {...props}
    />
  )
}

function normalizeErrors(errors: unknown): string[] {
  if (!errors) {
    return []
  }

  if (Array.isArray(errors)) {
    return errors.flatMap((error) => normalizeErrors(error))
  }

  if (typeof errors === "string") {
    return errors ? [errors] : []
  }

  if (errors instanceof Error) {
    return errors.message ? [errors.message] : []
  }

  return [String(errors)]
}

function FieldError({
  className,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: unknown
}) {
  const messages = Array.from(new Set(normalizeErrors(errors))).filter(Boolean)

  if (messages.length === 0) {
    return null
  }

  return (
    <div
      data-slot="field-error"
      className={cn("grid gap-1", className)}
      {...props}
    >
      {messages.map((message) => (
        <p key={message} className="text-xs text-destructive">
          {message}
        </p>
      ))}
    </div>
  )
}

export { Field, FieldDescription, FieldError, FieldGroup, FieldLabel }
