import uuid

from django.conf import settings
from django.db import models


class Loan(models.Model):
    """
    Emprestimo de item (RF002, RF003, RF005).
    Representa a transacao entre quem empresta e quem pega emprestado.
    """

    class StatusChoices(models.TextChoices):
        PENDING = "pending", "Pendente"
        APPROVED = "approved", "Aprovado"
        REJECTED = "rejected", "Rejeitado"
        IN_PROGRESS = "in_progress", "Em andamento"
        RETURNED = "returned", "Devolvido"
        OVERDUE = "overdue", "Atrasado"
        CANCELLED = "cancelled", "Cancelado"
        DISPUTED = "disputed", "Em disputa"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    item = models.ForeignKey(
        "items.Item", on_delete=models.PROTECT, related_name="loans"
    )
    borrower = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="loans_as_borrower",
        help_text="Usuario que pega emprestado",
    )
    lender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="loans_as_lender",
        help_text="Usuario que empresta (dono do item)",
    )

    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING,
    )

    # Datas
    requested_at = models.DateTimeField(auto_now_add=True)
    pickup_date = models.DateTimeField(help_text="Data/hora combinada para retirada")
    expected_return_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Data/hora prevista para devolucao",
    )
    actual_return_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Data/hora real da devolucao",
    )

    # Observacoes
    borrower_notes = models.TextField(blank=True)
    lender_notes = models.TextField(blank=True)

    # Metadata
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Emprestimo"
        verbose_name_plural = "Emprestimos"
        ordering = ["-requested_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["borrower", "status"]),
            models.Index(fields=["lender", "status"]),
        ]

    def __str__(self):
        return f"{self.item.name}: {self.borrower.username} <- {self.lender.username} ({self.get_status_display()})"


class Reservation(models.Model):
    """
    Reserva antecipada de item (RF005).
    Permite reservar um item que esta emprestado no momento.
    """

    class StatusChoices(models.TextChoices):
        ACTIVE = "active", "Ativa"
        FULFILLED = "fulfilled", "Realizada"
        CANCELLED = "cancelled", "Cancelada"
        EXPIRED = "expired", "Expirada"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    item = models.ForeignKey(
        "items.Item", on_delete=models.CASCADE, related_name="reservations"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reservations",
    )
    loan = models.ForeignKey(
        "loans.Loan",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reservations",
        help_text="Emprestimo vigente que originou esta reserva",
    )
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.ACTIVE,
    )
    desired_date = models.DateTimeField(help_text="Data desejada para o emprestimo")
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Reserva"
        verbose_name_plural = "Reservas"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Reserva: {self.item.name} por {self.user.username}"
