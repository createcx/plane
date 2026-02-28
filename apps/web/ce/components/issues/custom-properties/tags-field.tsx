import React, { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@plane/ui";
import type { TIssueTypeProperty } from "@/plane-web/types/issue-types/issue-property-values";

type Props = {
  property: TIssueTypeProperty;
  value: string[];
  onChange: (val: Record<string, any>) => void;
  disabled?: boolean;
};

export const TagsField: React.FC<Props> = ({ property, value, onChange, disabled }) => {
  const tags = value ?? [];
  const [input, setInput] = useState("");

  const addTag = () => {
    const tag = input.trim();
    if (tag && !tags.includes(tag)) {
      onChange({ value: [...tags, tag] });
      setInput("");
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-accent-primary/10 px-2 py-0.5 text-11 text-accent-primary"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => onChange({ value: tags.filter((t) => t !== tag) })}
                className="hover:text-danger-primary"
              >
                <X className="h-2.5 w-2.5" />
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
          placeholder={`Add ${property.name.toLowerCase()}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
        />
      )}
    </div>
  );
};
