from django.contrib.auth import get_user_model
from rest_framework import serializers

from loans.models import Loan

from .models import Review

User = get_user_model()


class ReviewerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'avatar']


class ReviewSerializer(serializers.ModelSerializer):
    reviewer = ReviewerSerializer(read_only=True)
    reviewed_user = ReviewerSerializer(read_only=True)
    loan = serializers.PrimaryKeyRelatedField(
        queryset=Loan.objects.filter(is_deleted=False)
    )

    class Meta:
        model = Review
        fields = [
            'id', 'loan', 'reviewer', 'reviewed_user',
            'item_rating', 'user_rating', 'description',
            'image', 'created_at',
        ]
        read_only_fields = ['id', 'reviewer', 'reviewed_user', 'created_at']
