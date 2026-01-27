"use client"

import { useState } from "react"
import Image from "next/image"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import DownloadModal from "./download-modal"
import MetadataPromptModal from "./metadata-prompt-modal"
import { CropIcon, AIIcon, BlurIcon } from "@/components/icons/abb-icons"
import type { ImageState, EditorMode } from "@/types/editor"

interface ControlsRowProps {
  canUndo: boolean
  canRedo: boolean
  isBlurred: boolean
  editorMode: EditorMode
  onUndo: () => void
  onRedo: () => void
  onBlur: () => void
  onModeChange: (mode: EditorMode) => void
  onCropApply: (croppedUrl: string, width: number, height: number) => void
  onAIEditApply: (editedUrl: string) => void
  imageState: ImageState
  hasCropPresetSelected?: boolean
  containerWidth?: number | null
}

export default function ControlsRow({
  canUndo,
  canRedo,
  isBlurred,
  editorMode,
  onUndo,
  onRedo,
  onBlur,
  onModeChange,
  imageState,
  hasCropPresetSelected = false,
}: ControlsRowProps) {
  const [showMetadataPrompt, setShowMetadataPrompt] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [skipMetadata, setSkipMetadata] = useState(false)

  const isCropMode = editorMode === "crop"
  const isAIEditMode = editorMode === "ai-edit" || editorMode === "ai-result"

  const showApplyCrop = isCropMode && hasCropPresetSelected

  const handleDownloadClick = () => {
    // If blur is the last operation, skip metadata prompt and go directly to download modal
    if (isBlurred) {
      setSkipMetadata(true)
      setShowDownloadModal(true)
    } else {
      setShowMetadataPrompt(true)
    }
  }

  const handleNoThanks = () => {
    setShowMetadataPrompt(false)
    setSkipMetadata(true)
    setShowDownloadModal(true)
  }

  const handleAddMetadata = () => {
    setShowMetadataPrompt(false)
    setSkipMetadata(false)
    setShowDownloadModal(true)
  }

  return (
    <>
      {/* Controls container - matches Figma design */}
      <div
        className="flex justify-center px-4 sm:px-6 flex-shrink-0 mt-4 mb-6"
      >
        <div className="w-full max-w-5xl flex justify-center">
          {/* Bottom Bar Component - Rectangular with rounded corners */}
          <div
            className="w-full flex items-center justify-between bg-[#F0F0F0] rounded-lg"
            style={{ height: "64px", padding: "8px 12px" }}
          >
            {/* Left Group: Undo/Redo */}
            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onUndo}
                    disabled={!canUndo}
                    className="h-9 w-9 p-0 rounded-md text-[#000000] hover:bg-[#FFF] active:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Image src="/undo.svg" alt="Undo" width={18} height={18} className="w-[18px] h-[18px]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Undo</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRedo}
                    disabled={!canRedo}
                    className="h-9 w-9 p-0 rounded-md text-[#000000] hover:bg-[#FFF] active:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Image src="/redo.svg" alt="Redo" width={18} height={18} className="w-[18px] h-[18px]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Redo</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Center Group: Main Tools */}
            <div className="flex items-center gap-1">
              {/* Crop Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onModeChange(isCropMode ? "view" : "crop")}
                    className={`h-9 w-9 p-0 rounded-md text-[#000000] hover:bg-[#FFF] transition-colors [&_svg]:text-[#000000] ${
                      isCropMode
                        ? "bg-[#6764F6] hover:bg-[#FFF] active:bg-[#4542D4]"
                        : "active:bg-gray-200"
                    }`}
                  >
                    <CropIcon className="w-[18px] h-[18px]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Crop</p>
                </TooltipContent>
              </Tooltip>

              {/* AI Edit Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onModeChange(isAIEditMode ? "view" : "ai-edit")}
                    className={`h-9 w-9 p-0 rounded-md text-[#000000] hover:bg-[#FFF] transition-colors [&_svg]:text-[#000000] ${
                      isAIEditMode
                        ? "bg-[#6764F6] hover:bg-[#FFF] active:bg-[#4542D4]"
                        : "active:bg-gray-200"
                    }`}
                  >
                    <AIIcon className="w-[18px] h-[18px]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Change scene</p>
                </TooltipContent>
              </Tooltip>

              {/* Blur/Droplet Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBlur}
                    className={`h-9 w-9 p-0 rounded-md text-[#000000] hover:bg-[#FFF] transition-colors [&_svg]:text-[#000000] ${
                      isBlurred
                        ? "bg-[#6764F6] hover:bg-[#FFF] active:bg-[#4542D4]"
                        : "active:bg-gray-200"
                    }`}
                  >
                    <BlurIcon className="w-[18px] h-[18px]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Blur</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Right Group: Export Options or Apply Crop */}
            <div className="flex items-center">
              {showApplyCrop ? (
                <Button
                  onClick={() => {
                    const event = new CustomEvent("applyCrop")
                    window.dispatchEvent(event)
                  }}
                  className="bg-[#E30613] hover:bg-[#c70510] active:bg-[#b0040e] text-white rounded-full px-4 sm:px-5 h-12 text-sm font-semibold transition-colors"
                >
                  Apply Crop
                </Button>
              ) : (
                <Button
                  onClick={handleDownloadClick}
                  variant="outline"
                  className="rounded-[28px] px-4 h-12 text-sm font-semibold bg-white border border-black/100 text-gray-800 hover:text-gray-950 hover:bg-gray-50 active:bg-gray-100 hover:border-black/80 transition-colors"
                  style={{
                    gap: "8px",
                    borderWidth: "1px",
                  }}
                >
                  <span>Export options</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Metadata Prompt Modal */}
      <MetadataPromptModal
        isOpen={showMetadataPrompt}
        onClose={() => setShowMetadataPrompt(false)}
        onNoThanks={handleNoThanks}
        onAddMetadata={handleAddMetadata}
        isBlurred={isBlurred}
      />

      {/* Download Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        imageState={imageState}
        onClose={() => setShowDownloadModal(false)}
        skipToDownload={skipMetadata}
      />
    </>
  )
}
