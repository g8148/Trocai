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
from notifications.models import Notification

from .models import Loan
from .serializers import LoanSerializer


def _notify(recipient, notification_type, title, message, loan):
    Notification.objects.create(
        recipient=recipient,
        type=notification_type,
        title=title,
        message=message,
        related_object_type="loan",
        related_object_id=loan.id,
    )


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

        if item.owner == self.request.user:
            raise ValidationError("Você não pode solicitar o empréstimo do próprio item.")

        if item.is_deleted or not item.is_active:
            raise ValidationError("Item indisponível")

        if item.availability != Item.AvailabilityChoices.AVAILABLE:
            raise ValidationError("Item não disponível")

        loan = serializer.save(borrower=self.request.user, lender=item.owner)
        item.availability = Item.AvailabilityChoices.RESERVED
        item.save()

        _notify(
            recipient=item.owner,
            notification_type=Notification.TypeChoices.LOAN_REQUEST,
            title="Nova solicitação de empréstimo",
            message=f"{self.request.user.first_name or self.request.user.username} quer pegar emprestado: {item.name}.",
            loan=loan,
        )


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

        _notify(
            recipient=loan.borrower,
            notification_type=Notification.TypeChoices.LOAN_APPROVED,
            title="Empréstimo aprovado",
            message=f"{loan.lender.first_name or loan.lender.username} aprovou seu pedido de empréstimo de {loan.item.name}.",
            loan=loan,
        )

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

        _notify(
            recipient=loan.borrower,
            notification_type=Notification.TypeChoices.RETURN_REMINDER,
            title="Devolução confirmada",
            message=f"A devolução de {loan.item.name} foi registrada. Não esqueça de deixar uma avaliação!",
            loan=loan,
        )

        return Response(status=status.HTTP_200_OK)


@extend_schema(tags=["Empréstimos"])
class LoanRejectView(APIView):
    """Rejeita uma solicitação de empréstimo (somente o dono do item)."""

    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        loan = get_object_or_404(Loan, pk=pk, is_deleted=False)

        if request.user != loan.lender:
            return Response(status=status.HTTP_403_FORBIDDEN)

        if loan.status != Loan.StatusChoices.PENDING:
            return Response(
                {"detail": "Apenas empréstimos pendentes podem ser rejeitados."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        loan.status = Loan.StatusChoices.REJECTED
        loan.item.availability = Item.AvailabilityChoices.AVAILABLE
        loan.item.save()
        loan.save()

        _notify(
            recipient=loan.borrower,
            notification_type=Notification.TypeChoices.LOAN_REJECTED,
            title="Solicitação recusada",
            message=f"{loan.lender.first_name or loan.lender.username} não pôde atender seu pedido de empréstimo de {loan.item.name}.",
            loan=loan,
        )

        return Response(status=status.HTTP_200_OK)


@extend_schema(tags=["Empréstimos"])
class LoanCancelView(APIView):
    """Cancela um empréstimo antes da retirada (somente o solicitante)."""

    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        loan = get_object_or_404(Loan, pk=pk, is_deleted=False)

        if request.user != loan.borrower:
            return Response(status=status.HTTP_403_FORBIDDEN)

        if loan.status not in {
            Loan.StatusChoices.PENDING,
            Loan.StatusChoices.APPROVED,
        }:
            return Response(
                {"detail": "Apenas empréstimos pendentes ou aprovados podem ser cancelados."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        loan.status = Loan.StatusChoices.CANCELLED
        loan.item.availability = Item.AvailabilityChoices.AVAILABLE
        loan.item.save()
        loan.save()

        _notify(
            recipient=loan.lender,
            notification_type=Notification.TypeChoices.LOAN_REQUEST,
            title="Solicitação cancelada",
            message=f"{loan.borrower.first_name or loan.borrower.username} cancelou o pedido de empréstimo de {loan.item.name}.",
            loan=loan,
        )

        return Response(status=status.HTTP_200_OK)


@extend_schema(tags=["Empréstimos"])
class LoanPickupView(APIView):
    """Confirma a retirada do item pelo solicitante (somente o solicitante)."""

    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        loan = get_object_or_404(Loan, pk=pk, is_deleted=False)

        if request.user != loan.borrower:
            return Response(status=status.HTTP_403_FORBIDDEN)

        if loan.status != Loan.StatusChoices.APPROVED:
            return Response(
                {"detail": "Apenas empréstimos aprovados podem ter a retirada confirmada."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        loan.status = Loan.StatusChoices.IN_PROGRESS
        loan.save()

        _notify(
            recipient=loan.lender,
            notification_type=Notification.TypeChoices.LOAN_APPROVED,
            title="Item retirado",
            message=f"{loan.borrower.first_name or loan.borrower.username} confirmou a retirada de {loan.item.name}.",
            loan=loan,
        )

        return Response(status=status.HTTP_200_OK)
