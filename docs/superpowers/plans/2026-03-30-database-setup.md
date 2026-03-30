# Database Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir os models conforme o spec do CLAUDE.md, gerar todas as migrations e criar o management command de seed de categorias.

**Architecture:** Correções pontuais nos 4 models divergentes, seguidas de `makemigrations` + `migrate` e criação de um management command `seed_categories` com dados realistas.

**Tech Stack:** Python 3.14, Django 6, PostgreSQL 18.3 (Docker Compose)

---

## Arquivos modificados / criados

| Arquivo | Ação |
|---|---|
| `app/api/loans/models.py` | Modificar: `Loan.item` → `PROTECT`; `Reservation` → adicionar FK → Loan |
| `app/api/reports/models.py` | Modificar: substituir `reported_user`/`target_type` genérico por `target_user`, `target_item`, `target_loan` + `clean()` |
| `app/api/notifications/models.py` | Modificar: renomear campo `user` → `recipient` |
| `app/api/items/management/commands/seed_categories.py` | Criar: management command de seed |
| `app/api/loans/migrations/0001_initial.py` | Gerado pelo Django |
| `app/api/reports/migrations/0001_initial.py` | Gerado pelo Django |
| `app/api/notifications/migrations/0001_initial.py` | Gerado pelo Django |
| (demais apps) | Migrations geradas pelo Django |

---

## Task 1: Corrigir `loans.Loan` — `on_delete=PROTECT` no item

**Files:**
- Modify: `app/api/loans/models.py:25-27`

- [ ] **Step 1: Editar o model**

Em `app/api/loans/models.py`, alterar o FK `item`:

```python
item = models.ForeignKey(
    "items.Item", on_delete=models.PROTECT, related_name="loans"
)
```

- [ ] **Step 2: Verificar que não quebrou nada de sintaxe**

```bash
cd app/api && python manage.py check loans
```
Expected: `System check identified no issues (0 silenced).`

---

## Task 2: Adicionar FK → Loan em `loans.Reservation`

**Files:**
- Modify: `app/api/loans/models.py:81-119`

- [ ] **Step 1: Adicionar o campo `loan` ao model Reservation**

Logo após o campo `user`, adicionar:

```python
loan = models.ForeignKey(
    "loans.Loan",
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name="reservations",
    help_text="Emprestimo vigente que originou esta reserva",
)
```

- [ ] **Step 2: Verificar sintaxe**

```bash
cd app/api && python manage.py check loans
```
Expected: `System check identified no issues (0 silenced).`

---

## Task 3: Reestruturar `reports.Report` com FKs separadas + `clean()`

**Files:**
- Modify: `app/api/reports/models.py`

- [ ] **Step 1: Substituir o model Report inteiro**

Reescrever `app/api/reports/models.py`:

```python
import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class Report(models.Model):
    """
    Denuncia de usuario/item/emprestimo (RF021).
    Exatamente um dos tres campos target_* deve ser preenchido.
    """

    class TargetTypeChoices(models.TextChoices):
        USER = "usuario", "Usuario"
        ITEM = "item", "Item"
        LOAN = "emprestimo", "Emprestimo"

    class StatusChoices(models.TextChoices):
        PENDING = "pending", "Pendente"
        REVIEWING = "reviewing", "Em analise"
        RESOLVED = "resolved", "Resolvido"
        DISMISSED = "dismissed", "Descartado"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reports_made",
    )

    target_type = models.CharField(max_length=20, choices=TargetTypeChoices.choices)

    # Exatamente um deve ser preenchido
    target_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="reports_received",
    )
    target_item = models.ForeignKey(
        "items.Item",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="reports",
    )
    target_loan = models.ForeignKey(
        "loans.Loan",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="reports",
    )

    reason = models.TextField()
    description = models.TextField()
    evidence = models.ImageField(upload_to="reports/", blank=True, null=True)

    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING,
    )
    admin_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Denuncia"
        verbose_name_plural = "Denuncias"
        ordering = ["-created_at"]

    def clean(self):
        targets = [self.target_user, self.target_item, self.target_loan]
        filled = [t for t in targets if t is not None]
        if len(filled) != 1:
            raise ValidationError(
                "Exatamente um dos campos target_user, target_item ou target_loan deve ser preenchido."
            )

    def __str__(self):
        return f"Denuncia #{str(self.id)[:8]} por {self.reporter.username}"
```

- [ ] **Step 2: Verificar sintaxe**

```bash
cd app/api && python manage.py check reports
```
Expected: `System check identified no issues (0 silenced).`

---

## Task 4: Renomear `user` → `recipient` em `notifications.Notification`

**Files:**
- Modify: `app/api/notifications/models.py:24-29`

- [ ] **Step 1: Renomear o campo**

Substituir:

```python
user = models.ForeignKey(
    settings.AUTH_USER_MODEL,
    on_delete=models.CASCADE,
    related_name="notifications",
)
```

Por:

```python
recipient = models.ForeignKey(
    settings.AUTH_USER_MODEL,
    on_delete=models.CASCADE,
    related_name="notifications",
)
```

- [ ] **Step 2: Atualizar o `__str__` que usa `self.user`**

```python
def __str__(self):
    return f"{self.get_type_display()} para {self.recipient.username}"
```

- [ ] **Step 3: Atualizar o índice que referencia o campo**

Em `Meta.indexes`, atualizar:

```python
indexes = [
    models.Index(fields=["recipient", "is_read"]),
]
```

- [ ] **Step 4: Verificar sintaxe**

```bash
cd app/api && python manage.py check notifications
```
Expected: `System check identified no issues (0 silenced).`

---

## Task 5: Check global antes de gerar migrations

- [ ] **Step 1: Rodar check em todos os apps**

```bash
cd app/api && python manage.py check
```
Expected: `System check identified no issues (0 silenced).`

Se houver erros, corrigi-los antes de continuar.

---

## Task 6: Gerar migrations para todos os apps

- [ ] **Step 1: makemigrations**

```bash
cd app/api && python manage.py makemigrations accounts items loans reviews notifications reports chat
```
Expected: uma linha `Migrations for '<app>':` para cada app, com os arquivos de migration listados.

- [ ] **Step 2: Confirmar que os arquivos foram criados**

```bash
ls app/api/accounts/migrations/ app/api/items/migrations/ app/api/loans/migrations/ app/api/reviews/migrations/ app/api/notifications/migrations/ app/api/reports/migrations/ app/api/chat/migrations/
```
Expected: cada pasta contém `__init__.py` e `0001_initial.py`.

---

## Task 7: Criar management command `seed_categories`

**Files:**
- Create: `app/api/items/management/__init__.py`
- Create: `app/api/items/management/commands/__init__.py`
- Create: `app/api/items/management/commands/seed_categories.py`

- [ ] **Step 1: Criar estrutura de diretórios e arquivos `__init__.py`**

```bash
mkdir -p app/api/items/management/commands
touch app/api/items/management/__init__.py
touch app/api/items/management/commands/__init__.py
```

- [ ] **Step 2: Criar o arquivo do command**

Criar `app/api/items/management/commands/seed_categories.py`:

```python
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
```

- [ ] **Step 3: Verificar que o command é reconhecido pelo Django**

```bash
cd app/api && python manage.py help seed_categories
```
Expected: linha de help do command sem erros de importação.

---

## Task 8: Subir o PostgreSQL e rodar as migrations

> **Pré-requisito:** Docker instalado e rodando.

- [ ] **Step 1: Subir o banco**

```bash
cd app/api && docker compose up -d db
```
Expected: container `trocai-db` em estado `healthy`.

- [ ] **Step 2: Confirmar que o banco está acessível**

```bash
docker exec trocai-db pg_isready -U trocai -d trocai
```
Expected: `trocai:5432 - accepting connections`

- [ ] **Step 3: Garantir que o arquivo `.env` existe**

```bash
ls app/api/.env
```
Se não existir, copiar o exemplo e preencher `SECRET_KEY`:

```bash
cp app/api/.env.example app/api/.env
# Editar app/api/.env: trocar SECRET_KEY por uma string longa qualquer
```

- [ ] **Step 4: Rodar as migrations**

```bash
cd app/api && python manage.py migrate
```
Expected: cada linha termina com `OK`.

- [ ] **Step 5: Rodar o seed de categorias**

```bash
cd app/api && python manage.py seed_categories
```
Expected: lista de categorias criadas + `Seed concluido: 11 categorias, X subcategorias criadas.`

---

## Task 9: Commit

- [ ] **Step 1: Adicionar os arquivos alterados e novos**

```bash
git add app/api/loans/models.py \
        app/api/reports/models.py \
        app/api/notifications/models.py \
        app/api/items/management/ \
        app/api/accounts/migrations/ \
        app/api/items/migrations/ \
        app/api/loans/migrations/ \
        app/api/reviews/migrations/ \
        app/api/notifications/migrations/ \
        app/api/reports/migrations/ \
        app/api/chat/migrations/ \
        docs/superpowers/
```

- [ ] **Step 2: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(db): corrige models, gera migrations e adiciona seed de categorias

- Loan.item usa PROTECT para evitar exclusão acidental de itens com empréstimos
- Reservation recebe FK opcional para Loan vigente
- Report reestruturado com target_user/item/loan + clean() de validação
- Notification.user renomeado para recipient
- Management command seed_categories com 11 categorias e subcategorias

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```
