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

  // Show Apply Crop only when in crop mode AND a preset is selected
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
      <div className="border-t border-border bg-muted/30 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Left Group: Undo/Redo */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onUndo}
                  disabled={!canUndo}
                  className="h-10 w-10 p-0"
                >
                  <Undo2 className="w-5 h-5" />
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
                  className="h-10 w-10 p-0"
                >
                  <Redo2 className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Redo</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Center Group: Main Tools */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Crop Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onModeChange(isCropMode ? "view" : "crop")}
                  className={`h-10 w-10 p-0 rounded-lg ${
                    isCropMode ? "bg-[#7C3AED] hover:bg-[#6D28D9] text-white" : "hover:bg-muted"
                  }`}
                >
                  <CropIcon className="w-5 h-5" />
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
                  className={`h-10 w-10 p-0 rounded-lg ${
                    isAIEditMode ? "bg-[#7C3AED] hover:bg-[#6D28D9] text-white" : "hover:bg-muted"
                  }`}
                >
                  <AIIcon className="w-5 h-5" />
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
                  className={`h-10 w-10 p-0 rounded-lg ${
                    isBlurred ? "bg-[#7C3AED] hover:bg-[#6D28D9] text-white" : "hover:bg-muted"
                  }`}
                >
                  <BlurIcon className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Blur</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Right Group: Export Options or Apply Crop */}
          <div className="flex items-center gap-2">
            {showApplyCrop ? (
              <Button
                onClick={() => {
                  const event = new CustomEvent("applyCrop")
                  window.dispatchEvent(event)
                }}
                className="bg-[#E30613] hover:bg-[#c70510] text-white rounded-full px-4 sm:px-6 h-10 text-sm font-medium"
              >
                Apply Crop
              </Button>
            ) : (
              <Button
                onClick={handleDownloadClick}
                variant="outline"
                className="rounded-full px-4 sm:px-6 h-10 text-sm font-medium bg-transparent border-2 border-foreground"
              >
                <span>Export options</span>
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            )}
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
