import uuid

from django.conf import settings
from django.db import models


class Report(models.Model):
    """
    Denuncia de usuario/item/conversa (RF021).
    """

    class TargetTypeChoices(models.TextChoices):
        USER = "user", "Usuario"
        ITEM = "item", "Produto ou Servico"
        CONVERSATION = "conversation", "Conversa / Comportamento"
        OTHER = "other", "Outro"

    class ReasonChoices(models.TextChoices):
        WRONG_DESCRIPTION = "wrong_description", "Produto nao corresponde a descricao"
        OFFENSIVE = "offensive", "Comportamento ofensivo ou abusivo"
        FRAUD = "fraud", "Tentativa de golpe ou fraude"
        INAPPROPRIATE = "inappropriate", "Conteudo inapropriado"
        OTHER = "other", "Outro motivo"

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
    reported_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reports_received",
        null=True,
        blank=True,
    )

    target_type = models.CharField(max_length=20, choices=TargetTypeChoices.choices)
    reason = models.CharField(max_length=30, choices=ReasonChoices.choices)
    description = models.TextField()
    image = models.ImageField(upload_to="reports/", blank=True, null=True)

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

    def __str__(self):
        return f"Denuncia #{str(self.id)[:8]} por {self.reporter.username}"
