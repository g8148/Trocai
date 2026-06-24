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
    image_urls = serializers.ListField(
        child=serializers.URLField(max_length=500),
        write_only=True,
        required=False,
    )
    subcategory_name = serializers.CharField(source="subcategory.name", read_only=True)
    category_name = serializers.CharField(
        source="subcategory.category.name", read_only=True
    )
    category_type = serializers.CharField(
        source="subcategory.category.type", read_only=True
    )
    cover_image = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

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
            "average_rating",
            "review_count",
            "images",
            "image_urls",
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
            return cover.image

        first_image = next(iter(obj.images.all()), None)
        return first_image.image if first_image else None

    def get_average_rating(self, obj):
        value = getattr(obj, "avg_item_rating", None)
        return round(value, 1) if value is not None else None

    def get_review_count(self, obj):
        return getattr(obj, "num_reviews", 0)

    def _sync_images(self, item, image_urls):
        ItemImage.objects.filter(item=item).delete()

        for index, image_url in enumerate(image_urls):
            ItemImage.objects.create(
                item=item,
                image=image_url,
                is_cover=index == 0,
            )

    def create(self, validated_data):
        image_urls = validated_data.pop("image_urls", [])
        item = Item.objects.create(**validated_data)

        if image_urls:
            self._sync_images(item, image_urls)

        return item

    def update(self, instance, validated_data):
        image_urls = validated_data.pop("image_urls", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if image_urls is not None:
            self._sync_images(instance, image_urls)

        return instance


class ImageUploadSerializer(serializers.Serializer):
    file = serializers.ImageField()

    def validate_file(self, file):
        if not file.content_type.startswith("image/"):
            raise serializers.ValidationError("Envie apenas imagens.")
        if file.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Imagem deve ter no maximo 5MB.")
        return file
