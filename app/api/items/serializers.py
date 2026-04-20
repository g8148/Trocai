from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Category, Item, ItemImage, SubCategory

User = get_user_model()


class OwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "avatar"]


class ItemImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemImage
        fields = ["id", "image", "is_cover"]


class SubCategoryOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = ["id", "name"]


class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubCategoryOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "type", "icon", "subcategories"]


class ItemSerializer(serializers.ModelSerializer):
    owner = OwnerSerializer(read_only=True)
    images = ItemImageSerializer(many=True, read_only=True)
    subcategory_name = serializers.CharField(source="subcategory.name", read_only=True)
    category_name = serializers.CharField(
        source="subcategory.category.name", read_only=True
    )
    category_type = serializers.CharField(
        source="subcategory.category.type", read_only=True
    )
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = [
            "id",
            "name",
            "description",
            "owner",
            "subcategory",
            "subcategory_name",
            "category_name",
            "category_type",
            "segregation",
            "condition",
            "estimated_value",
            "availability",
            "allow_reservation",
            "is_active",
            "times_borrowed",
            "cover_image",
            "images",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "owner",
            "availability",
            "times_borrowed",
            "is_active",
            "created_at",
            "updated_at",
        ]

    def get_cover_image(self, obj):
        cover = next((image for image in obj.images.all() if image.is_cover), None)
        if cover:
            return cover.image.url

        first_image = next(iter(obj.images.all()), None)
        return first_image.image.url if first_image else None
