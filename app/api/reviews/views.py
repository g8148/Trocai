from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError

from loans.models import Loan

from .models import Review
from .serializers import ReviewSerializer


@extend_schema(tags=['Avaliações'])
class ReviewListCreateView(generics.ListCreateAPIView):
    """Lista avaliações ou registra uma nova avaliação após devolução."""

    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Review.objects.all()

    def perform_create(self, serializer):
        loan = serializer.validated_data['loan']
        reviewer = self.request.user

        if reviewer not in (loan.borrower, loan.lender):
            raise ValidationError("Você não é participante deste empréstimo.")
        if loan.status != Loan.StatusChoices.RETURNED:
            raise ValidationError("O empréstimo ainda não foi devolvido.")
        if Review.objects.filter(loan=loan, reviewer=reviewer).exists():
            raise ValidationError("Você já avaliou este empréstimo.")

        reviewed_user = (
            loan.lender if reviewer == loan.borrower else loan.borrower
        )
        serializer.save(reviewer=reviewer, reviewed_user=reviewed_user)
