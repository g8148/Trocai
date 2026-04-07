import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const MOCK_ITEMS = [
  { id: 1, name: "Furadeira de Impacto", category: "Ferramentas Elétricas", owner: "João S.", status: "Disponível" },
  { id: 2, name: "Cortador de Grama", category: "Jardinagem", owner: "Ana P.", status: "Disponível" },
  { id: 3, name: "Betoneira 120L", category: "Construção", owner: "Carlos M.", status: "Emprestado" },
]

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Itens disponíveis</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_ITEMS.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{item.name}</CardTitle>
                <Badge variant={item.status === "Disponível" ? "default" : "secondary"}>
                  {item.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{item.category}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Dono: {item.owner}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                Ver detalhes
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
