import React, { useRef } from "react";
import type { EditorRefApi } from "@plane/editor";
import type { TIssueTypeProperty } from "@/plane-web/types/issue-types/issue-property-values";
import { LiteTextEditor } from "@/components/editor/lite-text";
import { useWorkspace } from "@/hooks/store/use-workspace";

type Props = {
  property: TIssueTypeProperty;
  value: string;
  onChange: (val: Record<string, any>) => void;
  disabled?: boolean;
  workspaceSlug?: string;
};

export const RichTextField: React.FC<Props> = ({ property, value, onChange, disabled, workspaceSlug }) => {
  const editorRef = useRef<EditorRefApi>(null);
  const { getWorkspaceBySlug } = useWorkspace();
  const workspaceId = workspaceSlug ? (getWorkspaceBySlug(workspaceSlug)?.id as string) : "";

  if (!workspaceSlug || !workspaceId) {
    return (
      <textarea
        className="w-full min-h-[80px] rounded-md border border-subtle-1 bg-transparent px-3 py-2 text-13 text-primary placeholder:text-placeholder focus:outline-none"
        rows={3}
        placeholder={property.name}
        value={value ?? ""}
        onChange={(e) => onChange({ value: e.target.value })}
        disabled={disabled}
      />
    );
  }

  return (
    <div className="w-full min-h-[60px]">
      <LiteTextEditor
        editable={!disabled}
        ref={editorRef}
        workspaceId={workspaceId}
        workspaceSlug={workspaceSlug}
        id={`property_${property.id}`}
        value={value ?? "<p></p>"}
        initialValue={value ?? "<p></p>"}
        onChange={(_json: object, html: string) => {
          onChange({ value: html });
        }}
        variant="none"
        placeholder={`Enter ${property.name.toLowerCase()}...`}
        showSubmitButton={false}
        showToolbarInitially={false}
        containerClassName="min-h-[40px]"
        parentClassName="!border-0"
        uploadFile={async () => ""}
        fontSize="small-font"
      />
    </div>
  );
};
