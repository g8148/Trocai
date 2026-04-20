import { MobileHeader } from "@/components/mobile-header"
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <div className="-mx-8 -my-10 min-h-svh">
      <MobileHeader title="Recuperacao de senha" backHref="/login" />
      <div className="px-8 py-10">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
