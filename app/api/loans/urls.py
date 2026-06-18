from django.urls import path

from . import views

app_name = "loans"

urlpatterns = [
    path('', views.LoanListCreateView.as_view(), name='loan-list'),
    path('<uuid:pk>/', views.LoanDetailView.as_view(), name='loan-detail'),
    path('<uuid:pk>/approve/', views.LoanApproveView.as_view(), name='loan-approve'),
    path('<uuid:pk>/reject/', views.LoanRejectView.as_view(), name='loan-reject'),
    path('<uuid:pk>/cancel/', views.LoanCancelView.as_view(), name='loan-cancel'),
    path('<uuid:pk>/pickup/', views.LoanPickupView.as_view(), name='loan-pickup'),
    path('<uuid:pk>/return/', views.LoanReturnView.as_view(), name='loan-return'),
]
