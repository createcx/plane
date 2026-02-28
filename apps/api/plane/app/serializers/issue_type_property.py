from rest_framework import serializers

from .base import BaseSerializer
from plane.db.models import IssueTypeProperty, IssuePropertyValue


class IssueTypePropertySerializer(BaseSerializer):
    class Meta:
        model = IssueTypeProperty
        fields = [
            "id",
            "issue_type",
            "name",
            "key",
            "description",
            "field_type",
            "is_required",
            "is_active",
            "sort_order",
            "config",
            "maps_to_builtin",
            "category",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class IssuePropertyValueSerializer(BaseSerializer):
    property_detail = IssueTypePropertySerializer(source="property", read_only=True)

    class Meta:
        model = IssuePropertyValue
        fields = [
            "id",
            "issue",
            "property",
            "property_detail",
            "value_json",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class IssuePropertyValueBulkSerializer(serializers.Serializer):
    """Accepts {property_id: value_json} dict for bulk upsert."""
    values = serializers.DictField(
        child=serializers.JSONField(),
        help_text="Mapping of property UUID to value_json",
    )
