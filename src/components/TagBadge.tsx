import type { StationTag } from "@/lib/types";

interface TagBadgeProps {
    tag: StationTag;
    size?: "sm" | "md";
}

export function TagBadge({ tag, size = "sm" }: TagBadgeProps) {
    const sizeClasses =
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wide ${sizeClasses} ${tag.color} text-white`}
        >
      <span>{tag.emoji}</span>
      <span>{tag.label}</span>
    </span>
    );
}
