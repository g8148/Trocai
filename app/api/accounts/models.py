import uuid

from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.db import models


class User(AbstractUser):
    """
    Usuario customizado do Trocai.
    Estende o AbstractUser do Django com campos adicionais
    conforme requisitos RF006, RF007, RF009, RF010.
    """

    class StatusChoices(models.TextChoices):
        AVAILABLE = "available", "Disponivel"
        AWAY = "away", "Ausente"
        BLOCKED = "blocked", "Bloqueado"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Dados pessoais
    cpf = models.CharField(
        max_length=14,
        unique=True,
        validators=[
            RegexValidator(
                regex=r"^\d{3}\.\d{3}\.\d{3}-\d{2}$",
                message="CPF deve estar no formato 999.999.999-99",
            )
        ],
        help_text="CPF unico do usuario (RNF002)",
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        validators=[
            RegexValidator(
                regex=r"^\(\d{2}\)\s?\d{4,5}-\d{4}$",
                message="Telefone deve estar no formato (99) 99999-9999",
            )
        ],
    )
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)

    # Endereco
    zip_code = models.CharField(max_length=9, blank=True)
    street = models.CharField(max_length=255, blank=True)
    neighborhood = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=255, blank=True)
    state = models.CharField(max_length=2, blank=True)

    # Geolocalizacao (RF001, RF015, RNF011)
    latitude = models.DecimalField(
        max_digits=10, decimal_places=7, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=10, decimal_places=7, null=True, blank=True
    )
    geocoding_failed = models.BooleanField(
        default=False,
        help_text="True quando a geocodificacao falhou para o endereco atual.",
    )

    # Configuracoes do usuario
    search_radius_km = models.PositiveIntegerField(
        default=5,
        help_text="Raio de busca em km (RF001 - padrao 5km)",
    )
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.AVAILABLE,
        help_text="Status de disponibilidade (RF010)",
    )

    # Verificacao (RF009)
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_full_name()} (@{self.username})"

    @property
    def full_address(self):
        parts = [self.street, self.neighborhood, self.city, self.state]
        return ", ".join(p for p in parts if p)
