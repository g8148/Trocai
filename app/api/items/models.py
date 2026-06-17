import uuid
from django.conf import settings
from django.db import models
from django.db.models import Avg


class Category(models.Model):
    """Categoria principal de itens (RF014, RF016)."""

    class TypeChoices(models.TextChoices):
        TOOL = "tool", "Ferramenta"
        SERVICE = "service", "Servico"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=TypeChoices.choices)
    icon = models.CharField(max_length=50, blank=True, help_text="Nome do icone")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Categoria"
        verbose_name_plural = "Categorias"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"


class SubCategory(models.Model):
    """Subcategoria de itens (RF016)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="subcategories"
    )
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Subcategoria"
        verbose_name_plural = "Subcategorias"
        ordering = ["name"]

    def __str__(self):
        return f"{self.category.name} > {self.name}"


class Item(models.Model):
    """
    Item disponivel para emprestimo (RF011, RF013).
    Pode ser uma ferramenta ou um servico.
    """

    class SegregationChoices(models.TextChoices):
        HOBBY = "hobby", "Hobby"
        SEMI_PROFESSIONAL = "semi_professional", "Semi Profissional"
        PROFESSIONAL = "professional", "Profissional"

    class ConditionChoices(models.TextChoices):
        NEW = "new", "Novo"
        GOOD = "good", "Bom estado"
        USED = "used", "Usado"
        WORN = "worn", "Desgastado"

    class AvailabilityChoices(models.TextChoices):
        AVAILABLE = "available", "Disponivel"
        BORROWED = "borrowed", "Emprestado"
        RESERVED = "reserved", "Reservado"
        UNAVAILABLE = "unavailable", "Indisponivel"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="items"
    )
    subcategory = models.ForeignKey(
        SubCategory, on_delete=models.SET_NULL, null=True, related_name="items"
    )

    name = models.CharField(max_length=200)
    description = models.TextField()
    segregation = models.CharField(
        max_length=20,
        choices=SegregationChoices.choices,
        default=SegregationChoices.HOBBY,
        help_text="Nivel de uso/qualidade da ferramenta",
    )
    condition = models.CharField(
        max_length=20,
        choices=ConditionChoices.choices,
        default=ConditionChoices.GOOD,
    )
    estimated_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Valor estimado informativo (nao eh venda - RF002)",
    )
    availability = models.CharField(
        max_length=20,
        choices=AvailabilityChoices.choices,
        default=AvailabilityChoices.AVAILABLE,
    )
    allow_reservation = models.BooleanField(
        default=True,
        help_text="Permite reserva antecipada (RF005)",
    )
    is_active = models.BooleanField(default=True)

    # Contadores
    times_borrowed = models.PositiveIntegerField(default=0)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Soft delete
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Item"
        verbose_name_plural = "Itens"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["availability", "is_active"]),
            models.Index(fields=["subcategory"]),
        ]

    def __str__(self):
        return f"{self.name} - {self.owner.username}"
    
    @property
    def average_rating(self):
        from reviews.models import Review 
        return Review.objects.filter(
        loan__item=self
    ).aggregate(
        media=Avg("item_rating")
    )["media"] or 0


class ItemImage(models.Model):
    """Imagens do item."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="images")
    image = models.URLField(max_length=500)
    is_cover = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Imagem do Item"
        verbose_name_plural = "Imagens dos Itens"
        ordering = ["-is_cover", "created_at"]

    def __str__(self):
        return f"Imagem de {self.item.name}"