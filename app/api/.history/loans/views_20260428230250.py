from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.exceptions import ValidationError


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
            raise ValidationError("Item não disponível")
        
        # if not item.allow_reservation:
            # raise ValidationError("Item não permite reserva")
        serializer.save(borrower=self.request.user, lender=item.owner) # cria o emprestimo
        # TODO: validar item.availability == 'available', mudar para 'reserved'

        item.availability = "reserved" # muda para reservado
        item.save()

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
        loan = get_object_or_404(Loan, pk=pk)
        if request.user != loan.lender: # TODO: verificar request.user == loan.lender → 403 se não for
            return Response(status=status.HTTP_403_FORBIDDEN) 
        loan.status = "approved" # TODO: mudar loan.status para 'approved'
        loan.item.availability = "borrowed" # TODO: mudar item.availability para 'borrowed'

        loan.item.save()
        loan.save()
        return Response(status=status.HTTP_200_OK)



@extend_schema(tags=['Empréstimos'])
class LoanReturnView(APIView):
    """Registra a devolução de um item emprestado."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        loan = get_object_or_404(Loan, pk=pk)

        if request.user != loan.lender: # TODO: verificar request.user == loan.lender → 403 se não for
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        loan.status = "returned"
        loan.actual_return_date = timezone.now() # TODO: setar actual_return_date = now(), status = 'returned'
        loan.item.availability = "available" # TODO: mudar item.availability para 'available'

        loan.item.save()
        loan.save()
        return Response(status=status.HTTP_200_OK)
