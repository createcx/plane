/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 *
 * Patched for Community Edition: renders issue type emoji icons.
 */

import { observer } from "mobx-react";
// plane imports
import type { TIssueIdentifierProps, TIssueTypeIdentifier } from "@plane/types";
// hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useProject } from "@/hooks/store/use-project";
import { IdentifierText } from "@/components/issues/issue-detail/identifier-text";
// local
import { IssueTypeEmoji } from "./issue-type-emoji";

export const IssueIdentifier = observer(function IssueIdentifier(props: TIssueIdentifierProps) {
  const { projectId, variant, size, displayProperties, enableClickToCopyIdentifier = false } = props;
  // store hooks
  const { getProjectIdentifierById } = useProject();
  const {
    issue: { getIssueById },
  } = useIssueDetail();
  // Determine if the component is using store data or not
  const isUsingStoreData = "issueId" in props;
  // derived values
  const issue = isUsingStoreData ? getIssueById(props.issueId) : null;
  const projectIdentifier = isUsingStoreData ? getProjectIdentifierById(projectId) : props.projectIdentifier;
  const issueSequenceId = isUsingStoreData ? issue?.sequence_id : props.issueSequenceId;
  const issueTypeId = isUsingStoreData ? issue?.type_id : ("issueTypeId" in props ? props.issueTypeId : null);
  const shouldRenderIssueID = displayProperties ? displayProperties.key : true;
  const shouldRenderIssueType = displayProperties ? (displayProperties.issue_type ?? true) : true;

  if (!shouldRenderIssueID && !shouldRenderIssueType) return null;

  return (
    <div className="shrink-0 flex items-center gap-1">
      {shouldRenderIssueType && (
        <IssueTypeEmoji typeId={issueTypeId} size={size} />
      )}
      {shouldRenderIssueID && (
        <IdentifierText
          identifier={`${projectIdentifier}-${issueSequenceId}`}
          enableClickToCopyIdentifier={enableClickToCopyIdentifier}
          variant={variant}
          size={size}
        />
      )}
    </div>
  );
});

export const IssueTypeIdentifier = observer(function IssueTypeIdentifier(props: TIssueTypeIdentifier) {
  const { issueTypeId, size = "md" } = props;
  return <IssueTypeEmoji typeId={issueTypeId} size={size} />;
});
