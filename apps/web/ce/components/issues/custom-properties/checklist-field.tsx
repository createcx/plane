import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button, Checkbox, Input } from "@plane/ui";
import type { TIssueTypeProperty } from "@/plane-web/types/issue-types/issue-property-values";

type ChecklistItem = { text: string; checked: boolean };

type Props = {
  property: TIssueTypeProperty;
  value: ChecklistItem[];
  onChange: (val: Record<string, any>) => void;
  disabled?: boolean;
};

export const ChecklistField: React.FC<Props> = ({ property, value, onChange, disabled }) => {
  const items: ChecklistItem[] = value ?? [];
  const [newText, setNewText] = useState("");

  const update = (updated: ChecklistItem[]) => onChange({ items: updated });

  const toggleItem = (idx: number) => {
    const updated = items.map((item, i) =>
      i === idx ? { ...item, checked: !item.checked } : item
    );
    update(updated);
  };

  const removeItem = (idx: number) => {
    update(items.filter((_, i) => i !== idx));
  };

  const addItem = () => {
    if (!newText.trim()) return;
    update([...items, { text: newText.trim(), checked: false }]);
    setNewText("");
  };

  return (
    <div className="space-y-1">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2 group">
          <Checkbox
            checked={item.checked}
            onChange={() => toggleItem(idx)}
            disabled={disabled}
          />
          <span
            className={`flex-1 text-13 ${
              item.checked ? "line-through text-placeholder" : "text-secondary"
            }`}
          >
            {item.text}
          </span>
          {!disabled && (
            <button
              type="button"
              onClick={() => removeItem(idx)}
              className="opacity-0 group-hover:opacity-100 text-placeholder hover:text-danger-primary"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
      {!disabled && (
        <div className="flex items-center gap-1 mt-1">
          <Input
            type="text"
            mode="primary"
            inputSize="xs"
            className="flex-1"
            placeholder={`Add ${property.name.toLowerCase()} item...`}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem();
              }
            }}
          />
          <Button
            variant="accent-primary"
            size="sm"
            onClick={addItem}
            className="flex-shrink-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};
