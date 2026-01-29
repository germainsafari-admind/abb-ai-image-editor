"use client"

import { X } from "lucide-react"

interface MetadataTagsProps {
  tags: string[]
  onRemoveTag: (tag: string) => void
  /** Tags that are always shown and cannot be removed (e.g. "AI generated" when edited in-system) */
  fixedTags?: string[]
}

export default function MetadataTags({ tags, onRemoveTag, fixedTags = [] }: MetadataTagsProps) {
  const isFixed = (tag: string) => fixedTags.includes(tag)

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium bg-white border border-black text-foreground"
          style={{
            borderWidth: '1.5px'
          }}
        >
          {tag}
          {!isFixed(tag) && (
            <button
              onClick={() => onRemoveTag(tag)}
              className="text-foreground hover:text-foreground/70 transition-colors ml-0.5"
              type="button"
              aria-label={`Remove ${tag} tag`}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </span>
      ))}
    </div>
  )
}

