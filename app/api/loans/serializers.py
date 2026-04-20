from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Loan

User = get_user_model()


class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "avatar"]


class LoanSerializer(serializers.ModelSerializer):
    borrower = ParticipantSerializer(read_only=True)
    lender = ParticipantSerializer(read_only=True)
    item_name = serializers.CharField(source="item.name", read_only=True)

    class Meta:
        model = Loan
        fields = [
            "id",
            "item",
            "item_name",
            "borrower",
            "lender",
            "status",
            "pickup_date",
            "expected_return_date",
            "actual_return_date",
            "borrower_notes",
            "lender_notes",
            "requested_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "item_name",
            "borrower",
            "lender",
            "status",
            "actual_return_date",
            "requested_at",
            "updated_at",
        ]
