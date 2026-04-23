from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import serializers

from .models import Loan
from .serializers import LoanSerializer


@extend_schema(tags=['Empréstimos'])
class LoanListCreateView(generics.ListCreateAPIView):
    """Lista os empréstimos do usuário ou solicita um novo empréstimo."""
    
    serializer_class = LoanSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Loan.objects.all()

    def perform_create(self, serializer): 
        item = serializer.validated_data['item']

        if item.availability != "available":
            raise serializers.ValidationError("Item not available")

        item.availability = "reserved"
        item.save()

        serializer.save(
            borrower=self.request.user,
            lender=item.owner
        )


@extend_schema(tags=['Empréstimos'])
class LoanDetailView(generics.RetrieveAPIView):
    """Retorna os detalhes de um empréstimo específico."""

    serializer_class = LoanSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Loan.objects.all()


@extend_schema(tags=['Empréstimos'])
class LoanApproveView(APIView):
    """Aprova uma solicitação de empréstimo (somente o dono do item)."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            loan = Loan.objects.get(pk=pk)
        except Loan.DoesNotExist:
            return Response(
                {"detail": "Loan not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if loan.lender != request.user:
            return Response(
                {"detail": "Not allowed"},
                status=status.HTTP_403_FORBIDDEN
            )

        loan.status = "approved"
        loan.save()

        return Response(
            {"detail": "Loan approved"},
            status=status.HTTP_200_OK
        )


@extend_schema(tags=['Empréstimos'])
class LoanReturnView(APIView):
    """Registra a devolução de um item emprestado."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        from django.utils import timezone

        try:
            loan = Loan.objects.get(pk=pk)
        except Loan.DoesNotExist:
            return Response(
                {"detail": "Loan not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if loan.lender != request.user:
            return Response(
                {"detail": "Not allowed"},
                status=status.HTTP_403_FORBIDDEN
            )

        loan.status = "returned"
        loan.actual_return_date = timezone.now()

        loan.item.availability = "available"
        loan.item.save()

        loan.save()

        return Response(
            {"detail": "Loan returned"},
            status=status.HTTP_200_OK
        )
