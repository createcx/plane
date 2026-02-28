import React, { useRef } from "react";
import type { EditorRefApi } from "@plane/editor";
import { LiteTextEditor } from "@/components/editor/lite-text";
import { useWorkspace } from "@/hooks/store/use-workspace";
import type { TIssueTypeProperty } from "@/plane-web/types/issue-types/issue-property-values";

type Props = {
  property: TIssueTypeProperty;
  value: string;
  onChange: (val: Record<string, any>) => void;
  disabled?: boolean;
  workspaceSlug: string;
};

export const RichTextField: React.FC<Props> = ({ property, value, onChange, disabled, workspaceSlug }) => {
  const editorRef = useRef<EditorRefApi>(null);
  const workspaceStore = useWorkspace();
  const workspaceId = workspaceStore.getWorkspaceBySlug(workspaceSlug)?.id as string;

  return (
    <LiteTextEditor
      ref={editorRef}
      editable={!disabled}
      id={`prop_${property.id}`}
      initialValue={value || "<p></p>"}
      workspaceSlug={workspaceSlug}
      workspaceId={workspaceId}
      uploadFile={async () => ""}
      duplicateFile={async () => ""}
      onChange={(_json, html) => onChange({ value: html })}
      placeholder={property.name}
      containerClassName="min-h-[80px]"
      displayConfig={{ fontSize: "small-font" }}
      showSubmitButton={false}
      showToolbarInitially={false}
      variant="full"
      parentClassName="p-0"
    />
  );
};
