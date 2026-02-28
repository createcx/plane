from django.urls import path
from plane.api.views import IssueTypeListAPIEndpoint

urlpatterns = [
    path(
        "workspaces/<str:slug>/issue-types/",
        IssueTypeListAPIEndpoint.as_view(),
        name="workspace-issue-types",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/issue-types/",
        IssueTypeListAPIEndpoint.as_view(),
        name="project-issue-types",
    ),
]
