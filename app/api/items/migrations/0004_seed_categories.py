from django.db import migrations


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


def seed_categories(apps, schema_editor):
    Category = apps.get_model("items", "Category")
    SubCategory = apps.get_model("items", "SubCategory")

    for entry in SEED_DATA:
        category, _ = Category.objects.get_or_create(
            name=entry["name"],
            defaults={"type": entry["type"]},
        )
        for sub_name in entry["subcategories"]:
            SubCategory.objects.get_or_create(
                category=category,
                name=sub_name,
            )


def remove_categories(apps, schema_editor):
    Category = apps.get_model("items", "Category")
    Category.objects.filter(name__in=[e["name"] for e in SEED_DATA]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("items", "0003_item_deleted_at_item_is_deleted"),
    ]

    operations = [
        migrations.RunPython(seed_categories, reverse_code=remove_categories),
    ]
