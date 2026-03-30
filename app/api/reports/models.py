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
