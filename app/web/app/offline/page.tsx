import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function OfflinePage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-12">
      <section className="w-full max-w-md rounded-3xl border bg-white p-8 text-center shadow-sm">
        <Image
          src="/logo.png"
          alt="Trocai"
          width={173}
          height={121}
          className="mx-auto mb-6 h-auto w-36"
          priority
        />
        <h1 className="text-2xl font-semibold tracking-tight">Você está offline</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Não foi possível carregar esta página. Verifique sua conexão e tente novamente.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link href="/">Tentar novamente</Link>
        </Button>
      </section>
    </main>
  )
}
