from django.urls import path

from plane.api.views.issue_type_property import (
    IssueTypePropertyAPIEndpoint,
    IssuePropertyValueAPIEndpoint,
)

urlpatterns = [
    path(
        "workspaces/<str:slug>/issue-types/<uuid:type_id>/properties/",
        IssueTypePropertyAPIEndpoint.as_view(),
        name="issue-type-properties-api",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/issues/<uuid:issue_id>/properties/",
        IssuePropertyValueAPIEndpoint.as_view(),
        name="issue-property-values-api",
    ),
    # work-items alias
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/work-items/<uuid:issue_id>/properties/",
        IssuePropertyValueAPIEndpoint.as_view(),
        name="work-item-property-values-api",
    ),
]
