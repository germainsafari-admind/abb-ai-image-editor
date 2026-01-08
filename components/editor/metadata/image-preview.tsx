"use client"

import type { ImageState } from "@/types/editor"

interface ImagePreviewProps {
  imageState: ImageState
  aiDisplayInfo: {
    isAIGenerated: boolean
    probability: number
  }
  previewFileName: string
}

export default function ImagePreview({ imageState, aiDisplayInfo, previewFileName }: ImagePreviewProps) {
  return (
    <div className="w-full lg:w-[260px] xl:w-[300px] flex-shrink-0 flex flex-col gap-2">
      <div className="w-full h-[120px] sm:h-[150px] lg:h-auto lg:flex-1 lg:min-h-0 rounded-lg border border-border overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#F0F0F0' }}>
        <img
          src={imageState.currentUrl || "/placeholder.svg"}
          alt="Preview"
          className="max-w-full max-h-full object-contain"
        />
      </div>
      <div 
        className="flex items-center justify-between text-xs px-2 py-1 sm:py-1.5 rounded flex-shrink-0"
        style={{ 
          backgroundColor: aiDisplayInfo.isAIGenerated ? '#F8EAD0' : '#EBF1FF',
          fontFamily: 'var(--font-abb-voice)',
          fontSize: '12px',
          lineHeight: '150%',
          letterSpacing: '0%'
        }}
      >
        <span style={{ fontWeight: 400 }}>
          {aiDisplayInfo.isAIGenerated ? "Likely" : "Not likely"} to be <span style={{ fontWeight: 500 }}>AI-generated</span>
        </span>
        <span className="px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
          {aiDisplayInfo.probability}%
        </span>
      </div>
      <div className="text-xs text-muted-foreground flex-shrink-0">
        <div className="font-medium mb-0.5 sm:mb-1">File name preview:</div>
        <div className="text-foreground" style={{ color: '#6764F6' }}>{previewFileName}.jpg</div>
      </div>
    </div>
  )
}

