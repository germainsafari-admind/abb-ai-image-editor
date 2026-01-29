"use client"

import { Info, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { ImageState } from "@/types/editor"
import ImagePreview from "./image-preview"

const BUSINESS_OPTIONS = [
  "Corporate",
  "Electrification",
  "Process Automation",
  "Motion",
  "Robotics & Discrete Automation",
]
const ASSET_TYPE_OPTIONS = ["Key Visual", "Rollup", "Banner", "Poster", "Illustration", "Photo"]

interface SourceInfo {
  business: string
  campaign: string
  campaignEnabled: boolean
  product: string
  productEnabled: boolean
  assetType: string
}

interface MetadataStep1Props {
  imageState: ImageState
  sourceInfo: SourceInfo
  onSourceInfoChange: (info: SourceInfo) => void
  previewFileName: string
  aiDisplayInfo: {
    isAIGenerated: boolean
    probability: number
  }
  canGenerateMetadata: boolean
  isGenerating: boolean
  onGenerate: () => void
  onCancel: () => void
}

export default function MetadataStep1({
  imageState,
  sourceInfo,
  onSourceInfoChange,
  previewFileName,
  aiDisplayInfo,
  canGenerateMetadata,
  isGenerating,
  onGenerate,
  onCancel,
}: MetadataStep1Props) {
  return (
    <div className="flex flex-col h-full">
      {/* Header - Reduced padding */}
      <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 lg:pt-6 pb-2 sm:pb-3 border-b border-border">
        <div className="text-xs text-muted-foreground mb-0.5">STEP 1/2</div>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold" style={{ fontFamily: 'var(--font-abb-voice-display)' }}>Metadata suggestions</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Start by selecting the source information. The metadata will be generated automatically based on your
          input.
        </p>
      </div>

      {/* Content - Reduced padding */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-5 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-4 min-h-0 overflow-auto">
        <ImagePreview 
          imageState={imageState}
          aiDisplayInfo={aiDisplayInfo}
          previewFileName={previewFileName}
        />

        {/* Form fields */}
        <div className="flex-1 flex flex-col gap-3 sm:gap-4 min-w-0 min-h-0">
          <div className="flex-shrink-0">
            <label className="flex items-center gap-1 text-sm font-medium mb-2">
              Division/Business name*
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </label>
            <Select
              value={sourceInfo.business}
              onValueChange={(value) => onSourceInfoChange({ ...sourceInfo, business: value })}
            >
              <SelectTrigger 
                className="w-full h-auto min-h-[41px] py-[10px] px-3 rounded-lg border border-[var(--ABB-Black)] bg-[var(--Primary-White)] text-foreground focus-visible:border-[var(--ABB-Black)] focus-visible:ring-2 focus-visible:ring-[var(--ABB-Black)]/20 focus-visible:ring-offset-0 hover:border-[var(--ABB-Black)] data-[state=open]:border-[var(--ABB-Black)] data-[state=open]:ring-2 data-[state=open]:ring-[var(--ABB-Black)]/20"
              >
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Switch
                checked={sourceInfo.campaignEnabled}
                onCheckedChange={(checked) =>
                  onSourceInfoChange({ ...sourceInfo, campaignEnabled: checked, campaign: checked ? sourceInfo.campaign : "" })
                }
              />
              <label className="text-sm font-medium">Campaign name</label>
            </div>
            {sourceInfo.campaignEnabled && (
              <Input
                type="text"
                value={sourceInfo.campaign}
                onChange={(e) => onSourceInfoChange({ ...sourceInfo, campaign: e.target.value })}
                placeholder="Type here..."
                className="metadata-step1-input w-full flex-1 min-w-0 h-auto py-[10px] px-3 rounded-lg border border-[var(--ABB-Black)] bg-[var(--Primary-White)] text-foreground placeholder:text-muted-foreground focus-visible:border-[var(--ABB-Black)] focus-visible:ring-2 focus-visible:ring-[var(--ABB-Black)]/20 focus-visible:ring-offset-0 selection:bg-[var(--ABB-Black)] selection:text-[var(--Primary-White)]"
              />
            )}
          </div>

          <div className="flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Switch
                checked={sourceInfo.productEnabled}
                onCheckedChange={(checked) =>
                  onSourceInfoChange({ ...sourceInfo, productEnabled: checked, product: checked ? sourceInfo.product : "" })
                }
              />
              <label className="text-sm font-medium">Product name</label>
            </div>
            {sourceInfo.productEnabled && (
              <Input
                type="text"
                value={sourceInfo.product}
                onChange={(e) => onSourceInfoChange({ ...sourceInfo, product: e.target.value })}
                placeholder="Type here..."
                className="metadata-step1-input w-full flex-1 min-w-0 h-auto py-[10px] px-3 rounded-lg border border-[var(--ABB-Black)] bg-[var(--Primary-White)] text-foreground placeholder:text-muted-foreground focus-visible:border-[var(--ABB-Black)] focus-visible:ring-2 focus-visible:ring-[var(--ABB-Black)]/20 focus-visible:ring-offset-0 selection:bg-[var(--ABB-Black)] selection:text-[var(--Primary-White)]"
              />
            )}
          </div>

          <div className="flex-shrink-0">
            <label className="flex items-center gap-1 text-sm font-medium mb-2">
              Asset type*
              <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </label>
            <Select
              value={sourceInfo.assetType}
              onValueChange={(value) => onSourceInfoChange({ ...sourceInfo, assetType: value })}
            >
              <SelectTrigger 
                className="w-full h-auto min-h-[41px] py-[10px] px-3 rounded-lg border border-[var(--ABB-Black)] bg-[var(--Primary-White)] text-foreground focus-visible:border-[var(--ABB-Black)] focus-visible:ring-2 focus-visible:ring-[var(--ABB-Black)]/20 focus-visible:ring-offset-0 hover:border-[var(--ABB-Black)] data-[state=open]:border-[var(--ABB-Black)] data-[state=open]:ring-2 data-[state=open]:ring-[var(--ABB-Black)]/20"
              >
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {ASSET_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Footer - Reduced padding, no divider line */}
      <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 pb-3 sm:pb-4 lg:pb-6 pt-2 sm:pt-3 flex justify-between">
        <button 
          onClick={onCancel}
          className="abb-gradient-hover-pill"
          style={{
            height: '40px',
            paddingLeft: '20px',
            paddingRight: '20px',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          <span className="text-[#000000]">Cancel</span>
        </button>
        <Button
          onClick={onGenerate}
          disabled={!canGenerateMetadata || isGenerating}
          className="abb-red-button-gradient-hover text-white disabled:opacity-50"
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
            gap: '8px'
          }}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

