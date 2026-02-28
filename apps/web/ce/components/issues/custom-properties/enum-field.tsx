import React from "react";
import { CustomSelect } from "@plane/ui";
import type { TIssueTypeProperty } from "@/plane-web/types/issue-types/issue-property-values";

type Props = {
  property: TIssueTypeProperty;
  value: string;
  onChange: (val: Record<string, any>) => void;
  disabled?: boolean;
};

export const EnumField: React.FC<Props> = ({ property, value, onChange, disabled }) => {
  const options: string[] = property.config?.options ?? [];

  return (
    <CustomSelect
      value={value ?? ""}
      onChange={(val: string) => onChange({ value: val })}
      label={value || `Select ${property.name}`}
      input
      disabled={disabled}
      placement="bottom-start"
      maxHeight="md"
    >
      <CustomSelect.Option value="">
        <span className="text-placeholder">Select {property.name}</span>
      </CustomSelect.Option>
      {options.map((opt) => (
        <CustomSelect.Option key={opt} value={opt}>
          {opt}
        </CustomSelect.Option>
      ))}
    </CustomSelect>
  );
};
