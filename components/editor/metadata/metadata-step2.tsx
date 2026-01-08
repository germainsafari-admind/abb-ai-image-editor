"use client"

import { ChevronLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ImageState } from "@/types/editor"
import ImagePreview from "./image-preview"
import MetadataTags from "./metadata-tags"

interface MetadataResult {
  title: string
  description: string
  tags: string[]
}

interface MetadataStep2Props {
  imageState: ImageState
  metadata: MetadataResult
  onMetadataChange: (metadata: MetadataResult) => void
  newTag: string
  onNewTagChange: (tag: string) => void
  onAddTag: () => void
  previewFileName: string
  aiDisplayInfo: {
    isAIGenerated: boolean
    probability: number
  }
  isApplyingMetadata: boolean
  onApply: () => void
  onBack: () => void
}

export default function MetadataStep2({
  imageState,
  metadata,
  onMetadataChange,
  newTag,
  onNewTagChange,
  onAddTag,
  previewFileName,
  aiDisplayInfo,
  isApplyingMetadata,
  onApply,
  onBack,
}: MetadataStep2Props) {
  const removeTag = (tag: string) => {
    onMetadataChange({
      ...metadata,
      tags: metadata.tags.filter((t) => t !== tag),
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header - Reduced padding */}
      <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 lg:pt-6 pb-2 sm:pb-3 border-b border-border">
        <div className="text-xs text-muted-foreground mb-0.5">STEP 2/2</div>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold" style={{ fontFamily: 'var(--font-abb-voice-display)' }}>Metadata suggestions</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Start by selecting the source information. The metadata will be generated automatically based on your
          input.
        </p>
      </div>

      {/* Content - Reduced padding, especially bottom */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-5 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-4 min-h-0 overflow-hidden">
        <ImagePreview 
          imageState={imageState}
          aiDisplayInfo={aiDisplayInfo}
          previewFileName={previewFileName}
        />

        {/* Metadata fields - Reduced gaps */}
        <div className="flex-1 flex flex-col gap-2 sm:gap-2.5 min-w-0 min-h-0">
          <div className="flex-shrink-0">
            <label className="text-xs sm:text-sm font-medium mb-1 block">Title</label>
            <Input
              type="text"
              value={metadata.title}
              onChange={(e) => {
                const value = e.target.value.slice(0, 200)
                onMetadataChange({ ...metadata, title: value })
              }}
              className="w-full h-9 sm:h-10 text-sm"
              maxLength={200}
            />
            <div className="text-xs text-muted-foreground mt-0.5 text-right">
              {metadata.title.length}/200
            </div>
          </div>

          <div className="flex-shrink-0">
            <label className="text-xs sm:text-sm font-medium mb-1 block">Description</label>
            <textarea
              value={metadata.description}
              onChange={(e) => {
                const value = e.target.value.slice(0, 300)
                onMetadataChange({ ...metadata, description: value })
              }}
              rows={3}
              className="w-full p-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#E30613] resize-none"
              maxLength={300}
              style={{ 
                height: '90px',
                lineHeight: '1.4',
                overflowY: 'auto'
              }}
            />
            <div className="text-xs text-muted-foreground mt-0.5 text-right">
              {metadata.description.length}/300
            </div>
          </div>

          <div className="flex-shrink-0">
            <label className="text-xs sm:text-sm font-medium mb-1 block">AI suggested tags</label>
            <MetadataTags tags={metadata.tags} onRemoveTag={removeTag} />
          </div>

          <div className="flex-shrink-0">
            <label className="text-xs sm:text-sm font-medium mb-1 block">Add your tags</label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={newTag}
                onChange={(e) => onNewTagChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onAddTag()}
                placeholder="Type here..."
                className="flex-1 h-9 sm:h-10 text-sm"
              />
              <Button variant="outline" onClick={onAddTag} className="h-9 sm:h-10 text-sm">
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Reduced padding, no divider */}
      <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 pb-3 sm:pb-4 lg:pb-6 pt-2 sm:pt-3 flex justify-between">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="flex items-center gap-1"
          style={{
            height: '40px',
            borderRadius: '28px',
            paddingLeft: '20px',
            paddingRight: '20px',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={onApply}
          disabled={isApplyingMetadata}
          className="text-white transition-colors hover:opacity-90 disabled:opacity-50"
          style={{
            backgroundColor: '#FF000F',
            height: '40px',
            borderRadius: '28px',
            paddingLeft: '20px',
            paddingRight: '20px',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isApplyingMetadata ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Applying...
            </>
          ) : (
            "Apply Metadata"
          )}
        </Button>
      </div>
    </div>
  )
}

