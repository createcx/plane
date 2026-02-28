/**
 * Custom Properties in the issue detail sidebar.
 * Renders property values grouped by category with inline editing.
 */

import React, { useCallback, useState } from "react";
import type { FC } from "react";
import { ChevronDown, ChevronRight, FileText, Activity, CheckSquare, Shield, UserCheck } from "lucide-react";
import { useIssueTypeProperties, useIssuePropertyValues } from "@/plane-web/hooks/use-issue-type-properties";
import { FieldRenderer } from "@/plane-web/components/issues/custom-properties";
import { SidebarPropertyListItem } from "@/components/common/layout/sidebar/property-list-item";
import type { TIssueTypeProperty, TPropertyCategory } from "@/plane-web/types/issue-types/issue-property-values";

export type TWorkItemAdditionalSidebarProperties = {
  workItemId: string;
  workItemTypeId: string | null;
  projectId: string;
  workspaceSlug: string;
  isEditable: boolean;
  isPeekView?: boolean;
};

const CATEGORY_LABELS: Record<TPropertyCategory, string> = {
  data: "Data Fields",
  tracking: "Tracking",
  criteria: "Criteria",
  governance: "Governance",
  hitl: "HITL",
};

const CATEGORY_ICONS: Record<TPropertyCategory, FC<{ className?: string }>> = {
  data: FileText,
  tracking: Activity,
  criteria: CheckSquare,
  governance: Shield,
  hitl: UserCheck,
};

const CATEGORY_ORDER: TPropertyCategory[] = ["data", "tracking", "criteria", "governance", "hitl"];

export function WorkItemAdditionalSidebarProperties(props: TWorkItemAdditionalSidebarProperties) {
  const { workItemId, workItemTypeId, projectId, workspaceSlug, isEditable } = props;
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const { customDefinitions } = useIssueTypeProperties(workItemTypeId);
  const { values, updateValues } = useIssuePropertyValues(projectId, workItemId);

  const handleChange = useCallback(
    (propertyId: string, val: Record<string, any>) => {
      // Optimistic: save single property immediately
      updateValues({ [propertyId]: val });
    },
    [updateValues]
  );

  if (!workItemTypeId || customDefinitions.length === 0) return <></>;

  // Group by category
  const grouped: Record<string, TIssueTypeProperty[]> = {};
  for (const def of customDefinitions) {
    const cat = def.category || "data";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(def);
  }

  return (
    <div className="space-y-4 mt-4">
      {CATEGORY_ORDER.filter((cat) => grouped[cat]?.length).map((cat) => (
        <div key={cat}>
          <button
            type="button"
            className="flex items-center gap-1 text-11 font-medium text-tertiary uppercase tracking-wide mb-2 w-full text-left"
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
            <div className="space-y-0.5 ml-1">
              {grouped[cat].map((def) => {
                const CategoryIcon = CATEGORY_ICONS[def.category as TPropertyCategory] ?? FileText;
                return (
                  <SidebarPropertyListItem
                    key={def.id}
                    icon={CategoryIcon}
                    label={def.name}
                  >
                    <FieldRenderer
                      property={def}
                      valueJson={values[def.id] ?? {}}
                      onChange={handleChange}
                      disabled={!isEditable}
                    />
                  </SidebarPropertyListItem>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
