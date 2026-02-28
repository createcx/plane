import React from "react";
import { Input } from "@plane/ui";
import type { TIssueTypeProperty } from "@/plane-web/types/issue-types/issue-property-values";

type Props = {
  property: TIssueTypeProperty;
  value: number | null;
  onChange: (val: Record<string, any>) => void;
  disabled?: boolean;
};

export const FloatField: React.FC<Props> = ({ property, value, onChange, disabled }) => (
  <Input
    type="number"
    mode="primary"
    inputSize="sm"
    className="w-full"
    placeholder={property.name}
    value={value ?? ""}
    min={property.config?.min ?? undefined}
    step={property.config?.step ?? 0.1}
    onChange={(e) => onChange({ value: e.target.value ? parseFloat(e.target.value) : null })}
    disabled={disabled}
  />
);
