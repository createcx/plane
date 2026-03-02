/**
 * Custom hook to fetch and cache issue type property definitions + per-issue values.
 * Uses React 18 useSyncExternalStore for compatibility with MobX observer() parents.
 */

import { useSyncExternalStore, useEffect, useCallback } from "react";
import { useWorkspace } from "@/hooks/store/use-workspace";
import type {
  TIssueTypeProperty,
  TIssuePropertyValue,
  TIssuePropertyValues,
} from "@/plane-web/types/issue-types/issue-property-values";
import { IssuePropertyService } from "@/services/issue/issue_property.service";

const propertyService = new IssuePropertyService();

// --- Property definitions cache (per type_id) ---
let defCache: Record<string, TIssueTypeProperty[]> = {};
let defFetching: Record<string, boolean> = {};

// --- Property values cache (per issue_id) ---
let valCache: Record<string, TIssuePropertyValues> = {};
let valFetching: Record<string, boolean> = {};

// --- External store plumbing ---
let listeners: Set<() => void> = new Set();
let version = 0;

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  return version;
}

function notify() {
  version++;
  listeners.forEach((cb) => cb());
}

// --- Fetch helpers ---
async function fetchDefinitions(workspaceSlug: string, typeId: string) {
  if (defCache[typeId] || defFetching[typeId]) return;
  defFetching[typeId] = true;

  try {
    const data = await propertyService.getPropertyDefinitions(workspaceSlug, typeId);
    defCache[typeId] = data;
    notify();
  } catch (err) {
    console.warn("[useIssueTypeProperties] Failed to fetch definitions:", err);
    defFetching[typeId] = false;
  }
}

async function fetchValues(workspaceSlug: string, projectId: string, issueId: string) {
  if (valFetching[issueId]) return;
  // Only skip if we already have a non-empty cache entry
  if (valCache[issueId] && Object.keys(valCache[issueId]).length > 0) return;
  valFetching[issueId] = true;

  try {
    const data = await propertyService.getPropertyValues(workspaceSlug, projectId, issueId);
    const map: TIssuePropertyValues = {};
    data.forEach((v: TIssuePropertyValue) => {
      map[v.property] = v.value_json;
    });
    valCache[issueId] = map;
    notify();
  } catch (err) {
    console.warn("[useIssueTypeProperties] Failed to fetch values:", err);
    valFetching[issueId] = false;
  }
}

export function useIssueTypeProperties(typeId?: string | null) {
  const { currentWorkspace } = useWorkspace();
  const slug = currentWorkspace?.slug;

  useSyncExternalStore(subscribe, getSnapshot);

  useEffect(() => {
    if (slug && typeId) fetchDefinitions(slug, typeId);
  }, [slug, typeId]);

  const definitions = typeId ? defCache[typeId] ?? [] : [];
  // Filter out maps_to_builtin
  const customDefinitions = definitions.filter((d) => !d.maps_to_builtin);

  return { definitions, customDefinitions };
}

export function useIssuePropertyValues(
  projectId?: string | null,
  issueId?: string | null
) {
  const { currentWorkspace } = useWorkspace();
  const slug = currentWorkspace?.slug;

  useSyncExternalStore(subscribe, getSnapshot);

  useEffect(() => {
    if (slug && projectId && issueId) fetchValues(slug, projectId, issueId);
  }, [slug, projectId, issueId]);

  const values: TIssuePropertyValues = issueId ? valCache[issueId] ?? {} : {};

  const updateValues = useCallback(
    async (newValues: TIssuePropertyValues) => {
      if (!slug || !projectId || !issueId) return;
      const result = await propertyService.bulkUpsertPropertyValues(
        slug,
        projectId,
        issueId,
        newValues
      );
      // Update cache
      const map: TIssuePropertyValues = { ...(valCache[issueId] ?? {}) };
      result.forEach((v: TIssuePropertyValue) => {
        map[v.property] = v.value_json;
      });
      valCache[issueId] = map;
      notify();
    },
    [slug, projectId, issueId]
  );

  /** Invalidate cached values for an issue so next mount re-fetches */
  const invalidate = useCallback(() => {
    if (issueId) {
      delete valCache[issueId];
      delete valFetching[issueId];
      notify();
    }
  }, [issueId]);

  return { values, updateValues, invalidate };
}
