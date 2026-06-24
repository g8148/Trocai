from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework import serializers

from .models import User


class UserDetailSerializer(serializers.ModelSerializer):
    """Serializer para detalhes do usuario (usado pelo dj-rest-auth)."""

    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
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
            "average_rating",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "email_verified",
            "phone_verified",
            "average_rating",
            "created_at",
            "updated_at",
        ]

    def get_average_rating(self, obj):
        reviews = obj.reviews_received.all()
        if not reviews.exists():
            return None
        return round(sum(r.user_rating for r in reviews) / reviews.count(), 1)


class CustomRegisterSerializer(RegisterSerializer):
    """Serializer customizado para registro com campos extras."""

    cpf = serializers.CharField(max_length=14, required=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    first_name = serializers.CharField(max_length=150, required=True)
    last_name = serializers.CharField(max_length=150, required=True)
    zip_code = serializers.CharField(max_length=9, required=False, allow_blank=True)
    street = serializers.CharField(max_length=255, required=False, allow_blank=True)
    neighborhood = serializers.CharField(
        max_length=255, required=False, allow_blank=True
    )
    city = serializers.CharField(max_length=255, required=False, allow_blank=True)
    state = serializers.CharField(max_length=2, required=False, allow_blank=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # O username e gerado pelo backend (ver AccountAdapter). Removemos o
        # campo para que nenhum username enviado pelo cliente seja validado nem
        # gere o confuso erro de "nome de usuario ja existe".
        self.fields.pop("username", None)

    def validate_cpf(self, value):
        from .models import User
        if User.objects.filter(cpf=value).exists():
            raise serializers.ValidationError("CPF já cadastrado.")
        return value

    def validate_email(self, value):
        from .models import User
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email já cadastrado.")
        return value

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data.update(
            {
                "cpf": self.validated_data.get("cpf", ""),
                "phone": self.validated_data.get("phone", ""),
                "first_name": self.validated_data.get("first_name", ""),
                "last_name": self.validated_data.get("last_name", ""),
                "zip_code": self.validated_data.get("zip_code", ""),
                "street": self.validated_data.get("street", ""),
                "neighborhood": self.validated_data.get("neighborhood", ""),
                "city": self.validated_data.get("city", ""),
                "state": self.validated_data.get("state", ""),
            }
        )
        return data

    def save(self, request):
        user = super().save(request)
        user.cpf = self.validated_data.get("cpf", "")
        user.phone = self.validated_data.get("phone", "")
        user.zip_code = self.validated_data.get("zip_code", "")
        user.street = self.validated_data.get("street", "")
        user.neighborhood = self.validated_data.get("neighborhood", "")
        user.city = self.validated_data.get("city", "")
        user.state = self.validated_data.get("state", "")
        user.save()
        return user


class UserPublicSerializer(serializers.ModelSerializer):
    """Serializer publico para exibir dados de outros usuarios."""

    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "avatar",
            "city",
            "state",
            "status",
            "average_rating",
            "created_at",
        ]

    def get_average_rating(self, obj):
        reviews = obj.reviews_received.all()
        if not reviews.exists():
            return None
        return round(sum(r.user_rating for r in reviews) / reviews.count(), 1)
