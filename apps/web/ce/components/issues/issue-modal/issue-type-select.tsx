/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useMemo } from "react";
import { Controller, type Control } from "react-hook-form";
// plane imports
import type { EditorRefApi } from "@plane/editor";
import { CustomSelect } from "@plane/ui";
// types
import type { TBulkIssueProperties, TIssue } from "@plane/types";
// hooks
import { useIssueTypes } from "@/plane-web/hooks/use-issue-types";
import { useIssueModal } from "@/hooks/context/use-issue-modal";
// components
import { IssueTypeEmoji } from "@/plane-web/components/issues/issue-details/issue-type-emoji";

export type TIssueFields = TIssue & TBulkIssueProperties;

export type TIssueTypeDropdownVariant = "xs" | "sm";

export type TIssueTypeSelectProps<T extends Partial<TIssueFields>> = {
  control: Control<T>;
  projectId: string | null;
  editorRef?: React.MutableRefObject<EditorRefApi | null>;
  disabled?: boolean;
  variant?: TIssueTypeDropdownVariant;
  placeholder?: string;
  isRequired?: boolean;
  renderChevron?: boolean;
  dropDownContainerClassName?: string;
  showMandatoryFieldInfo?: boolean; // Show info about mandatory fields
  handleFormChange?: () => void;
};

/**
 * Hierarchy-aware issue type selector for the issue create/edit modal.
 *
 * Filters the dropdown options based on the selected parent issue's type level:
 *   - No parent → all types available
 *   - With parent → only types whose level > parent's level
 *   - Sub-task (L7) only under User Story (L5) or Task (L6)
 */

const SUBTASK_ALLOWED_PARENT_LEVELS = new Set([5, 6]);

function getValidTypes(
  allTypes: Record<string, { id: string; name: string; level: number; logo_props: any; is_active: boolean }>,
  parentTypeId?: string | null
) {
  const types = Object.values(allTypes)
    .filter((t) => t.is_active)
    .sort((a, b) => a.level - b.level);

  if (!parentTypeId) return types;

  const parentType = allTypes[parentTypeId];
  if (!parentType) return types;

  const parentLevel = Math.floor(parentType.level);

  return types.filter((t) => {
    const childLevel = Math.floor(t.level);
    if (childLevel <= parentLevel) return false;
    // Sub-task rule: only under L5 or L6
    if (childLevel === 7 && !SUBTASK_ALLOWED_PARENT_LEVELS.has(parentLevel)) return false;
    return true;
  });
}

export function IssueTypeSelect<T extends Partial<TIssueFields>>(props: TIssueTypeSelectProps<T>) {
  const {
    control,
    disabled = false,
    variant = "sm",
    placeholder = "Select type",
    renderChevron = false,
    dropDownContainerClassName,
    handleFormChange,
  } = props;

  const issueTypes = useIssueTypes();
  const { selectedParentIssue } = useIssueModal();

  const parentTypeId = selectedParentIssue?.type_id ?? null;

  const validTypes = useMemo(() => getValidTypes(issueTypes, parentTypeId), [issueTypes, parentTypeId]);

  const typeCount = Object.keys(issueTypes).length;
  if (typeCount === 0) return null;

  return (
    <Controller
      control={control}
      name={"type_id" as any}
      render={({ field: { value, onChange } }) => {
        const currentType = value ? issueTypes[value as string] : null;

        // Auto-correct: if parent changed and current type is no longer valid, pick first valid
        const isCurrentValid = !value || validTypes.some((t) => t.id === value);
        if (!isCurrentValid && validTypes.length > 0) {
          const firstValid = validTypes[0];
          setTimeout(() => {
            onChange(firstValid.id);
            handleFormChange?.();
          }, 0);
        }

        return (
          <div className={`h-7 ${dropDownContainerClassName ?? ""}`}>
            <CustomSelect
              value={value ?? ""}
              onChange={(val: string) => {
                onChange(val || null);
                handleFormChange?.();
              }}
              label={
                currentType ? (
                  <span className="flex items-center gap-1.5 text-body-xs-regular truncate">
                    <IssueTypeEmoji typeId={currentType.id} size={variant === "xs" ? "xs" : "sm"} />
                    <span className="truncate">{currentType.name}</span>
                    <span className="shrink-0 text-placeholder text-[10px]">L{Math.floor(currentType.level)}</span>
                  </span>
                ) : (
                  <span className="text-body-xs-regular text-placeholder">{placeholder}</span>
                )
              }
              input
              disabled={disabled}
              placement="bottom-start"
              maxHeight="md"
              noChevron={!renderChevron}
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
          </div>
        );
      }}
    />
  );
}
