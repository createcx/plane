/**
 * Renders an emoji icon for an issue type.
 * Patched for Community Edition.
 */

import type { TIssueIdentifierSize } from "@plane/types";
import { useIssueTypes } from "@/plane-web/hooks/use-issue-types";

const EMOJI_SIZE_MAP: Record<TIssueIdentifierSize, string> = {
  xs: "text-xs leading-none",
  sm: "text-sm leading-none",
  md: "text-base leading-none",
  lg: "text-lg leading-none",
};

export function IssueTypeEmoji({
  typeId,
  size = "md",
}: {
  typeId: string | null | undefined;
  size?: TIssueIdentifierSize;
}) {
  const issueTypes = useIssueTypes();

  if (!typeId) return null;

  const issueType = issueTypes[typeId];
  if (!issueType?.logo_props) return null;

  const { logo_props } = issueType;

  if (logo_props.in_use === "emoji" && logo_props.emoji?.value) {
    const codePoint = parseInt(logo_props.emoji.value, 10);
    if (!isNaN(codePoint)) {
      const emoji = String.fromCodePoint(codePoint);
      return (
        <span className={`shrink-0 ${EMOJI_SIZE_MAP[size]}`} title={issueType.name}>
          {emoji}
        </span>
      );
    }
  }

  return null;
}
