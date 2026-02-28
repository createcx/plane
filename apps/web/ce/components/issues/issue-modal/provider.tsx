/**
 * CE IssueModalProvider — provides custom property state and handlers
 * for the issue creation/edit modal.
 */

import React, { useState, useCallback } from "react";
import { observer } from "mobx-react";
import type { ISearchIssueResponse, TIssue } from "@plane/types";
import { IssueModalContext } from "@/components/issues/issue-modal/context";
import type {
  TCreateUpdatePropertyValuesProps,
  TPropertyValuesValidationProps,
  TActiveAdditionalPropertiesProps,
} from "@/components/issues/issue-modal/context/issue-modal-context";
import { useUser } from "@/hooks/store/user/user-user";
import type { TIssuePropertyValues, TIssuePropertyValueErrors } from "@/plane-web/types/issue-types/issue-property-values";
import { IssuePropertyService } from "@/services/issue/issue_property.service";

const propertyService = new IssuePropertyService();

export type TIssueModalProviderProps = {
  templateId?: string;
  dataForPreload?: Partial<TIssue>;
  allowedProjectIds?: string[];
  children: React.ReactNode;
};

export const IssueModalProvider = observer(function IssueModalProvider(props: TIssueModalProviderProps) {
  const { children, allowedProjectIds } = props;
  const [selectedParentIssue, setSelectedParentIssue] = useState<ISearchIssueResponse | null>(null);
  const [issuePropertyValues, setIssuePropertyValues] = useState<TIssuePropertyValues>({});
  const [issuePropertyValueErrors, setIssuePropertyValueErrors] = useState<TIssuePropertyValueErrors>({});
  const { projectsWithCreatePermissions } = useUser();
  const projectIdsWithCreatePermissions = Object.keys(projectsWithCreatePermissions ?? {});

  const handlePropertyValuesValidation = useCallback(
    (_props: TPropertyValuesValidationProps): boolean => {
      // Could validate required fields here; for now pass through
      return true;
    },
    []
  );

  const handleCreateUpdatePropertyValues = useCallback(
    async (props: TCreateUpdatePropertyValuesProps): Promise<void> => {
      const { issueId, projectId, workspaceSlug } = props;
      if (!issueId || !projectId || !workspaceSlug) return;

      // Filter out empty values
      const nonEmpty: Record<string, Record<string, any>> = {};
      for (const [propId, val] of Object.entries(issuePropertyValues)) {
        if (val && Object.keys(val).length > 0) {
          nonEmpty[propId] = val;
        }
      }
      if (Object.keys(nonEmpty).length === 0) return;

      try {
        await propertyService.bulkUpsertPropertyValues(workspaceSlug, projectId, issueId, nonEmpty);
      } catch (err) {
        console.warn("[IssueModalProvider] Failed to save property values:", err);
      }
    },
    [issuePropertyValues]
  );

  const getActiveAdditionalPropertiesLength = useCallback(
    (_props: TActiveAdditionalPropertiesProps): number => {
      return Object.values(issuePropertyValues).filter(
        (v) => v && Object.keys(v).length > 0
      ).length;
    },
    [issuePropertyValues]
  );

  return (
    <IssueModalContext.Provider
      value={{
        allowedProjectIds: allowedProjectIds ?? projectIdsWithCreatePermissions,
        workItemTemplateId: null,
        setWorkItemTemplateId: () => {},
        isApplyingTemplate: false,
        setIsApplyingTemplate: () => {},
        selectedParentIssue,
        setSelectedParentIssue,
        issuePropertyValues,
        setIssuePropertyValues,
        issuePropertyValueErrors,
        setIssuePropertyValueErrors,
        getIssueTypeIdOnProjectChange: () => null,
        getActiveAdditionalPropertiesLength,
        handlePropertyValuesValidation,
        handleCreateUpdatePropertyValues,
        handleProjectEntitiesFetch: () => Promise.resolve(),
        handleTemplateChange: () => Promise.resolve(),
        handleConvert: () => Promise.resolve(),
        handleCreateSubWorkItem: () => Promise.resolve(),
      }}
    >
      {children}
    </IssueModalContext.Provider>
  );
});
