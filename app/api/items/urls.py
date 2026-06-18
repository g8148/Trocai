from django.urls import path

from . import views

app_name = "items"

urlpatterns = [
    path("categories/", views.CategoryListView.as_view(), name="category-list"),
    path("images/upload/", views.ItemImageUploadView.as_view(), name="image-upload"),
    path("", views.ItemListCreateView.as_view(), name="item-list"),
    path("<uuid:pk>/", views.ItemDetailView.as_view(), name="item-detail"),
]
