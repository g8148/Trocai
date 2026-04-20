"use client"

import Link from "next/link"
import { Apple, Mail, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { loginAction } from "@/lib/auth-actions"
import { AppLogo } from "@/components/app-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const router = useRouter()
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const socialButtons = [
    { icon: Apple, label: "Entrar com a Apple" },
    { icon: Mail, label: "Entrar com a Google" },
    { icon: Search, label: "Entrar com a Microsoft" },
  ]

  return (
    <div className="flex min-h-[calc(100svh-5rem)] flex-col justify-between">
      <div className="space-y-10 pt-10">
        <div className="flex justify-center">
          <AppLogo />
        </div>

        <div className="space-y-3">
          <Input
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            className="h-12 rounded-2xl border-black/10 px-4 text-base"
            placeholder="Email ou usuario"
          />
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 rounded-2xl border-black/10 px-4 text-base"
            placeholder="Senha"
          />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <Button
            type="button"
            disabled={isSubmitting || !login || !password}
            onClick={async () => {
              setIsSubmitting(true)
              setError(null)
              const result = await loginAction({ login, password })
              setIsSubmitting(false)

              if (result.error) {
                setError(result.error)
                return
              }

              router.push("/")
            }}
            className="mt-2 h-14 w-full rounded-2xl bg-[#10182c] text-base font-semibold"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </div>

        <div className="space-y-2">
          {socialButtons.map(({ icon: Icon, label }) => (
            <Button
              key={label}
              type="button"
              variant="outline"
              className="h-12 w-full rounded-2xl border-black/10 text-[1rem]"
            >
              <Icon className="mr-2 h-5 w-5" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pb-6 pt-10 text-center text-[#182034]">
        <p className="text-[1rem]">
          Ainda nao tem uma conta?{" "}
          <Link href="/register" className="font-semibold">
            Cadastre-se
          </Link>
        </p>
        <Link href="/forgot-password" className="block text-[1rem] text-[#5d6678]">
          Esqueceu a senha?
        </Link>
        <p className="text-sm leading-6 text-[#5d6678]">
          Ao continuar, voce concorda com os Termos de Servico e a Politica de Privacidade.
        </p>
      </div>
    </div>
  )
}
