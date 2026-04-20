from django.urls import path

from . import views

app_name = "chat"

urlpatterns = [
    path("", views.ConversationListCreateView.as_view(), name="conversation-list"),
    path("<uuid:pk>/", views.ConversationDetailView.as_view(), name="conversation-detail"),
    path(
        "<uuid:conversation_id>/messages/",
        views.MessageListCreateView.as_view(),
        name="message-list",
    ),
]
