import React from "react";
import { Input } from "@plane/ui";
import type { TIssueTypeProperty } from "@/plane-web/types/issue-types/issue-property-values";

type Props = {
  property: TIssueTypeProperty;
  value: string[];
  onChange: (val: Record<string, any>) => void;
  disabled?: boolean;
};

export const UserSelectField: React.FC<Props> = ({ property, value, onChange, disabled }) => {
  // Simplified multi-user input (comma-separated UUIDs).
  // In a full implementation, this would use Plane's member dropdown.
  const ids = value ?? [];

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-1">
        {ids.map((id) => (
          <span
            key={id}
            className="inline-flex items-center gap-1 rounded bg-layer-1 px-2 py-0.5 text-11 text-secondary"
          >
            {id.slice(0, 8)}...
            {!disabled && (
              <button
                type="button"
                onClick={() => onChange({ value: ids.filter((i) => i !== id) })}
                className="text-placeholder hover:text-danger-primary"
              >
                x
              </button>
            )}
          </span>
        ))}
      </div>
      {!disabled && (
        <Input
          type="text"
          mode="primary"
          inputSize="xs"
          className="w-full"
          placeholder={`Add user ID for ${property.name}`}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const val = (e.target as HTMLInputElement).value.trim();
              if (val && !ids.includes(val)) {
                onChange({ value: [...ids, val] });
                (e.target as HTMLInputElement).value = "";
              }
            }
          }}
        />
      )}
    </div>
  );
};
