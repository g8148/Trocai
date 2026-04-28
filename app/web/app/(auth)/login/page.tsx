"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { loginAction } from "@/lib/auth-actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <div className="flex min-h-svh items-center justify-center bg-[#f5f5f3] p-6">
      <div className="w-full max-w-90">
        {/* Logo */}
        <div className="mb-9 flex justify-center">
          <Image
            src="/logo.png"
            alt="Trocaí"
            width={172}
            height={123}
            className="h-24 w-auto"
            priority
          />
        </div>

        {/* Título */}
        <h1 className="text-xl font-semibold tracking-tight text-[#111]">
          Bem-vindo de volta
        </h1>
        <p className="mt-1 mb-8 text-sm text-[#999]">
          Entre na sua conta para continuar
        </p>

        {/* Campos */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-[11px] font-medium tracking-widest text-[#666] uppercase"
            >
              Email ou usuário
            </Label>
            <Input
              id="email"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="username"
              className="h-11 rounded-lg border-[#e0e0de] bg-white px-4 text-sm shadow-none focus-visible:border-[#2fb1c2] focus-visible:ring-1 focus-visible:ring-[#2fb1c2]/40"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-[11px] font-medium tracking-widest text-[#666] uppercase"
              >
                Senha
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#2fb1c2] hover:underline"
              >
                Esqueceu?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="h-11 rounded-lg border-[#e0e0de] bg-white px-4 text-sm shadow-none focus-visible:border-[#2fb1c2] focus-visible:ring-1 focus-visible:ring-[#2fb1c2]/40"
            />
          </div>

          {error && (
            <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          <button
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
            className="h-11 w-full rounded-lg bg-[#2fb1c2] text-sm font-medium text-white transition-colors hover:bg-[#26a0b0] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>

          <div className="flex items-center gap-3 py-0.5">
            <div className="flex-1 border-t border-[#e4e4e2]" />
            <span className="text-xs text-[#bbb]">ou</span>
            <div className="flex-1 border-t border-[#e4e4e2]" />
          </div>

          <button
            type="button"
            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-[#e0e0de] bg-white text-sm text-[#333] transition-colors hover:bg-[#fafafa]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-4 w-4 shrink-0"
            >
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Continuar com Google
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-[#999]">
          Ainda não tem conta?{" "}
          <Link
            href="/register"
            className="font-medium text-[#2fb1c2] hover:underline"
          >
            Cadastre-se
          </Link>
        </p>

        <p className="mt-5 text-center text-xs text-[#ccc]">
          Ao continuar você concorda com os{" "}
          <span className="cursor-pointer underline">Termos</span> e a{" "}
          <span className="cursor-pointer underline">Privacidade</span>.
        </p>
      </div>
    </div>
  )
}
