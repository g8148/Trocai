from django.contrib import admin

from .models import Category, Item, ItemImage, SubCategory


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "type", "created_at"]
    list_filter = ["type"]
    search_fields = ["name"]


@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "created_at"]
    list_filter = ["category"]
    search_fields = ["name"]


class ItemImageInline(admin.TabularInline):
    model = ItemImage
    extra = 1


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "owner",
        "subcategory",
        "availability",
        "segregation",
        "times_borrowed",
        "is_active",
    ]
    list_filter = ["availability", "segregation", "condition", "is_active"]
    search_fields = ["name", "description"]
    inlines = [ItemImageInline]
