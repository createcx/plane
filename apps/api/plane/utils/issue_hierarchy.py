# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only

"""
Issue type hierarchy validation.

Hierarchy levels (Jira/Azure DevOps-style):
    L0: Theme          L3: Epic           L6: Task
    L1: Initiative     L4: Feature        L7: Sub-task
    L2: Capability     L5: User Story / Bug

Rules:
  1. A child's type level must be strictly greater than its parent's level.
  2. Sub-task (L7) can only be a child of Task (L6) or User Story (L5).
  3. Bug (L5) can be under any type above L5.
  4. Changing an existing issue's type must not violate constraints
     with its current parent or any of its children.
"""

from plane.db.models import Issue, IssueType

# Sub-task (level 7) can only live under these parent levels
SUBTASK_ALLOWED_PARENT_LEVELS = {5, 6}  # User Story, Task


def validate_issue_type_hierarchy(new_type_id, parent_id=None, issue_id=None):
    """
    Validate that setting *new_type_id* on an issue (optionally with
    *parent_id*) does not violate hierarchy rules.

    Parameters
    ----------
    new_type_id : uuid | str | None
        The proposed issue type.  ``None`` means "no type" — always valid.
    parent_id : uuid | str | None
        The parent issue (FK).  ``None`` means top-level — always valid.
    issue_id : uuid | str | None
        The existing issue being updated (used to check children).
        ``None`` for new issues.

    Returns
    -------
    (is_valid: bool, error_message: str | None)
    """
    if not new_type_id:
        return True, None

    try:
        new_type = IssueType.objects.get(pk=new_type_id, is_active=True, deleted_at__isnull=True)
    except IssueType.DoesNotExist:
        return False, f"Issue type {new_type_id} does not exist or is inactive."

    new_level = int(new_type.level)

    # --- Check against parent ---
    if parent_id:
        try:
            parent_issue = Issue.issue_objects.get(pk=parent_id)
        except Issue.DoesNotExist:
            return False, f"Parent issue {parent_id} does not exist."

        if parent_issue.type_id:
            try:
                parent_type = IssueType.objects.get(pk=parent_issue.type_id, is_active=True, deleted_at__isnull=True)
            except IssueType.DoesNotExist:
                # Parent has a type that no longer exists — skip check
                parent_type = None

            if parent_type:
                parent_level = int(parent_type.level)

                if new_level <= parent_level:
                    return False, (
                        f"A {new_type.name} (L{new_level}) cannot be a child of "
                        f"{parent_type.name} (L{parent_level}). "
                        f"Child level must be strictly greater than parent level."
                    )

                # Sub-task special rule
                if new_level == 7 and parent_level not in SUBTASK_ALLOWED_PARENT_LEVELS:
                    return False, (
                        f"Sub-task (L7) can only be a child of User Story (L5) or Task (L6), "
                        f"not {parent_type.name} (L{parent_level})."
                    )

    # --- Check against existing children (only for updates) ---
    if issue_id:
        children = Issue.issue_objects.filter(parent_id=issue_id).select_related()
        child_type_ids = set(children.exclude(type_id__isnull=True).values_list("type_id", flat=True))

        if child_type_ids:
            child_types = IssueType.objects.filter(
                pk__in=child_type_ids, is_active=True, deleted_at__isnull=True
            )
            min_child_level = min(int(ct.level) for ct in child_types) if child_types else None

            if min_child_level is not None and new_level >= min_child_level:
                return False, (
                    f"Cannot change to {new_type.name} (L{new_level}) because this issue "
                    f"has children at level L{min_child_level}. "
                    f"Parent level must be strictly less than all children's levels."
                )

            # If issue has Sub-task children, it must stay at L5 or L6
            has_subtask_children = child_types.filter(level=7).exists()
            if has_subtask_children and new_level not in SUBTASK_ALLOWED_PARENT_LEVELS:
                return False, (
                    f"Cannot change to {new_type.name} (L{new_level}) because this issue "
                    f"has Sub-task (L7) children. Parent must be User Story (L5) or Task (L6)."
                )

    return True, None


def get_valid_child_type_ids(parent_type_level, all_types=None):
    """
    Return a list of IssueType IDs that are valid children of a parent
    at the given level.

    Parameters
    ----------
    parent_type_level : int | float
        The parent's type level (0-7).
    all_types : QuerySet | None
        Optional pre-fetched queryset of active IssueTypes.

    Returns
    -------
    list[uuid]
    """
    if all_types is None:
        all_types = IssueType.objects.filter(is_active=True, deleted_at__isnull=True)

    parent_level = int(parent_type_level)
    valid = []

    for t in all_types:
        child_level = int(t.level)
        if child_level <= parent_level:
            continue
        # Sub-task rule: only under L5 or L6
        if child_level == 7 and parent_level not in SUBTASK_ALLOWED_PARENT_LEVELS:
            continue
        valid.append(t.pk)

    return valid
