from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

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
        serializer.save(borrower=self.request.user, lender=item.owner)
        # TODO: validar item.availability == 'available', mudar para 'reserved'


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
        # TODO: verificar request.user == loan.lender → 403 se não for
        # TODO: mudar loan.status para 'approved'
        # TODO: mudar item.availability para 'borrowed'
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)


@extend_schema(tags=['Empréstimos'])
class LoanReturnView(APIView):
    """Registra a devolução de um item emprestado."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        # TODO: verificar request.user == loan.lender → 403 se não for
        # TODO: setar actual_return_date = now(), status = 'returned'
        # TODO: mudar item.availability para 'available'
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)
