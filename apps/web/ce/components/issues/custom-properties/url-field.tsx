import React from "react";
import { Input } from "@plane/ui";
import type { TIssueTypeProperty } from "@/plane-web/types/issue-types/issue-property-values";

type Props = {
  property: TIssueTypeProperty;
  value: string;
  onChange: (val: Record<string, any>) => void;
  disabled?: boolean;
};

export const UrlField: React.FC<Props> = ({ property, value, onChange, disabled }) => (
  <Input
    type="url"
    mode="primary"
    inputSize="sm"
    className="w-full"
    placeholder={property.description || `https://...`}
    value={value ?? ""}
    onChange={(e) => onChange({ value: e.target.value })}
    disabled={disabled}
  />
);
