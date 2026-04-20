import { MobileHeader } from "@/components/mobile-header"
import { RegisterFlow } from "@/components/forms/register-flow"

export default function RegisterPage() {
  return (
    <div className="-mx-8 -my-10 min-h-svh">
      <MobileHeader title="Cadastro" backHref="/login" />
      <div className="px-8 py-8">
        <RegisterFlow />
      </div>
    </div>
  )
}
