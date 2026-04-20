from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


class IsParticipant(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Conversation):
            return obj.participants.filter(pk=request.user.pk).exists()

        return obj.conversation.participants.filter(pk=request.user.pk).exists()


@extend_schema(tags=["Chat"])
class ConversationListCreateView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Conversation.objects.filter(participants=self.request.user)
            .prefetch_related("participants", "messages")
            .select_related("item")
            .distinct()
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


@extend_schema(tags=["Chat"])
class ConversationDetailView(generics.RetrieveAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated, IsParticipant]
    queryset = Conversation.objects.prefetch_related("participants", "messages").select_related("item")


@extend_schema(tags=["Chat"])
class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        conversation = generics.get_object_or_404(
            Conversation.objects.prefetch_related("participants"),
            pk=self.kwargs["conversation_id"],
            participants=self.request.user,
        )
        return Message.objects.filter(conversation=conversation).select_related("sender")

    def perform_create(self, serializer):
        conversation = generics.get_object_or_404(
            Conversation.objects.prefetch_related("participants"),
            pk=self.kwargs["conversation_id"],
            participants=self.request.user,
        )
        serializer.save(conversation=conversation, sender=self.request.user)
