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

    def get_queryset(self):
        queryset = Review.objects.filter(is_deleted=False).select_related(
            "reviewer", "reviewed_user", "loan", "loan__item"
        )
        params = self.request.query_params
        item_id = params.get("item")
        reviewed_user = params.get("reviewed_user")
        reviewer = params.get("reviewer")

        if item_id:
            queryset = queryset.filter(loan__item_id=item_id)
        if reviewed_user:
            queryset = queryset.filter(reviewed_user_id=reviewed_user)
        if reviewer == "me" and self.request.user.is_authenticated:
            queryset = queryset.filter(reviewer=self.request.user)
        elif reviewer:
            queryset = queryset.filter(reviewer_id=reviewer)

        return queryset.order_by("-created_at")

    def perform_create(self, serializer):
        loan = serializer.validated_data["loan"]
        reviewer = self.request.user

        if reviewer not in (loan.borrower, loan.lender):
            raise ValidationError("Você não é participante deste empréstimo.")

        if loan.status != Loan.StatusChoices.RETURNED:
            raise ValidationError("O empréstimo ainda não foi devolvido.")

        if Review.objects.filter(
            loan=loan,
            reviewer=reviewer,
        ).exists():
            raise ValidationError("Você já avaliou este empréstimo.")

        reviewed_user = loan.lender if reviewer == loan.borrower else loan.borrower
        serializer.save(reviewer=reviewer, reviewed_user=reviewed_user)
