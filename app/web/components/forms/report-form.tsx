"use client"

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import { Check, Flag, Package, RotateCcw, UserRound } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { createReportAction } from "@/lib/app-actions"
import { Button } from "@/components/ui/button"
import { SuccessDialog } from "@/components/success-dialog"

type TargetKind = "item" | "user" | "loan"

type Target = { id: string; label: string }

export type ReportTargets = {
  item: Target | null
  user: Target | null
  loan: Target | null
}

const TARGET_TYPE: Record<TargetKind, "item" | "usuario" | "emprestimo"> = {
  item: "item",
  user: "usuario",
  loan: "emprestimo",
}

const TARGET_META: Record<
  TargetKind,
  { icon: LucideIcon; switchLabel: string; typeLabel: string }
> = {
  item: { icon: Package, switchLabel: "Este item", typeLabel: "Item" },
  user: { icon: UserRound, switchLabel: "O anunciante", typeLabel: "Usuário" },
  loan: { icon: RotateCcw, switchLabel: "Este empréstimo", typeLabel: "Empréstimo" },
}

const REASON_OPTIONS = [
  "Produto não corresponde à descrição",
  "Comportamento ofensivo ou abusivo",
  "Tentativa de golpe ou fraude",
  "Conteúdo inapropriado",
  "Outro motivo",
]

export function ReportForm({ targets }: { targets: ReportTargets }) {
  const available = useMemo(
    () =>
      (["item", "user", "loan"] as TargetKind[]).filter(
        (kind) => targets[kind] !== null
      ),
    [targets]
  )
  const [selected, setSelected] = useState<TargetKind | null>(
    available[0] ?? null
  )
  const [reason, setReason] = useState(REASON_OPTIONS[0])
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (selected === null) {
    return (
      <div className="rounded-[24px] border border-black/5 bg-white p-8 text-center shadow-[0_14px_40px_rgba(17,24,39,0.07)] lg:p-12">
        <div className="mx-auto flex max-w-sm flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fef2f2] text-red-500">
            <Flag className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-[#182034]">
            Comece pela página certa
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#5d6678]">
            As denúncias são feitas a partir de um item, de uma conversa ou de um
            empréstimo. Use o botão &ldquo;Denunciar&rdquo; na página
            correspondente para que possamos analisar o caso certo.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex h-12 items-center rounded-2xl bg-[#10182c] px-6 text-sm font-semibold text-white transition hover:bg-[#10182c]/90"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  const current = targets[selected]!
  const currentMeta = TARGET_META[selected]
  const CurrentIcon = currentMeta.icon

  function submit() {
    setError(null)

    if (!description.trim()) {
      setError("Descreva o motivo da denúncia.")
      return
    }

    const target = targets[selected!]
    if (!target) {
      setError("Selecione um alvo válido para a denúncia.")
      return
    }

    const targetPayload =
      selected === "item"
        ? { target_item: target.id }
        : selected === "user"
          ? { target_user: target.id }
          : { target_loan: target.id }

    startTransition(async () => {
      const result = await createReportAction({
        target_type: TARGET_TYPE[selected!],
        reason,
        description: description.trim(),
        ...targetPayload,
      })

      if (!result.ok) {
        setError(result.error ?? "Não foi possível enviar a denúncia.")
        return
      }

      setShowSuccess(true)
    })
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-[0_14px_40px_rgba(17,24,39,0.07)]">
        {/* Banner de contexto — o alvo da denúncia (elemento-assinatura) */}
        <div className="flex items-center gap-4 border-b border-black/5 bg-[linear-gradient(180deg,#fff7f7_0%,#ffffff_100%)] p-6 lg:px-8">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <CurrentIcon className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-widest text-[#999]">
                Você está denunciando
              </span>
              <span className="rounded-full bg-[#f1f3f6] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#5d6678]">
                {currentMeta.typeLabel}
              </span>
            </div>
            <p className="mt-0.5 truncate text-base font-semibold tracking-[-0.01em] text-[#182034]">
              {current.label}
            </p>
          </div>
        </div>

        <div className="space-y-7 p-6 lg:p-8">
          {available.length > 1 ? (
            <fieldset>
              <legend className="mb-2.5 text-sm font-medium text-[#182034]">
                O que você quer denunciar?
              </legend>
              <div className="grid grid-cols-2 gap-2.5">
                {available.map((kind) => {
                  const Meta = TARGET_META[kind]
                  const active = kind === selected
                  return (
                    <button
                      key={kind}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelected(kind)}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                        active
                          ? "border-[#2fb1c2] bg-[#edfafe] text-[#127888]"
                          : "border-black/10 text-[#5d6678] hover:bg-black/[0.03]"
                      }`}
                    >
                      <Meta.icon className="h-4 w-4" />
                      {Meta.switchLabel}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          ) : null}

          <fieldset>
            <legend className="mb-2.5 text-sm font-medium text-[#182034]">
              Qual é o motivo?
            </legend>
            <div className="space-y-2">
              {REASON_OPTIONS.map((option) => {
                const active = reason === option
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setReason(option)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                      active
                        ? "border-[#2fb1c2] bg-[#edfafe] font-medium text-[#182034]"
                        : "border-black/10 text-[#5d6678] hover:bg-black/[0.03]"
                    }`}
                  >
                    <span>{option}</span>
                    {active ? (
                      <Check className="h-4 w-4 shrink-0 text-[#2fb1c2]" />
                    ) : null}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="report-description"
              className="mb-2.5 block text-sm font-medium text-[#182034]"
            >
              Conte o que aconteceu
            </label>
            <textarea
              id="report-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Descreva a situação com o máximo de detalhes. Quanto mais contexto, mais rápido conseguimos analisar."
              className="min-h-[150px] w-full resize-y rounded-2xl border border-black/10 px-4 py-3 text-sm leading-relaxed text-[#182034] outline-none transition placeholder:text-[#b0b8c5] focus:border-[#2fb1c2] focus:ring-2 focus:ring-[#2fb1c2]/20"
            />
          </div>

          {error ? (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row-reverse sm:items-center sm:justify-between">
            <Button
              type="button"
              onClick={submit}
              disabled={isPending}
              className="h-14 w-full rounded-2xl bg-[#10182c] text-base font-semibold sm:w-auto sm:px-10"
            >
              {isPending ? "Enviando..." : "Enviar denúncia"}
            </Button>
            <p className="text-xs leading-relaxed text-[#8a92a3]">
              Sua denúncia é confidencial e será analisada pela nossa equipe.
            </p>
          </div>
        </div>
      </div>

      <SuccessDialog
        open={showSuccess}
        onOpenChange={setShowSuccess}
        title="Sua denúncia foi enviada com sucesso!"
        description="Nossa equipe irá analisar o caso e tomará as medidas necessárias."
      />
    </>
  )
}
