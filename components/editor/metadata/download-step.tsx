"use client"

import { DownloadIcon, ExternalLink, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import type { ImageState } from "@/types/editor"

interface DownloadStepProps {
  format: "PNG" | "JPG"
  onFormatChange: (format: "PNG" | "JPG") => void
  transparentBg: boolean
  onTransparentBgChange: (transparent: boolean) => void
  imageState: ImageState
  metadataApplied: boolean
  previewFileName: string
  isDownloading: boolean
  isMediaBankWidthSupported: boolean
  onDownload: () => void
  onUploadToMediaBank: () => void
  onCancel: () => void
}

export default function DownloadStep({
  format,
  onFormatChange,
  transparentBg,
  onTransparentBgChange,
  imageState,
  metadataApplied,
  previewFileName,
  isDownloading,
  isMediaBankWidthSupported,
  onDownload,
  onUploadToMediaBank,
  onCancel,
}: DownloadStepProps) {
  const imageSize = `${imageState.width} x ${imageState.height} px`

  return (
    <>
      <h2 
        className="text-2xl font-bold mb-12 text-black"
        style={{ fontFamily: 'var(--font-abb-voice-display)' }}
      >
        EXPORT OPTIONS
      </h2>

      <div className="flex flex-col gap-12">
        {/* Format selection */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-black">Choose file type</label>
          <div className="flex flex-col gap-2">
            {(["PNG", "JPG"] as const).map((fmt) => (
              <label 
                key={fmt} 
                className="flex items-center gap-2 cursor-pointer"
                style={{ minHeight: '24px' }}
              >
                <div className="relative">
                  <input
                    type="radio"
                    name="format"
                    checked={format === fmt}
                    onChange={() => onFormatChange(fmt)}
                    className="sr-only"
                  />
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-black bg-white flex items-center justify-center transition-all"
                  >
                    {format === fmt && (
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: '#6764F6' }}
                      />
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium text-black">{fmt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Transparent background */}
        <label 
          className={`flex items-center gap-3 ${format === "JPG" || imageState.isBlurred ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <input
            type="checkbox"
            checked={transparentBg}
            onChange={(e) => onTransparentBgChange(e.target.checked)}
            disabled={format === "JPG" || imageState.isBlurred}
            className="w-4 h-4 rounded border-gray-300 accent-[#E30613] disabled:cursor-not-allowed"
          />
          <span className="text-sm text-gray-500">Transparent background</span>
        </label>

        {/* Info row */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs font-medium text-black mb-1">Image size</div>
            <div className={`flex items-center gap-1.5 ${imageState.width < 1440 ? "text-[#FF000F]" : "text-gray-500"}`}>
              <span className={`text-sm font-medium ${imageState.width < 1440 ? "text-[#FF000F]" : "text-gray-500"}`}>
                {imageSize}
              </span>
              {imageState.width < 1440 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center cursor-help">
                      <Info className="w-4 h-4 text-[#FF000F]" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This image width is not supported when uploading to the media bank.</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-black mb-1">Metadata</div>
            <div className="text-sm font-medium text-gray-500">{metadataApplied ? "Added" : "Not added"}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-black mb-1">File name preview:</div>
            <div className="text-sm font-medium text-gray-500 truncate">
              {metadataApplied 
                ? `${previewFileName}.${format.toLowerCase()}` 
                : imageState.originalFileName 
                  ? `${imageState.originalFileName.replace(/\.[^/.]+$/, "")}.${format.toLowerCase()}`
                  : `image.${format.toLowerCase()}`
              }
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="transition-colors hover:opacity-90"
            style={{
              height: '48px',
              borderRadius: '28px',
              borderWidth: '2px',
              borderColor: '#000000',
              paddingLeft: '24px',
              paddingRight: '24px',
              fontSize: '16px',
              fontWeight: 500,
              backgroundColor: 'transparent',
              color: '#000000'
            }}
          >
            Cancel
          </Button>
          <div className="flex gap-3">
            <Button
              onClick={onDownload}
              disabled={isDownloading}
              className="text-white transition-colors hover:opacity-90 disabled:opacity-50"
              style={{
                backgroundColor: '#FF000F',
                height: '48px',
                borderRadius: '28px',
                paddingLeft: '24px',
                paddingRight: '24px',
                fontSize: '16px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Download
              <DownloadIcon className="w-5 h-5" />
            </Button>
            <Button
              onClick={onUploadToMediaBank}
              disabled={isDownloading || !isMediaBankWidthSupported}
              className="text-white transition-colors hover:opacity-90 disabled:opacity-50"
              style={{
                backgroundColor: '#FF000F',
                height: '48px',
                borderRadius: '28px',
                paddingLeft: '24px',
                paddingRight: '24px',
                fontSize: '16px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Upload to Media Bank
              <ExternalLink className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

