from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions

from .models import User
from .serializers import UserDetailSerializer, UserPublicSerializer


@extend_schema(tags=['Usuários'])
class UserMeView(generics.RetrieveUpdateAPIView):
    """Retorna ou atualiza os dados do usuário autenticado."""

    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


@extend_schema(tags=['Usuários'])
class UserPublicView(generics.RetrieveAPIView):
    """Retorna os dados públicos de um usuário pelo ID."""

    queryset = User.objects.all()
    serializer_class = UserPublicSerializer
    permission_classes = [permissions.IsAuthenticated]


@extend_schema(tags=['Autenticação'])
class GoogleLoginView(SocialLoginView):
    """Realiza login via Google OAuth2 e retorna tokens JWT."""

    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
