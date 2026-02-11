import type { StationTag } from "@/lib/types";

interface TagBadgeProps {
  tag: StationTag;
}

export function TagBadge({ tag }: TagBadgeProps) {
  return (
    <span className={`tag-badge ${tag.color}`}>
      <span>{tag.emoji}</span>
      <span>{tag.label}</span>
    </span>
  );
}
