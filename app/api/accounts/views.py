from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from rest_framework import generics, permissions

from .models import User
from .serializers import UserDetailSerializer, UserPublicSerializer


class UserMeView(generics.RetrieveUpdateAPIView):
    """Retorna/atualiza os dados do usuario autenticado."""

    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserPublicView(generics.RetrieveAPIView):
    """Retorna dados publicos de um usuario."""

    queryset = User.objects.all()
    serializer_class = UserPublicSerializer
    permission_classes = [permissions.IsAuthenticated]


class GoogleLoginView(SocialLoginView):
    """Login via Google OAuth2."""

    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
