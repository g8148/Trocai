from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError

from loans.models import Loan

from .models import Review
from .serializers import ReviewSerializer


@extend_schema(tags=["Avaliacoes"])
class ReviewListCreateView(generics.ListCreateAPIView):
    """Lista avaliacoes ou registra uma nova avaliacao apos devolucao."""

    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Review.objects.filter(is_deleted=False)

    def perform_create(self, serializer):
        loan = serializer.validated_data["loan"]
        reviewer = self.request.user

        if reviewer not in (loan.borrower, loan.lender):
            raise ValidationError("Voce nao e participante deste emprestimo.")

        if loan.status != Loan.StatusChoices.RETURNED:
            raise ValidationError("O emprestimo ainda nao foi devolvido.")

        if Review.objects.filter(
            loan=loan,
            reviewer=reviewer,
            is_deleted=False,
        ).exists():
            raise ValidationError("Voce ja avaliou este emprestimo.")

        reviewed_user = loan.lender if reviewer == loan.borrower else loan.borrower
        serializer.save(reviewer=reviewer, reviewed_user=reviewed_user)
