/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 *
 * Sidebar issue type selector with hierarchy validation.
 */

import { useMemo } from "react";
import { observer } from "mobx-react";
// ui
import { CustomSelect } from "@plane/ui";
// hooks
import { useIssueTypes } from "@/plane-web/hooks/use-issue-types";
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
// components
import { IssueTypeEmoji } from "./issue-type-emoji";

const SUBTASK_ALLOWED_PARENT_LEVELS = new Set([5, 6]);

type Props = {
  workspaceSlug: string;
  projectId: string;
  issueId: string;
  issueOperations: {
    update: (workspaceSlug: string, projectId: string, issueId: string, data: Partial<any>) => Promise<void>;
  };
  disabled?: boolean;
};

export const IssueTypeSidebarSelect = observer(function IssueTypeSidebarSelect(props: Props) {
  const { workspaceSlug, projectId, issueId, issueOperations, disabled = false } = props;

  const issueTypes = useIssueTypes();
  const {
    issue: { getIssueById },
    subIssues: { subIssuesByIssueId },
  } = useIssueDetail();

  const issue = getIssueById(issueId);

  const validTypes = useMemo(() => {
    const allTypes = Object.values(issueTypes).filter((t) => t.is_active);
    if (!issue) return allTypes.sort((a, b) => a.level - b.level);

    // Check parent constraints
    let parentLevel: number | null = null;
    if (issue.parent_id) {
      const parent = getIssueById(issue.parent_id);
      if (parent?.type_id) {
        const parentType = issueTypes[parent.type_id];
        if (parentType) parentLevel = Math.floor(parentType.level);
      }
    }

    // Check children constraints
    const childIds = subIssuesByIssueId(issueId) ?? [];
    let minChildLevel: number | null = null;
    let hasSubtaskChildren = false;

    for (const childId of childIds) {
      const child = getIssueById(childId);
      if (child?.type_id) {
        const childType = issueTypes[child.type_id];
        if (childType) {
          const cl = Math.floor(childType.level);
          if (minChildLevel === null || cl < minChildLevel) minChildLevel = cl;
          if (cl === 7) hasSubtaskChildren = true;
        }
      }
    }

    return allTypes
      .filter((t) => {
        const level = Math.floor(t.level);

        // Must be greater than parent level
        if (parentLevel !== null && level <= parentLevel) return false;
        // Sub-task rule against parent
        if (parentLevel !== null && level === 7 && !SUBTASK_ALLOWED_PARENT_LEVELS.has(parentLevel)) return false;

        // Must be less than minimum child level
        if (minChildLevel !== null && level >= minChildLevel) return false;
        // Must stay at L5/L6 if has Sub-task children
        if (hasSubtaskChildren && !SUBTASK_ALLOWED_PARENT_LEVELS.has(level)) return false;

        return true;
      })
      .sort((a, b) => a.level - b.level);
  }, [issueTypes, issue, issueId, getIssueById, subIssuesByIssueId]);

  if (Object.keys(issueTypes).length === 0 || !issue) return null;

  const currentType = issue.type_id ? issueTypes[issue.type_id] : null;

  return (
    <CustomSelect
      value={issue.type_id ?? ""}
      onChange={(val: string) => {
        if (val !== issue.type_id) {
          issueOperations.update(workspaceSlug, projectId, issueId, { type_id: val || null });
        }
      }}
      label={
        currentType ? (
          <span className="flex items-center gap-1.5 text-body-xs-regular truncate">
            <IssueTypeEmoji typeId={currentType.id} size="sm" />
            <span className="truncate">{currentType.name}</span>
            <span className="shrink-0 text-placeholder text-[10px]">L{Math.floor(currentType.level)}</span>
          </span>
        ) : (
          <span className="text-body-xs-regular text-placeholder">Select type</span>
        )
      }
      input
      disabled={disabled}
      placement="bottom-start"
      maxHeight="md"
      noChevron={false}
      buttonClassName="text-body-xs-regular"
    >
      {validTypes.map((t) => (
        <CustomSelect.Option key={t.id} value={t.id}>
          <span className="flex items-center gap-2">
            <IssueTypeEmoji typeId={t.id} size="sm" />
            <span className="truncate">{t.name}</span>
            <span className="ml-auto shrink-0 text-placeholder text-[10px]">L{Math.floor(t.level)}</span>
          </span>
        </CustomSelect.Option>
      ))}
    </CustomSelect>
  );
});
