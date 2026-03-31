from rest_framework import generics, permissions

from .models import Item
from .serializers import ItemSerializer


class ItemListCreateView(generics.ListCreateAPIView):
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Item.objects.filter(is_active=True)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
        # TODO: implementar notificações e lógica de disponibilidade


class ItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Item.objects.filter(is_active=True)
    # TODO: implementar IsOwnerOrReadOnly — só o dono pode editar/deletar
