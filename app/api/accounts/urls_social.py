from django.urls import path

from . import views

urlpatterns = [
    path("google/", views.GoogleLoginView.as_view(), name="google-login"),
    # Apple e Microsoft serao adicionados quando os client IDs forem configurados
    # path("apple/", views.AppleLoginView.as_view(), name="apple-login"),
    # path("microsoft/", views.MicrosoftLoginView.as_view(), name="microsoft-login"),
]
