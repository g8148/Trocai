from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions

from .models import Item
from .serializers import ItemSerializer


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
    permission_classes = [permissions.IsAuthenticated]
    queryset = Item.objects.filter(is_active=True)
    # TODO: implementar IsOwnerOrReadOnly — só o dono pode editar/deletar
