/**
 * Custom hook to fetch and cache workspace issue types.
 * Uses React 18 useSyncExternalStore for compatibility with MobX observer() parents.
 */

import { useSyncExternalStore, useEffect } from "react";
import { useWorkspace } from "@/hooks/store/use-workspace";

type TIssueTypeData = {
  id: string;
  name: string;
  description: string;
  logo_props: {
    in_use: string;
    emoji?: { value: string };
    icon?: { name: string; color: string };
  };
  is_epic: boolean;
  is_default: boolean;
  is_active: boolean;
  level: number;
};

// Simple external store
let cache: Record<string, Record<string, TIssueTypeData>> = {};
let fetching: Record<string, boolean> = {};
let listeners: Set<() => void> = new Set();
let version = 0;

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

function getSnapshot() {
  return version;
}

function notify() {
  version++;
  listeners.forEach((cb) => cb());
}

function fetchIssueTypes(slug: string) {
  if (cache[slug] || fetching[slug]) return;
  fetching[slug] = true;

  fetch(`/api/workspaces/${slug}/issue-types/`, { credentials: "include" })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data: TIssueTypeData[]) => {
      const map: Record<string, TIssueTypeData> = {};
      data.forEach((t) => { map[t.id] = t; });
      cache[slug] = map;
      notify();
    })
    .catch((err) => {
      console.warn("[useIssueTypes] Failed to fetch:", err);
      fetching[slug] = false;
    });
}

export function useIssueTypes(): Record<string, TIssueTypeData> {
  const { currentWorkspace } = useWorkspace();
  const slug = currentWorkspace?.slug;

  // Subscribe to store updates - this makes the component re-render when data arrives
  useSyncExternalStore(subscribe, getSnapshot);

  useEffect(() => {
    if (slug) fetchIssueTypes(slug);
  }, [slug]);

  return slug ? (cache[slug] ?? {}) : {};
}
