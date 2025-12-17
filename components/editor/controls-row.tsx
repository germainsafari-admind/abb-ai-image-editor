"use client"

import { useState } from "react"
import { Undo2, Redo2, ExternalLink } from "lucide-react"
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
    setShowMetadataPrompt(true)
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
      {/* Controls container - matches image container width */}
      <div className="flex justify-center px-4 sm:px-6" style={{ marginTop: "1px", marginBottom: "24px" }}>
        <div
          className="w-full max-w-5xl flex justify-center"
        >
          <div
            className="w-full flex items-center justify-between gap-2 sm:gap-3 bg-[#EFF1F5] rounded-full px-4 sm:px-5 py-2.5"
            style={{
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)',
            }}
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
                    className="h-9 w-9 p-0 rounded-full text-gray-800 hover:text-gray-950 hover:bg-gray-200"
                  >
                    <Undo2 className="w-[18px] h-[18px]" />
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
                    className="h-9 w-9 p-0 rounded-full text-gray-800 hover:text-gray-950 hover:bg-gray-200"
                  >
                    <Redo2 className="w-[18px] h-[18px]" />
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
                    className={`h-9 w-9 p-0 rounded-full ${
                      isCropMode
                        ? "bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                        : "text-gray-800 hover:text-gray-950 hover:bg-gray-200"
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
                    className={`h-9 w-9 p-0 rounded-full ${
                      isAIEditMode
                        ? "bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                        : "text-gray-800 hover:text-gray-950 hover:bg-gray-200"
                    }`}
                  >
                    <AIIcon className="w-[18px] h-[18px]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Change scene</p>
                </TooltipContent>
              </Tooltip>

              {/* Blur Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBlur}
                    className={`h-9 w-9 p-0 rounded-full ${
                      isBlurred
                        ? "bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                        : "text-gray-800 hover:text-gray-950 hover:bg-gray-200"
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
                  className="bg-[#E30613] hover:bg-[#c70510] text-white rounded-full px-4 sm:px-5 h-9 text-sm font-semibold"
                >
                  Apply Crop
                </Button>
              ) : (
                <Button
                  onClick={handleDownloadClick}
                  variant="outline"
                  className="rounded-full px-4 sm:px-5 h-9 text-sm font-semibold bg-white border border-gray-300 text-gray-800 hover:text-gray-950 hover:bg-gray-100 hover:border-gray-400"
                >
                  <span>Export options</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-2" />
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
