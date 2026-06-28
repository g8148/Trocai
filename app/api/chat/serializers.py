from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Conversation, Message

User = get_user_model()


class ChatParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "avatar"]


class MessageSerializer(serializers.ModelSerializer):
    sender = ChatParticipantSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ["id", "conversation", "sender", "content", "is_read", "created_at"]
        read_only_fields = ["id", "conversation", "sender", "is_read", "created_at"]


class ConversationSerializer(serializers.ModelSerializer):
    participants = ChatParticipantSerializer(many=True, read_only=True)
    last_message = MessageSerializer(read_only=True)
    item_name = serializers.CharField(source="item.name", read_only=True)
    target_user = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = Conversation
        fields = [
            "id",
            "participants",
            "item",
            "item_name",
            "target_user",
            "last_message",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "participants",
            "last_message",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        request = self.context["request"]
        target_user_id = validated_data.pop("target_user", None)
        item = validated_data.get("item")

        if not target_user_id:
            raise serializers.ValidationError({"target_user": "Target user is required."})

        try:
            target_user = User.objects.get(pk=target_user_id)
        except User.DoesNotExist as exc:
            raise serializers.ValidationError({"target_user": "User not found."}) from exc

        conversation = (
            Conversation.objects.filter(item=item)
            .filter(participants=request.user)
            .filter(participants=target_user)
            .first()
        )

        if conversation:
            return conversation

        conversation = Conversation.objects.create(item=item)
        conversation.participants.set([request.user, target_user])
        return conversation
