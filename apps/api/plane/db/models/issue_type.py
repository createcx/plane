# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Django imports
from django.db import models
from django.db.models import Q

# Module imports
from .project import ProjectBaseModel
from .base import BaseModel


class IssueType(BaseModel):
    workspace = models.ForeignKey("db.Workspace", related_name="issue_types", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    logo_props = models.JSONField(default=dict)
    is_epic = models.BooleanField(default=False)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    level = models.FloatField(default=0)
    external_source = models.CharField(max_length=255, null=True, blank=True)
    external_id = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        verbose_name = "Issue Type"
        verbose_name_plural = "Issue Types"
        db_table = "issue_types"

    def __str__(self):
        return self.name


class ProjectIssueType(ProjectBaseModel):
    issue_type = models.ForeignKey("db.IssueType", related_name="project_issue_types", on_delete=models.CASCADE)
    level = models.PositiveIntegerField(default=0)
    is_default = models.BooleanField(default=False)

    class Meta:
        unique_together = ["project", "issue_type", "deleted_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["project", "issue_type"],
                condition=Q(deleted_at__isnull=True),
                name="project_issue_type_unique_project_issue_type_when_deleted_at_null",
            )
        ]
        verbose_name = "Project Issue Type"
        verbose_name_plural = "Project Issue Types"
        db_table = "project_issue_types"
        ordering = ("project", "issue_type")

    def __str__(self):
        return f"{self.project} - {self.issue_type}"


FIELD_TYPE_CHOICES = [
    ("text", "Text"),
    ("rich_text", "Rich Text"),
    ("url", "URL"),
    ("enum", "Enum"),
    ("float", "Float"),
    ("integer", "Integer"),
    ("boolean", "Boolean"),
    ("checklist", "Checklist"),
    ("array_user_ids", "User IDs"),
    ("currency", "Currency"),
    ("tags", "Tags"),
    ("threaded_list", "Threaded List"),
    ("timestamped_text", "Timestamped Text"),
    ("json", "JSON"),
]

CATEGORY_CHOICES = [
    ("data", "Data"),
    ("tracking", "Tracking"),
    ("criteria", "Criteria"),
    ("governance", "Governance"),
    ("hitl", "HITL"),
]


class IssueTypeProperty(BaseModel):
    workspace = models.ForeignKey(
        "db.Workspace",
        related_name="issue_type_properties",
        on_delete=models.CASCADE,
    )
    issue_type = models.ForeignKey(
        "db.IssueType",
        related_name="properties",
        on_delete=models.CASCADE,
    )
    name = models.CharField(max_length=255)
    key = models.SlugField(max_length=100)
    description = models.TextField(blank=True, default="")
    field_type = models.CharField(max_length=30, choices=FIELD_TYPE_CHOICES)
    is_required = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    sort_order = models.FloatField(default=65535)
    config = models.JSONField(default=dict, blank=True)
    maps_to_builtin = models.CharField(max_length=50, blank=True, default="")
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default="data")

    class Meta:
        verbose_name = "Issue Type Property"
        verbose_name_plural = "Issue Type Properties"
        db_table = "issue_type_properties"
        ordering = ("sort_order", "created_at")
        constraints = [
            models.UniqueConstraint(
                fields=["issue_type", "key"],
                condition=Q(deleted_at__isnull=True),
                name="issue_type_property_unique_type_key_when_not_deleted",
            )
        ]

    def __str__(self):
        return f"{self.issue_type.name} - {self.name}"


class IssuePropertyValue(BaseModel):
    issue = models.ForeignKey(
        "db.Issue",
        related_name="property_values",
        on_delete=models.CASCADE,
    )
    property = models.ForeignKey(
        "db.IssueTypeProperty",
        related_name="values",
        on_delete=models.CASCADE,
    )
    value_json = models.JSONField(default=dict, blank=True)

    class Meta:
        verbose_name = "Issue Property Value"
        verbose_name_plural = "Issue Property Values"
        db_table = "issue_property_values"
        constraints = [
            models.UniqueConstraint(
                fields=["issue", "property"],
                condition=Q(deleted_at__isnull=True),
                name="issue_property_value_unique_issue_property_when_not_deleted",
            )
        ]

    def __str__(self):
        return f"{self.issue_id} - {self.property.key}"
