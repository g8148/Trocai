from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = [
        "username",
        "email",
        "first_name",
        "last_name",
        "cpf",
        "city",
        "status",
        "is_active",
    ]
    list_filter = ["status", "is_active", "city", "state"]
    search_fields = ["username", "email", "first_name", "last_name", "cpf"]
    ordering = ["-created_at"]

    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "Dados Trocai",
            {
                "fields": (
                    "cpf",
                    "phone",
                    "avatar",
                    "zip_code",
                    "street",
                    "neighborhood",
                    "city",
                    "state",
                    "latitude",
                    "longitude",
                    "search_radius_km",
                    "status",
                    "email_verified",
                    "phone_verified",
                )
            },
        ),
    )
