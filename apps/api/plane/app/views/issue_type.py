from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from plane.app.views.base import BaseAPIView
from plane.db.models import IssueType, Workspace
from plane.db.models.issue_type import ProjectIssueType


class WorkspaceIssueTypesEndpoint(BaseAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, slug, project_id=None, **kwargs):
        workspace = Workspace.objects.get(slug=slug)

        if project_id:
            pit = ProjectIssueType.objects.filter(
                project_id=project_id,
                deleted_at__isnull=True,
            ).select_related("issue_type").order_by("level")

            result = []
            for p in pit:
                t = p.issue_type
                result.append(
                    {
                        "id": str(t.id),
                        "name": t.name,
                        "description": t.description,
                        "logo_props": t.logo_props,
                        "is_epic": t.is_epic,
                        "is_default": p.is_default,
                        "is_active": t.is_active,
                        "level": p.level,
                    }
                )
            return Response(result, status=status.HTTP_200_OK)
        else:
            issue_types = IssueType.objects.filter(
                workspace=workspace, is_active=True
            ).order_by("level").values(
                "id", "name", "description", "logo_props",
                "is_epic", "is_default", "is_active", "level",
            )
            return Response(list(issue_types), status=status.HTTP_200_OK)
