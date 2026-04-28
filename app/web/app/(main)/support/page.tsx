import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { SupportForm } from "@/components/forms/support-form"

export default function SupportPage() {
  return (
    <div className="pb-8">
      <div className="flex items-center gap-2 px-4 pb-3 pt-4">
        <Link
          href="/account"
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#5d6678] transition hover:bg-black/5"
        >
          <ChevronLeft size={18} />
          <span className="sr-only">Voltar</span>
        </Link>
        <p className="text-base font-semibold text-[#182034]">Central de ajuda</p>
      </div>
      <SupportForm />
    </div>
  )
}
