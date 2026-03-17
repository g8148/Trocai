from django.urls import path

from . import views

app_name = "accounts"

urlpatterns = [
    path("me/", views.UserMeView.as_view(), name="user-me"),
    path("<uuid:pk>/", views.UserPublicView.as_view(), name="user-public"),
]
