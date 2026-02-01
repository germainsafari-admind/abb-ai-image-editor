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
  // When crop or AI edit panel is open, hide tooltips so they don't overlap the popup; hover only changes bg
  const showMainTooltips = !isCropMode && !isAIEditMode

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
      {/* Controls container: 24px gap above (image card → control row); extra space below */}
      <div
        data-editor-controls
        className="flex justify-center px-4 sm:px-6 flex-shrink-0 pt-6 pb-8"
      >
        <div className="w-full max-w-5xl flex justify-center">
          {/* Bottom Bar Component - Rectangular with rounded corners */}
          <div
            data-controls-bar
            className="w-full flex items-center bg-[#F0F0F0] rounded-lg"
            style={{ height: "64px", padding: "8px 12px" }}
          >
            {/* Left Group: Undo/Redo - flex-1 so left/right balance and center stays fixed */}
            <div className="flex items-center gap-0.5 flex-1 justify-start min-w-0">
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

            {/* Center Group: Main Tools - no flex grow/shrink so it keeps fixed width; left/right flex-1 keeps it centered */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Crop Button - no tooltip when crop or AI edit panel is open */}
              {showMainTooltips ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onModeChange(isCropMode ? "view" : "crop")}
                      className={`h-9 w-9 p-0 rounded-md transition-colors ${
                        isCropMode
                          ? "bg-[#6764F6] hover:bg-[#6764F6] active:bg-[#6764F6] text-white [&_svg]:text-white"
                          : "text-[#000000] hover:bg-[#FFF] active:bg-gray-200 [&_svg]:text-[#000000]"
                      }`}
                    >
                      <CropIcon className="w-[18px] h-[18px]" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Crop</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onModeChange(isCropMode ? "view" : "crop")}
                  className={`h-9 w-9 p-0 rounded-md transition-colors ${
                    isCropMode
                      ? "bg-[#6764F6] hover:bg-[#6764F6] active:bg-[#6764F6] text-white [&_svg]:text-white"
                      : "text-[#000000] hover:bg-[#FFF] active:bg-gray-200 [&_svg]:text-[#000000]"
                  }`}
                >
                  <CropIcon className="w-[18px] h-[18px]" />
                </Button>
              )}

              {/* AI Edit Button - no tooltip when crop or AI edit panel is open */}
              {showMainTooltips ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onModeChange(isAIEditMode ? "view" : "ai-edit")}
                      className={`h-9 w-9 p-0 rounded-md transition-colors ${
                        isAIEditMode
                          ? "bg-[#6764F6] hover:bg-[#6764F6] active:bg-[#6764F6] text-white [&_svg]:text-white"
                          : "text-[#000000] hover:bg-[#FFF] active:bg-gray-200 [&_svg]:text-[#000000]"
                      }`}
                    >
                      <AIIcon className="w-[18px] h-[18px]" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Change scene</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onModeChange(isAIEditMode ? "view" : "ai-edit")}
                  className={`h-9 w-9 p-0 rounded-md transition-colors ${
                    isAIEditMode
                      ? "bg-[#6764F6] hover:bg-[#6764F6] active:bg-[#6764F6] text-white [&_svg]:text-white"
                      : "text-[#000000] hover:bg-[#FFF] active:bg-gray-200 [&_svg]:text-[#000000]"
                  }`}
                >
                  <AIIcon className="w-[18px] h-[18px]" />
                </Button>
              )}

              {/* Blur/Droplet Button - no tooltip when crop or AI edit panel is open */}
              {showMainTooltips ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onBlur}
                      className={`h-9 w-9 p-0 rounded-md transition-colors ${
                        isBlurred
                          ? "bg-[#6764F6] hover:bg-[#6764F6] active:bg-[#6764F6] text-white [&_svg]:text-white"
                          : "text-[#000000] hover:bg-[#FFF] active:bg-gray-200 [&_svg]:text-[#000000]"
                      }`}
                    >
                      <BlurIcon className="w-[18px] h-[18px]" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Blur</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBlur}
                  className={`h-9 w-9 p-0 rounded-md transition-colors ${
                    isBlurred
                      ? "bg-[#6764F6] hover:bg-[#6764F6] active:bg-[#6764F6] text-white [&_svg]:text-white"
                      : "text-[#000000] hover:bg-[#FFF] active:bg-gray-200 [&_svg]:text-[#000000]"
                  }`}
                >
                  <BlurIcon className="w-[18px] h-[18px]" />
                </Button>
              )}
            </div>

            {/* Right Group: Export Options or Apply Crop - flex-1 + justify-end so right side balances left */}
            <div className="flex items-center flex-1 justify-end min-w-0">
              {showApplyCrop ? (
                <Button
                  onClick={() => {
                    const event = new CustomEvent("applyCrop")
                    window.dispatchEvent(event)
                  }}
                  className="abb-red-button-gradient-hover bg-[#E30613] text-white rounded-full px-4 sm:px-5 h-12 text-sm font-semibold"
                >
                  Apply Crop
                </Button>
              ) : (
                <button
                  onClick={handleDownloadClick}
                  className="abb-gradient-hover-pill export-options-pill flex items-center gap-2"
                  style={{
                    height: '48px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    fontSize: '16px',
                    fontWeight: 500,
                  }}
                >
                  <span className="text-[#000000]">Export options</span>
                  <Image
                    src="/export options.svg"
                    alt="Export options"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                </button>
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
