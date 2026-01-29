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
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="metadata-tag-box group inline-flex items-center justify-center gap-[var(--Spacing-Component-xxxx-small,4px)] h-8 py-[var(--Spacing-Component-xxx-small,8px)] px-[var(--Spacing-Component-xx-small,16px)] font-normal bg-[var(--Primary-White,#FFF)] border border-[var(--ABB-Black,#000)] text-[var(--Grey---90,#1F1F1F)] transition-colors hover:border-2 hover:border-[var(--ABB-Lilac,#6764F6)]"
          style={{
            fontFamily: 'var(--font-abb-voice), ABBvoice, sans-serif',
            fontSize: 'var(--Typography-Size-Body-x-small, 14px)',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'var(--Typography-Line-Height-Body-x-small, 21px)',
            letterSpacing: 'var(--Typography-Letter-Spacing-Body-x-small, 0)',
            textAlign: 'center',
          }}
        >
          {tag}
          {!isFixed(tag) && (
            <button
              onClick={() => onRemoveTag(tag)}
              className="text-inherit hover:opacity-80 transition-opacity shrink-0 flex items-center justify-center"
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

