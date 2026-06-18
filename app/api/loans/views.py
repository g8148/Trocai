from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from items.models import Item

from .models import Loan
from .serializers import LoanSerializer


@extend_schema(tags=["Empréstimos"])
class LoanListCreateView(generics.ListCreateAPIView):
    """Lista os empréstimos do usuário ou solicita um novo empréstimo."""

    serializer_class = LoanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Loan.objects.filter(
            Q(borrower=user) | Q(lender=user),
            is_deleted=False,
        )

    @transaction.atomic
    def perform_create(self, serializer):
        item = serializer.validated_data["item"]

        if item.is_deleted or not item.is_active:
            raise ValidationError("Item indisponível")

        if item.availability != Item.AvailabilityChoices.AVAILABLE:
            raise ValidationError("Item não disponível")

        serializer.save(borrower=self.request.user, lender=item.owner)
        item.availability = Item.AvailabilityChoices.RESERVED
        item.save()


@extend_schema(tags=["Empréstimos"])
class LoanDetailView(generics.RetrieveAPIView):
    """Retorna os detalhes de um empréstimo específico."""

    serializer_class = LoanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Loan.objects.filter(
            Q(borrower=user) | Q(lender=user),
            is_deleted=False,
        )


@extend_schema(tags=["Empréstimos"])
class LoanApproveView(APIView):
    """Aprova uma solicitação de empréstimo."""

    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        loan = get_object_or_404(Loan, pk=pk, is_deleted=False)

        if request.user != loan.lender:
            return Response(status=status.HTTP_403_FORBIDDEN)

        if loan.status != Loan.StatusChoices.PENDING:
            return Response(
                {"detail": "Apenas empréstimos pendentes podem ser aprovados."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        loan.status = Loan.StatusChoices.APPROVED
        loan.item.availability = Item.AvailabilityChoices.BORROWED
        loan.item.save()
        loan.save()
        return Response(status=status.HTTP_200_OK)


@extend_schema(tags=["Empréstimos"])
class LoanReturnView(APIView):
    """Registra a devolução de um item emprestado."""

    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        loan = get_object_or_404(Loan, pk=pk, is_deleted=False)

        if request.user != loan.lender:
            return Response(status=status.HTTP_403_FORBIDDEN)

        if loan.status not in {
            Loan.StatusChoices.APPROVED,
            Loan.StatusChoices.IN_PROGRESS,
        }:
            return Response(
                {"detail": "Apenas empréstimos aprovados ou em andamento podem ser devolvidos."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        loan.status = Loan.StatusChoices.RETURNED
        loan.actual_return_date = timezone.now()
        loan.item.availability = Item.AvailabilityChoices.AVAILABLE
        loan.item.save()
        loan.save()
        return Response(status=status.HTTP_200_OK)
