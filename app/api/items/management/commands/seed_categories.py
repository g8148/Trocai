from django.core.management.base import BaseCommand

from items.models import Category, SubCategory


SEED_DATA = [
    {
        "name": "Ferramentas Elétricas",
        "type": "tool",
        "subcategories": [
            "Furadeira / Parafusadeira",
            "Serra Circular",
            "Serra Tico-Tico",
            "Esmerilhadeira",
            "Lixadeira",
            "Martelete",
            "Soldador / Maçarico",
        ],
    },
    {
        "name": "Ferramentas Manuais",
        "type": "tool",
        "subcategories": [
            "Martelo / Marreta",
            "Chaves de Fenda e Philips",
            "Alicates",
            "Serras Manuais",
            "Nível / Trena",
            "Formões e Plainas",
        ],
    },
    {
        "name": "Jardinagem",
        "type": "tool",
        "subcategories": [
            "Cortador de Grama",
            "Roçadeira",
            "Soprador / Aspirador de Folhas",
            "Regador / Mangueira",
            "Pás e Enxadas",
        ],
    },
    {
        "name": "Construção e Reforma",
        "type": "tool",
        "subcategories": [
            "Andaime / Escada",
            "Betoneira",
            "Compactador de Solo",
            "Equipamentos de Pintura",
            "Ferramentas de Alvenaria",
        ],
    },
    {
        "name": "Limpeza e Manutenção",
        "type": "tool",
        "subcategories": [
            "Lavadora de Alta Pressão",
            "Aspirador de Pó",
            "Extratora de Carpete",
            "Polidor de Piso",
        ],
    },
    {
        "name": "Equipamentos de Segurança",
        "type": "tool",
        "subcategories": [
            "Capacete e EPIs",
            "Andaime / Cinto de Segurança",
            "Detector de Tensão / Metal",
        ],
    },
    {
        "name": "Serviços Domésticos",
        "type": "service",
        "subcategories": [
            "Faxina / Limpeza",
            "Cozinheiro(a)",
            "Passadoria",
            "Cuidador(a) de Crianças",
            "Cuidador(a) de Idosos",
        ],
    },
    {
        "name": "Serviços de Reparo",
        "type": "service",
        "subcategories": [
            "Eletricista",
            "Encanador",
            "Pintor",
            "Pedreiro / Azulejista",
            "Marceneiro",
            "Vidraceiro",
        ],
    },
    {
        "name": "Serviços Digitais",
        "type": "service",
        "subcategories": [
            "Informática / Suporte Técnico",
            "Design Gráfico",
            "Criação de Sites",
            "Edição de Vídeo / Foto",
        ],
    },
    {
        "name": "Transporte e Fretes",
        "type": "service",
        "subcategories": [
            "Carreto / Mudança",
            "Mototaxi / Entrega",
            "Transporte de Animais",
        ],
    },
    {
        "name": "Aulas e Tutoria",
        "type": "service",
        "subcategories": [
            "Reforço Escolar",
            "Aulas de Idiomas",
            "Aulas de Música",
            "Aulas de Esportes",
        ],
    },
]


class Command(BaseCommand):
    help = "Popula o banco com categorias e subcategorias iniciais"

    def handle(self, *args, **kwargs):
        created_cats = 0
        created_subs = 0

        for entry in SEED_DATA:
            category, cat_created = Category.objects.get_or_create(
                name=entry["name"],
                defaults={"type": entry["type"]},
            )
            if cat_created:
                created_cats += 1
                self.stdout.write(f"  [+] Categoria: {category.name}")

            for sub_name in entry["subcategories"]:
                _, sub_created = SubCategory.objects.get_or_create(
                    category=category,
                    name=sub_name,
                )
                if sub_created:
                    created_subs += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"\nSeed concluido: {created_cats} categorias, {created_subs} subcategorias criadas."
            )
        )
