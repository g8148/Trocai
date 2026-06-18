"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import type { Matcher } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker({
  id,
  value,
  onChange,
  disabled,
  placeholder = "Selecione a data",
}: {
  id?: string
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  disabled?: Matcher | Matcher[]
  placeholder?: string
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          className={cn(
            "flex h-11 w-full items-center gap-2 rounded-lg border border-[#e0e0de] bg-white px-4 text-left text-sm transition-colors hover:bg-[#fafafa] focus-visible:border-[#2fb1c2] focus-visible:ring-1 focus-visible:ring-[#2fb1c2]/40 focus-visible:outline-none",
            !value && "text-[#999]"
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-[#666]" />
          {value
            ? format(value, "dd 'de' MMM 'de' yyyy", { locale: ptBR })
            : placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date)
            setOpen(false)
          }}
          disabled={disabled}
          locale={ptBR}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
