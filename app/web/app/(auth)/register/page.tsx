import { RegisterFlow } from "@/components/forms/register-flow"

export default function RegisterPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-white px-6 py-10">
      <div className="w-full max-w-md">
        <RegisterFlow />
      </div>
    </div>
  )
}
