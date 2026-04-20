import { MobileHeader } from "@/components/mobile-header"
import { SupportForm } from "@/components/forms/support-form"

export default function SupportPage() {
  return (
    <div className="pb-8">
      <MobileHeader title="Suporte" backHref="/account" />
      <SupportForm />
    </div>
  )
}
