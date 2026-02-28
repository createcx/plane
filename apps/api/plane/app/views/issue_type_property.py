from django.utils import timezone

from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from plane.app.views.base import BaseAPIView
from plane.db.models import (
    IssueTypeProperty,
    IssuePropertyValue,
    IssueActivity,
    Workspace,
    Issue,
)
from plane.app.serializers.issue_type_property import (
    IssueTypePropertySerializer,
    IssuePropertyValueSerializer,
)


class IssueTypePropertyEndpoint(BaseAPIView):
    """CRUD for property definitions on an issue type."""

    permission_classes = [IsAuthenticated]

    def get(self, request, slug, type_id, pk=None):
        workspace = Workspace.objects.get(slug=slug)
        if pk:
            prop = IssueTypeProperty.objects.get(
                pk=pk,
                workspace=workspace,
                issue_type_id=type_id,
                deleted_at__isnull=True,
            )
            return Response(
                IssueTypePropertySerializer(prop).data,
                status=status.HTTP_200_OK,
            )

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

    def post(self, request, slug, type_id):
        workspace = Workspace.objects.get(slug=slug)
        data = request.data.copy()
        data["workspace"] = workspace.id
        data["issue_type"] = type_id
        serializer = IssueTypePropertySerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, slug, type_id, pk):
        workspace = Workspace.objects.get(slug=slug)
        prop = IssueTypeProperty.objects.get(
            pk=pk,
            workspace=workspace,
            issue_type_id=type_id,
            deleted_at__isnull=True,
        )
        serializer = IssueTypePropertySerializer(prop, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, slug, type_id, pk):
        from django.utils import timezone as tz

        workspace = Workspace.objects.get(slug=slug)
        prop = IssueTypeProperty.objects.get(
            pk=pk,
            workspace=workspace,
            issue_type_id=type_id,
            deleted_at__isnull=True,
        )
        prop.deleted_at = tz.now()
        prop.save(update_fields=["deleted_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class IssuePropertyValueEndpoint(BaseAPIView):
    """GET/PUT property values for an issue."""

    permission_classes = [IsAuthenticated]

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

        # Pre-fetch old values for activity logging
        old_values = {}
        existing = IssuePropertyValue.objects.filter(
            issue=issue,
            property_id__in=values_map.keys(),
            deleted_at__isnull=True,
        ).select_related("property")
        for ev in existing:
            old_values[str(ev.property_id)] = (ev.property.name, ev.value_json)

        # Pre-fetch property names for new properties
        prop_names = {}
        props = IssueTypeProperty.objects.filter(
            pk__in=values_map.keys(),
            deleted_at__isnull=True,
        )
        for p in props:
            prop_names[str(p.pk)] = p.name

        results = []
        activities = []
        epoch = int(timezone.now().timestamp())

        for prop_id, value_json in values_map.items():
            obj, created = IssuePropertyValue.objects.update_or_create(
                issue=issue,
                property_id=prop_id,
                deleted_at__isnull=True,
                defaults={"value_json": value_json},
            )
            results.append(obj)

            # Log activity
            prop_name = prop_names.get(prop_id, prop_id)
            if prop_id in old_values:
                old_name, old_val = old_values[prop_id]
                activities.append(
                    IssueActivity(
                        issue=issue,
                        project_id=project_id,
                        workspace_id=issue.workspace_id,
                        actor=request.user,
                        field=f"custom:{prop_name}",
                        old_value=str(old_val),
                        new_value=str(value_json),
                        verb="updated",
                        comment=f"changed {prop_name}",
                        epoch=epoch,
                    )
                )
            else:
                activities.append(
                    IssueActivity(
                        issue=issue,
                        project_id=project_id,
                        workspace_id=issue.workspace_id,
                        actor=request.user,
                        field=f"custom:{prop_name}",
                        new_value=str(value_json),
                        verb="created",
                        comment=f"set {prop_name}",
                        epoch=epoch,
                    )
                )

        if activities:
            IssueActivity.objects.bulk_create(activities, ignore_conflicts=True)

        return Response(
            IssuePropertyValueSerializer(results, many=True).data,
            status=status.HTTP_200_OK,
        )
