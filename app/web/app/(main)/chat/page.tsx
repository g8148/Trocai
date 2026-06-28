import { MessageCircle } from "lucide-react"

export default function ChatIndexPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f7f9]">
        <MessageCircle className="h-7 w-7 text-[#2fb1c2]" />
      </div>
      <p className="text-base font-medium text-[#182034]">Selecione uma conversa</p>
      <p className="max-w-xs text-sm text-[#5d6678]">
        Escolha uma conversa à esquerda para ver as mensagens.
      </p>
    </div>
  )
}
