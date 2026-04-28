import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-svh bg-[#f5f5f3] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="mb-6">
              <Link
                href="/login"
                className="flex items-center gap-1 text-sm text-[#5d6678] hover:text-[#182034] transition"
              >
                <ChevronLeft size={16} />
                Voltar para login
              </Link>
            </div>
            <ForgotPasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
