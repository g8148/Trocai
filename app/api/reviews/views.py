from rest_framework import generics, permissions

from .models import Review
from .serializers import ReviewSerializer


class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Review.objects.all()

    def perform_create(self, serializer):
        from rest_framework.exceptions import ValidationError
        loan = serializer.validated_data['loan']
        reviewer = self.request.user
        if Review.objects.filter(loan=loan, reviewer=reviewer).exists():
            raise ValidationError("Você já avaliou este empréstimo.")
        reviewed_user = (
            loan.lender if reviewer == loan.borrower else loan.borrower
        )
        serializer.save(reviewer=reviewer, reviewed_user=reviewed_user)
        # TODO: validar loan.status == 'returned' antes de criar → raise ValidationError
