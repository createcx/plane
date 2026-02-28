import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button, Input } from "@plane/ui";
import type { TIssueTypeProperty } from "@/plane-web/types/issue-types/issue-property-values";

type Entry = { text: string; at: string };

type Props = {
  property: TIssueTypeProperty;
  value: Entry[];
  onChange: (val: Record<string, any>) => void;
  disabled?: boolean;
};

export const TimestampedTextField: React.FC<Props> = ({ property, value, onChange, disabled }) => {
  const entries: Entry[] = value ?? [];
  const [newText, setNewText] = useState("");

  const addEntry = () => {
    if (!newText.trim()) return;
    onChange({
      entries: [...entries, { text: newText.trim(), at: new Date().toISOString() }],
    });
    setNewText("");
  };

  return (
    <div className="space-y-1">
      {entries.map((entry, idx) => (
        <div key={idx} className="flex items-start gap-2 text-13">
          <span className="flex-shrink-0 text-11 text-placeholder mt-0.5">
            {new Date(entry.at).toLocaleString()}
          </span>
          <span className="text-secondary">{entry.text}</span>
        </div>
      ))}
      {!disabled && (
        <div className="flex items-center gap-1 mt-1">
          <Input
            type="text"
            mode="transparent"
            inputSize="xs"
            className="flex-1"
            placeholder={`Add ${property.name.toLowerCase()} entry...`}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addEntry();
              }
            }}
          />
          <Button
            variant="accent-primary"
            size="sm"
            onClick={addEntry}
            className="flex-shrink-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};
