/**
 * Hook to manage HITL gate state for issue state transitions.
 * When an issue update returns a HITL gate error, this hook
 * stores the gate info so the dialog can be shown.
 */

import { useState, useCallback } from "react";

export type THitlGateState = {
  isOpen: boolean;
  gateText: string;
  issueId: string;
  projectId: string;
  workspaceSlug: string;
  targetStateId: string;
  pendingData: Record<string, any>;
};

const INITIAL_STATE: THitlGateState = {
  isOpen: false,
  gateText: "",
  issueId: "",
  projectId: "",
  workspaceSlug: "",
  targetStateId: "",
  pendingData: {},
};

export function useHitlGate() {
  const [state, setState] = useState<THitlGateState>(INITIAL_STATE);

  /**
   * Wraps an issue update call. If the error contains hitl_gate: true,
   * opens the dialog instead of propagating the error.
   * Returns true if the update was handled (either succeeded or opened dialog).
   */
  const wrapUpdate = useCallback(
    async (
      updateFn: (data: Record<string, any>) => Promise<any>,
      data: Record<string, any>,
      meta: { issueId: string; projectId: string; workspaceSlug: string }
    ): Promise<boolean> => {
      try {
        await updateFn(data);
        return true;
      } catch (err: any) {
        if (err?.hitl_gate) {
          setState({
            isOpen: true,
            gateText: err.gate_text || "HITL approval required.",
            issueId: meta.issueId,
            projectId: meta.projectId,
            workspaceSlug: meta.workspaceSlug,
            targetStateId: data.state_id || "",
            pendingData: data,
          });
          return true; // handled
        }
        throw err; // re-throw non-HITL errors
      }
    },
    []
  );

  const submitSummary = useCallback(
    async (
      summary: string,
      updateFn: (data: Record<string, any>) => Promise<any>
    ) => {
      await updateFn({
        ...state.pendingData,
        human_summary: summary,
      });
      setState(INITIAL_STATE);
    },
    [state.pendingData]
  );

  const cancel = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return { hitlState: state, wrapUpdate, submitSummary, cancel };
}
