from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Item, ItemImage

User = get_user_model()


class OwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class ItemImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemImage
        fields = ['id', 'image', 'is_cover']


class ItemSerializer(serializers.ModelSerializer):
    owner = OwnerSerializer(read_only=True)
    images = ItemImageSerializer(many=True, read_only=True)

    class Meta:
        model = Item
        fields = [
            'id', 'name', 'description', 'owner', 'subcategory',
            'segregation', 'condition', 'estimated_value', 'availability',
            'allow_reservation', 'is_active', 'times_borrowed',
            'images', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'owner', 'availability', 'times_borrowed',
            'is_active', 'created_at', 'updated_at',
        ]
