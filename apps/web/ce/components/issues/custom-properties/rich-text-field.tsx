import React from "react";
import { TextArea } from "@plane/ui";
import type { TIssueTypeProperty } from "@/plane-web/types/issue-types/issue-property-values";

type Props = {
  property: TIssueTypeProperty;
  value: string;
  onChange: (val: Record<string, any>) => void;
  disabled?: boolean;
  workspaceSlug?: string;
};

export const RichTextField: React.FC<Props> = ({ property, value, onChange, disabled }) => (
  <TextArea
    mode="primary"
    textAreaSize="sm"
    className="w-full min-h-[80px]"
    rows={3}
    placeholder={property.name}
    value={value ?? ""}
    onChange={(e) => onChange({ value: e.target.value })}
    disabled={disabled}
  />
);
