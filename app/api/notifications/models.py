import uuid

from django.conf import settings
from django.db import models


class Notification(models.Model):
    """
    Notificacoes do sistema (RF004).
    Lembrar sobre prazos, novas solicitacoes, confirmacoes, etc.
    """

    class TypeChoices(models.TextChoices):
        LOAN_REQUEST = "loan_request", "Solicitacao de emprestimo"
        LOAN_APPROVED = "loan_approved", "Emprestimo aprovado"
        LOAN_REJECTED = "loan_rejected", "Emprestimo rejeitado"
        RETURN_REMINDER = "return_reminder", "Lembrete de devolucao"
        RETURN_OVERDUE = "return_overdue", "Devolucao atrasada"
        RESERVATION = "reservation", "Nova reserva"
        NEW_MESSAGE = "new_message", "Nova mensagem"
        REVIEW = "review", "Nova avaliacao"
        SYSTEM = "system", "Sistema"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    type = models.CharField(max_length=30, choices=TypeChoices.choices)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)

    # Link opcional para o objeto relacionado
    related_object_type = models.CharField(max_length=50, blank=True)
    related_object_id = models.UUIDField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Notificacao"
        verbose_name_plural = "Notificacoes"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["recipient", "is_read"]),
        ]

    def __str__(self):
        return f"{self.get_type_display()} para {self.recipient.username}"
