from rest_framework import status
from rest_framework.response import Response

from plane.api.views.base import BaseAPIView
from plane.db.models import (
    IssueTypeProperty,
    IssuePropertyValue,
    Workspace,
    Issue,
)
from plane.app.serializers.issue_type_property import (
    IssueTypePropertySerializer,
    IssuePropertyValueSerializer,
)


class IssueTypePropertyAPIEndpoint(BaseAPIView):
    """v1 API: list property definitions for an issue type."""

    def get(self, request, slug, type_id):
        workspace = Workspace.objects.get(slug=slug)
        props = (
            IssueTypeProperty.objects.filter(
                workspace=workspace,
                issue_type_id=type_id,
                is_active=True,
                deleted_at__isnull=True,
            )
            .order_by("sort_order", "created_at")
        )
        return Response(
            IssueTypePropertySerializer(props, many=True).data,
            status=status.HTTP_200_OK,
        )


class IssuePropertyValueAPIEndpoint(BaseAPIView):
    """v1 API: get/set property values for an issue."""

    def get(self, request, slug, project_id, issue_id):
        values = (
            IssuePropertyValue.objects.filter(
                issue_id=issue_id,
                issue__project_id=project_id,
                deleted_at__isnull=True,
            )
            .select_related("property")
        )
        return Response(
            IssuePropertyValueSerializer(values, many=True).data,
            status=status.HTTP_200_OK,
        )

    def put(self, request, slug, project_id, issue_id):
        """Bulk upsert: {property_id: value_json, ...}"""
        issue = Issue.objects.get(pk=issue_id, project_id=project_id)
        values_map = request.data.get("values", {})

        results = []
        for prop_id, value_json in values_map.items():
            obj, _ = IssuePropertyValue.objects.update_or_create(
                issue=issue,
                property_id=prop_id,
                deleted_at__isnull=True,
                defaults={"value_json": value_json},
            )
            results.append(obj)

        return Response(
            IssuePropertyValueSerializer(results, many=True).data,
            status=status.HTTP_200_OK,
        )
