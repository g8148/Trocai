from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Loan
from .serializers import LoanSerializer


class LoanListCreateView(generics.ListCreateAPIView):
    serializer_class = LoanSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Loan.objects.all()

    def perform_create(self, serializer):
        item = serializer.validated_data['item']
        serializer.save(borrower=self.request.user, lender=item.owner)
        # TODO: validar item.availability == 'available', mudar para 'reserved'


class LoanDetailView(generics.RetrieveAPIView):
    serializer_class = LoanSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Loan.objects.all()


class LoanApproveView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        # TODO: verificar request.user == loan.lender → 403 se não for
        # TODO: mudar loan.status para 'approved'
        # TODO: mudar item.availability para 'borrowed'
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)


class LoanReturnView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        # TODO: verificar request.user == loan.lender → 403 se não for
        # TODO: setar actual_return_date = now(), status = 'returned'
        # TODO: mudar item.availability para 'available'
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)
