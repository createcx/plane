/**
 * Custom Properties in the issue create/edit modal.
 * Renders custom property fields grouped by category when editing an existing work item.
 */

import React, { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useIssueModal } from "@/hooks/context/use-issue-modal";
import { useIssueTypeProperties, useIssuePropertyValues } from "@/plane-web/hooks/use-issue-type-properties";
import { FieldRenderer } from "@/plane-web/components/issues/custom-properties";
import type { TIssueTypeProperty, TPropertyCategory } from "@/plane-web/types/issue-types/issue-property-values";
import { IssuePropertyService } from "@/services/issue/issue_property.service";

const propertyService = new IssuePropertyService();

export type TWorkItemModalAdditionalPropertiesProps = {
  isDraft?: boolean;
  projectId: string | null;
  workItemId: string | undefined;
  workspaceSlug: string;
};

const CATEGORY_LABELS: Record<TPropertyCategory, string> = {
  data: "Data Fields",
  tracking: "Tracking",
  criteria: "Criteria",
  governance: "Governance",
  hitl: "HITL",
};

const CATEGORY_ORDER: TPropertyCategory[] = ["data", "tracking", "criteria", "governance", "hitl"];

export function WorkItemModalAdditionalProperties(props: TWorkItemModalAdditionalPropertiesProps) {
  const { projectId, workItemId, workspaceSlug } = props;
  const { issuePropertyValues, setIssuePropertyValues } = useIssueModal();

  // We need to know the issue's type_id to fetch definitions.
  // For existing items, fetch it; for new items, skip (properties set after creation).
  const [typeId, setTypeId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!workItemId || !projectId || !workspaceSlug) {
      setTypeId(null);
      return;
    }
    // Fetch the issue to get its type_id
    fetch(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issues/${workItemId}/`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.type_id) setTypeId(data.type_id);
      })
      .catch(() => {});
  }, [workItemId, projectId, workspaceSlug]);

  const { customDefinitions } = useIssueTypeProperties(typeId);
  const { values } = useIssuePropertyValues(projectId, workItemId);

  // Merge fetched values into context on load
  useEffect(() => {
    if (Object.keys(values).length > 0) {
      setIssuePropertyValues((prev: Record<string, any>) => ({ ...prev, ...values }));
    }
  }, [values, setIssuePropertyValues]);

  const handleChange = useCallback(
    (propertyId: string, val: Record<string, any>) => {
      setIssuePropertyValues((prev: Record<string, any>) => ({
        ...prev,
        [propertyId]: val,
      }));
    },
    [setIssuePropertyValues]
  );

  if (!typeId || customDefinitions.length === 0) return null;

  // Group by category
  const grouped: Record<string, TIssueTypeProperty[]> = {};
  for (const def of customDefinitions) {
    const cat = def.category || "data";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(def);
  }

  return (
    <div className="mt-3 space-y-3 border-t border-subtle-1 pt-3">
      {CATEGORY_ORDER.filter((cat) => grouped[cat]?.length).map((cat) => (
        <div key={cat}>
          <button
            type="button"
            className="flex items-center gap-1 text-11 font-medium text-tertiary uppercase tracking-wide mb-1"
            onClick={() => setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }))}
          >
            {collapsed[cat] ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            {CATEGORY_LABELS[cat]}
          </button>
          {!collapsed[cat] && (
            <div className="space-y-2 ml-4">
              {grouped[cat].map((def) => (
                <div key={def.id}>
                  <label className="block text-11 font-medium text-tertiary mb-0.5">
                    {def.name}
                    {def.is_required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <FieldRenderer
                    property={def}
                    valueJson={issuePropertyValues[def.id] ?? {}}
                    onChange={handleChange}
                    workspaceSlug={workspaceSlug}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
