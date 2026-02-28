/**
 * HITL Gate Dialog — shown when an issue state change to "Done" requires human approval.
 * Intercepts the 400 response from the API and prompts for a 2-sentence summary.
 */

import React, { useState } from "react";
import { Button, TextArea } from "@plane/ui";
import { Dialog, EDialogWidth } from "@plane/propel/dialog";

type Props = {
  isOpen: boolean;
  gateText: string;
  onSubmit: (summary: string) => void;
  onCancel: () => void;
};

export const HitlGateDialog: React.FC<Props> = ({ isOpen, gateText, onSubmit, onCancel }) => {
  const [summary, setSummary] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (summary.trim()) {
      onSubmit(summary.trim());
      setSummary("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <Dialog.Panel width={EDialogWidth.MD} position="center">
        <div className="p-5">
          <Dialog.Title>HITL Approval Required</Dialog.Title>
          <div className="mt-3 rounded border border-warning-subtle bg-warning-subtle p-3 text-13 text-warning-primary">
            {gateText}
          </div>
          <p className="text-13 text-tertiary mt-3">
            This work item requires human approval before marking as Done.
            Please provide a brief (2-sentence) summary of what was accomplished.
          </p>
          <form onSubmit={handleSubmit} className="mt-3">
            <TextArea
              mode="primary"
              className="w-full min-h-[80px]"
              placeholder="Summarize the work completed..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              autoFocus
            />
            <div className="mt-3 flex justify-end gap-2">
              <Button
                variant="neutral-primary"
                size="md"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={!summary.trim()}
              >
                Approve & Complete
              </Button>
            </div>
          </form>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};
