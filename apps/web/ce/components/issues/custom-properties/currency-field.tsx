import React from "react";
import { Input } from "@plane/ui";
import type { TIssueTypeProperty } from "@/plane-web/types/issue-types/issue-property-values";

type Props = {
  property: TIssueTypeProperty;
  value: number | null;
  onChange: (val: Record<string, any>) => void;
  disabled?: boolean;
};

export const CurrencyField: React.FC<Props> = ({ property, value, onChange, disabled }) => {
  const currency = property.config?.currency ?? "USD";

  return (
    <div className="flex items-center gap-1">
      <span className="text-13 text-placeholder flex-shrink-0">{currency}</span>
      <Input
        type="number"
        mode="primary"
        inputSize="sm"
        className="w-full"
        placeholder="0"
        value={value ?? ""}
        min={0}
        step={1}
        onChange={(e) =>
          onChange({
            value: e.target.value ? parseFloat(e.target.value) : null,
            currency,
          })
        }
        disabled={disabled}
      />
    </div>
  );
};
