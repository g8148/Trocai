from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions
from rest_framework.permissions import BasePermission, SAFE_METHODS


from .models import Item
from .serializers import ItemSerializer


class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        # leitura liberada
        if request.method in SAFE_METHODS:
            return True

        # só o dono pode editar/deletar
        return obj.owner == request.user

@extend_schema(tags=['Itens'])
class ItemListCreateView(generics.ListCreateAPIView):
    """Lista todos os itens disponíveis ou cadastra um novo item."""

    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Item.objects.filter(is_active=True) 

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
        # TODO: implementar notificações e lógica de disponibilidade


@extend_schema(tags=['Itens'])
class ItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retorna, atualiza ou remove um item específico."""

    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    queryset = Item.objects.filter(is_active=True)
    # TODO: implementar IsOwnerOrReadOnly — só o dono pode editar/deletar
