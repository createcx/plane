import React from "react";
import { ToggleSwitch } from "@plane/ui";
import type { TIssueTypeProperty } from "@/plane-web/types/issue-types/issue-property-values";

type Props = {
  property: TIssueTypeProperty;
  value: boolean;
  onChange: (val: Record<string, any>) => void;
  disabled?: boolean;
};

export const BooleanField: React.FC<Props> = ({ property, value, onChange, disabled }) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <ToggleSwitch
      value={!!value}
      onChange={() => onChange({ value: !value })}
      size="sm"
      disabled={disabled}
    />
    <span className="text-13 text-secondary">{property.name}</span>
  </label>
);
