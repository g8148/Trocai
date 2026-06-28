import math
import os
import uuid

from django.core.files.storage import default_storage
from django.db.models import Avg, Count, Q
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions, status
from rest_framework.permissions import SAFE_METHODS, BasePermission
from rest_framework.response import Response

from .models import Category, Item
from .serializers import CategorySerializer, ImageUploadSerializer, ItemSerializer


def _haversine_km(lat1, lon1, lat2, lon2):
    """Distância em km entre dois pontos (lat/lon em graus) pela fórmula de Haversine."""
    r = 6371.0  # raio médio da Terra em km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        return obj.owner == request.user


@extend_schema(tags=["Itens"])
class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Category.objects.prefetch_related("subcategories").order_by("name")

    def get_queryset(self):
        queryset = super().get_queryset()
        category_type = self.request.query_params.get("type")

        if category_type in {"tool", "service"}:
            queryset = queryset.filter(type=category_type)

        return queryset


@extend_schema(tags=["Itens"])
class ItemListCreateView(generics.ListCreateAPIView):
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Item.objects.select_related(
        "owner", "subcategory", "subcategory__category"
    ).prefetch_related("images")

    def get_queryset(self):
        queryset = self.queryset.filter(is_active=True, is_deleted=False)
        p = self.request.query_params

        category_type = p.get("type")
        owner_id = p.get("owner")
        search = p.get("search")
        condition = p.get("condition")
        availability = p.get("availability")
        segregation = p.get("segregation")

        if category_type in {"tool", "service"}:
            queryset = queryset.filter(subcategory__category__type=category_type)

        if owner_id == "me" and self.request.user.is_authenticated:
            queryset = queryset.filter(owner=self.request.user)
        elif owner_id:
            queryset = queryset.filter(owner_id=owner_id)

        if condition in {"new", "good", "used", "worn"}:
            queryset = queryset.filter(condition=condition)

        if availability in {"available", "borrowed", "reserved", "unavailable"}:
            queryset = queryset.filter(availability=availability)

        if segregation in {"hobby", "semi_professional", "professional"}:
            queryset = queryset.filter(segregation=segregation)

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(subcategory__name__icontains=search)
                | Q(subcategory__category__name__icontains=search)
            )

        user = self.request.user
        nearby = p.get("nearby") in {"1", "true"}
        if (
            nearby  # opt-in: só filtra por distância quando o cliente pede
            and user.is_authenticated
            and user.latitude is not None
            and user.longitude is not None
            and not owner_id  # não filtrar por distância se buscando itens de alguém específico
        ):
            queryset = self._filter_by_distance(queryset, user)

        queryset = queryset.annotate(
            avg_item_rating=Avg(
                "loans__reviews__item_rating",
                filter=Q(loans__reviews__is_deleted=False),
            ),
            num_reviews=Count(
                "loans__reviews",
                filter=Q(loans__reviews__is_deleted=False),
            ),
        )

        return queryset.order_by("-created_at")

    def _filter_by_distance(self, queryset, user):
        u_lat = float(user.latitude)
        u_lon = float(user.longitude)
        radius = user.search_radius_km

        # 1ª passada (no banco): caixa delimitadora barata para reduzir o conjunto.
        # 1° lat ≈ 111.32 km; longitude encolhe pelo cosseno da latitude.
        lat_delta = radius / 111.32
        lon_delta = radius / (111.32 * math.cos(math.radians(u_lat)))

        queryset = queryset.filter(
            owner__latitude__isnull=False,
            owner__longitude__isnull=False,
            owner__latitude__range=(u_lat - lat_delta, u_lat + lat_delta),
            owner__longitude__range=(u_lon - lon_delta, u_lon + lon_delta),
        )

        # 2ª passada (Haversine, raio real): a caixa é um quadrado, então recorta
        # os cantos que passam do raio. Mantém como queryset via id__in para não
        # quebrar paginação/annotations a jusante.
        near_ids = [
            item.id
            for item in queryset.only(
                "id", "owner__latitude", "owner__longitude"
            )
            if _haversine_km(
                u_lat, u_lon, item.owner.latitude, item.owner.longitude
            )
            <= radius
        ]
        return queryset.filter(id__in=near_ids)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


@extend_schema(tags=["Itens"])
class ItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    queryset = (
        Item.objects.select_related("owner", "subcategory", "subcategory__category")
        .prefetch_related("images")
        .annotate(
            avg_item_rating=Avg(
                "loans__reviews__item_rating",
                filter=Q(loans__reviews__is_deleted=False),
            ),
            num_reviews=Count(
                "loans__reviews",
                filter=Q(loans__reviews__is_deleted=False),
            ),
        )
        .filter(is_active=True, is_deleted=False)
    )

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.is_deleted = True
        instance.deleted_at = timezone.now()
        instance.availability = Item.AvailabilityChoices.UNAVAILABLE
        instance.save()


@extend_schema(tags=["Itens"])
class ItemImageUploadView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ImageUploadSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        file = serializer.validated_data["file"]
        # Nome cru (com espacos/acentos/virgulas) gera URLs frageis e pode colidir.
        # Gera um nome unico e seguro, preservando apenas a extensao.
        extension = os.path.splitext(file.name)[1].lower()
        filename = f"{uuid.uuid4().hex}{extension}"
        path = default_storage.save(f"items/{request.user.id}/{filename}", file)
        url = request.build_absolute_uri(default_storage.url(path))
        return Response({"url": url}, status=status.HTTP_201_CREATED)
