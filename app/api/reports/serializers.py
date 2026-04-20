from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Report

User = get_user_model()


class ReporterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name"]


class ReportSerializer(serializers.ModelSerializer):
    reporter = ReporterSerializer(read_only=True)

    class Meta:
        model = Report
        fields = [
            "id",
            "reporter",
            "target_type",
            "target_user",
            "target_item",
            "target_loan",
            "reason",
            "description",
            "evidence",
            "status",
            "admin_notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "reporter",
            "status",
            "admin_notes",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        target_map = {
            "usuario": attrs.get("target_user"),
            "item": attrs.get("target_item"),
            "emprestimo": attrs.get("target_loan"),
        }
        target_type = attrs.get("target_type")

        if target_type not in target_map:
            raise serializers.ValidationError({"target_type": "Invalid target type."})

        selected_targets = [value for value in target_map.values() if value is not None]
        if len(selected_targets) != 1:
            raise serializers.ValidationError(
                "Exactly one report target must be informed."
            )

        if target_map[target_type] is None:
            raise serializers.ValidationError(
                {"target_type": "Target type does not match the selected object."}
            )

        return attrs
