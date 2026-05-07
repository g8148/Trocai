from django.db.models import Q
from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions
from rest_framework.permissions import SAFE_METHODS, BasePermission

from .models import Category, Item
from .serializers import CategorySerializer, ItemSerializer


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
        queryset = self.queryset.filter(is_active=True)
        search = self.request.query_params.get("search")
        category_type = self.request.query_params.get("type")
        owner_id = self.request.query_params.get("owner")

        if category_type in {"tool", "service"}:
            queryset = queryset.filter(subcategory__category__type=category_type)

        if owner_id == "me" and self.request.user.is_authenticated:
            queryset = queryset.filter(owner=self.request.user)
        elif owner_id:
            queryset = queryset.filter(owner_id=owner_id)

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(subcategory__name__icontains=search)
                | Q(subcategory__category__name__icontains=search)
            )

        return queryset.order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


@extend_schema(tags=["Itens"])
class ItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    queryset = Item.objects.select_related(
        "owner", "subcategory", "subcategory__category"
    ).prefetch_related("images").filter(is_active=True)
