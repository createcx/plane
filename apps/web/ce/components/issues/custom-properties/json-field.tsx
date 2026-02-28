import React, { useState, useEffect } from "react";
import { TextArea } from "@plane/ui";
import type { TIssueTypeProperty } from "@/plane-web/types/issue-types/issue-property-values";

type Props = {
  property: TIssueTypeProperty;
  value: any;
  onChange: (val: Record<string, any>) => void;
  disabled?: boolean;
};

export const JsonField: React.FC<Props> = ({ property, value, onChange, disabled }) => {
  const [text, setText] = useState(() => (value ? JSON.stringify(value, null, 2) : ""));
  const [error, setError] = useState("");

  useEffect(() => {
    if (value) setText(JSON.stringify(value, null, 2));
  }, [value]);

  const handleBlur = () => {
    if (!text.trim()) {
      onChange({ value: null });
      setError("");
      return;
    }
    try {
      const parsed = JSON.parse(text);
      onChange({ value: parsed });
      setError("");
    } catch {
      setError("Invalid JSON");
    }
  };

  return (
    <div>
      <TextArea
        mode="primary"
        hasError={!!error}
        className="w-full min-h-[100px] font-mono text-11"
        placeholder={`${property.name} (JSON)`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        disabled={disabled}
      />
      {error && <p className="mt-0.5 text-11 text-danger-primary">{error}</p>}
    </div>
  );
};
