import uuid

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Review(models.Model):
    """
    Avaliacao apos emprestimo (RF020).
    O usuario avalia tanto o item quanto o fornecedor.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    loan = models.ForeignKey(
        "loans.Loan", on_delete=models.CASCADE, related_name="reviews"
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews_given",
    )
    reviewed_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews_received",
    )

    # Notas (1-5 estrelas)
    item_rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Nota para o item (1-5)",
    )
    user_rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Nota para o usuario/fornecedor (1-5)",
    )
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="reviews/", blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    # Soft delete
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Avaliacao"
        verbose_name_plural = "Avaliacoes"
        ordering = ["-created_at"]
        # Um usuario so pode avaliar uma vez por emprestimo
        unique_together = ["loan", "reviewer"]

    def __str__(self):
        return (
            f"Avaliacao de {self.reviewer.username} para {self.reviewed_user.username}"
        )
