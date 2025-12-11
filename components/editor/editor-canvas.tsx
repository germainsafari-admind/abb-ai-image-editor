"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { ChevronLeft, Check, RotateCcw } from "lucide-react"
import type { ImageState, EditorMode, AspectRatioPreset, CropDimensions } from "@/types/editor"

const ASPECT_RATIOS: AspectRatioPreset[] = [
  { name: "9:16", label: "Media Bank", ratio: 9 / 16, displayRatio: "9:16", platform: "Media Bank", boxHeight: 72 },
  { name: "2:3", label: "Instagram", ratio: 2 / 3, displayRatio: "2:3", platform: "Instagram", boxHeight: 66 },
  {
    name: "4:5",
    label: "Facebook",
    ratio: 4 / 5,
    displayRatio: "4:5",
    platform: "Facebook",
    description: "Vertical news feed",
    boxHeight: 56,
  },
  { name: "1:1", label: "LinkedIn", ratio: 1, displayRatio: "1:1", platform: "LinkedIn", boxHeight: 48 },
  { name: "4:3", label: "Twitter", ratio: 4 / 3, displayRatio: "4:3", platform: "Twitter", boxHeight: 42 },
  { name: "3:2", label: "Viva Engage", ratio: 3 / 2, displayRatio: "3:2", platform: "Viva Engage", boxHeight: 38 },
  { name: "16:9", label: "Landscape", ratio: 16 / 9, displayRatio: "16:9", platform: "Landscape", boxHeight: 34 },
  { name: "2.35:1", label: "Cinema", ratio: 2.35, displayRatio: "2.35:1", platform: "Cinema", boxHeight: 30 },
]

const PLATFORM_LABELS = ["Media Bank", "Instagram", "Facebook", "LinkedIn", "Twitter", "Viva Engage", "Custom"]

interface EditorCanvasProps {
  imageState: ImageState
  editorMode: EditorMode
  aiEditResult: { beforeUrl: string; afterUrl: string } | null
  onCropApply: (croppedImageUrl: string, newWidth: number, newHeight: number) => void
  onAIEditApply: (editedImageUrl: string) => void
  onAIEditResult: (result: { beforeUrl: string; afterUrl: string } | null) => void
  onModeChange: (mode: EditorMode) => void
}

export default function EditorCanvas({
  imageState,
  editorMode,
  aiEditResult,
  onCropApply,
  onAIEditApply,
  onAIEditResult,
  onModeChange,
}: EditorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Crop state
  const [selectedRatio, setSelectedRatio] = useState<AspectRatioPreset>(ASPECT_RATIOS[2])
  const [selectedPlatform, setSelectedPlatform] = useState("Facebook")
  const [isCustom, setIsCustom] = useState(false)
  const [cropDims, setCropDims] = useState<CropDimensions>({ x: 0, y: 0, width: 100, height: 100 })
  const [isDragging, setIsDragging] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0 })
  const [displayedDims, setDisplayedDims] = useState({ width: 0, height: 0 })

  // AI Edit state
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  // Initialize crop dimensions when entering crop mode
  useEffect(() => {
    if (editorMode === "crop" && imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect()
      const ratio = isCustom ? imageState.width / imageState.height : selectedRatio.ratio

      let cropW = rect.width * 0.6
      let cropH = cropW / ratio

      if (cropH > rect.height * 0.8) {
        cropH = rect.height * 0.8
        cropW = cropH * ratio
      }

      setCropDims({
        x: (rect.width - cropW) / 2,
        y: (rect.height - cropH) / 2,
        width: cropW,
        height: cropH,
      })
    }
  }, [editorMode, selectedRatio, imageState, isCustom])

  // Calculate displayed dimensions
  useEffect(() => {
    if (editorMode === "crop" && imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect()
      const scaleX = imageState.width / rect.width
      const scaleY = imageState.height / rect.height

      setDisplayedDims({
        width: Math.round(cropDims.width * scaleX),
        height: Math.round(cropDims.height * scaleY),
      })
    }
  }, [cropDims, editorMode, imageState])

  // Listen for apply crop event from controls row
  useEffect(() => {
    const handleApplyCrop = () => {
      if (editorMode === "crop") {
        handleApplyCropInternal()
      }
    }
    window.addEventListener("applyCrop", handleApplyCrop)
    return () => window.removeEventListener("applyCrop", handleApplyCrop)
  }, [editorMode, cropDims, imageState])

  const handleRatioSelect = (ratio: AspectRatioPreset) => {
    setSelectedRatio(ratio)
    setSelectedPlatform(ratio.platform)
    setIsCustom(false)

    if (!imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()

    let cropW = rect.width * 0.6
    let cropH = cropW / ratio.ratio

    if (cropH > rect.height * 0.8) {
      cropH = rect.height * 0.8
      cropW = cropH * ratio.ratio
    }

    setCropDims({
      x: (rect.width - cropW) / 2,
      y: (rect.height - cropH) / 2,
      width: cropW,
      height: cropH,
    })
  }

  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(platform)
    if (platform === "Custom") {
      setIsCustom(true)
    } else {
      setIsCustom(false)
      const ratio = ASPECT_RATIOS.find((r) => r.platform === platform) || ASPECT_RATIOS[0]
      handleRatioSelect(ratio)
    }
  }

  // Drag handlers for crop
  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(handle)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      cropX: cropDims.x,
      cropY: cropDims.y,
      cropW: cropDims.width,
      cropH: cropDims.height,
    })
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !imageRef.current) return

      const rect = imageRef.current.getBoundingClientRect()
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      const minSize = 50

      const newDims = { ...cropDims }

      if (isDragging === "move") {
        newDims.x = Math.max(0, Math.min(rect.width - dragStart.cropW, dragStart.cropX + deltaX))
        newDims.y = Math.max(0, Math.min(rect.height - dragStart.cropH, dragStart.cropY + deltaY))
      } else if (isDragging === "nw") {
        const newW = Math.max(minSize, dragStart.cropW - deltaX)
        const newH = Math.max(minSize, dragStart.cropH - deltaY)
        newDims.x = dragStart.cropX + (dragStart.cropW - newW)
        newDims.y = dragStart.cropY + (dragStart.cropH - newH)
        newDims.width = newW
        newDims.height = newH
      } else if (isDragging === "ne") {
        newDims.width = Math.max(minSize, dragStart.cropW + deltaX)
        const newH = Math.max(minSize, dragStart.cropH - deltaY)
        newDims.y = dragStart.cropY + (dragStart.cropH - newH)
        newDims.height = newH
      } else if (isDragging === "sw") {
        const newW = Math.max(minSize, dragStart.cropW - deltaX)
        newDims.x = dragStart.cropX + (dragStart.cropW - newW)
        newDims.width = newW
        newDims.height = Math.max(minSize, dragStart.cropH + deltaY)
      } else if (isDragging === "se") {
        newDims.width = Math.max(minSize, dragStart.cropW + deltaX)
        newDims.height = Math.max(minSize, dragStart.cropH + deltaY)
      } else if (isDragging === "n") {
        const newH = Math.max(minSize, dragStart.cropH - deltaY)
        newDims.y = dragStart.cropY + (dragStart.cropH - newH)
        newDims.height = newH
      } else if (isDragging === "s") {
        newDims.height = Math.max(minSize, dragStart.cropH + deltaY)
      } else if (isDragging === "e") {
        newDims.width = Math.max(minSize, dragStart.cropW + deltaX)
      } else if (isDragging === "w") {
        const newW = Math.max(minSize, dragStart.cropW - deltaX)
        newDims.x = dragStart.cropX + (dragStart.cropW - newW)
        newDims.width = newW
      }

      // Constrain to image bounds
      newDims.x = Math.max(0, newDims.x)
      newDims.y = Math.max(0, newDims.y)
      newDims.width = Math.min(newDims.width, rect.width - newDims.x)
      newDims.height = Math.min(newDims.height, rect.height - newDims.y)

      setCropDims(newDims)
    },
    [isDragging, dragStart, cropDims],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(null)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Apply crop
  const handleApplyCropInternal = () => {
    if (!imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const scaleX = imageState.width / rect.width
    const scaleY = imageState.height / rect.height

    const actualX = cropDims.x * scaleX
    const actualY = cropDims.y * scaleY
    const actualW = cropDims.width * scaleX
    const actualH = cropDims.height * scaleY

    const canvas = document.createElement("canvas")
    canvas.width = actualW
    canvas.height = actualH
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      ctx.drawImage(img, actualX, actualY, actualW, actualH, 0, 0, actualW, actualH)
      const croppedUrl = canvas.toDataURL("image/jpeg", 0.95)
      onCropApply(croppedUrl, Math.round(actualW), Math.round(actualH))
    }
    img.src = imageState.currentUrl
  }

  // AI Edit handlers
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return

    setIsGenerating(true)
    setAiError(null)

    try {
      const response = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: imageState.currentUrl,
          prompt: aiPrompt,
          presets: [],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error cases
        if (data.error?.includes("credits") || data.error?.includes("quota")) {
          throw new Error("Insufficient credits. Please upgrade your plan or try again later.")
        }
        throw new Error(data.error || "Generation failed")
      }

      onAIEditResult({
        beforeUrl: imageState.currentUrl,
        afterUrl: data.editedImageUrl,
      })
      onModeChange("ai-result")
    } catch (error: any) {
      setAiError(error.message || "Failed to generate. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePresetClick = (preset: string) => {
    setAiPrompt(preset)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {editorMode === "crop" && (
        <div className="bg-background border-b border-border px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-0 sm:px-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onModeChange("view")}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-medium">{selectedPlatform} format:</span>
              <span className="text-[#7C3AED] font-medium">
                {selectedRatio.description || selectedRatio.platform} ({selectedRatio.displayRatio})
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {displayedDims.width} x {displayedDims.height} px
            </div>
          </div>
        </div>
      )}

      {/* View mode dimensions */}
      {editorMode === "view" && (
        <div className="flex justify-end px-4 sm:px-6 pt-4">
          <div className="text-xs sm:text-sm text-muted-foreground">
            {imageState.width} x {imageState.height} px
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 overflow-auto"
      >
        {/* AI Result Split View */}
        {editorMode === "ai-result" && aiEditResult && (
          <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              <div className="flex flex-col items-center">
                <span className="text-sm text-[#7C3AED] font-medium mb-2">Before</span>
                <div className="rounded-lg overflow-hidden border border-border shadow-md">
                  <img
                    src={aiEditResult.beforeUrl || "/placeholder.svg"}
                    alt="Before"
                    className="w-full h-auto max-h-[35vh] sm:max-h-[40vh] md:max-h-[45vh] object-contain"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm text-[#7C3AED] font-medium mb-2">After</span>
                <div className="rounded-lg overflow-hidden border-2 border-[#7C3AED] shadow-md bg-[repeating-conic-gradient(#e5e5e5_0%_25%,#ffffff_0%_50%)] bg-[length:16px_16px]">
                  <img
                    src={aiEditResult.afterUrl || "/placeholder.svg"}
                    alt="After"
                    className="w-full h-auto max-h-[35vh] sm:max-h-[40vh] md:max-h-[45vh] object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Done message with Retry/Apply */}
            <div className="mt-6 bg-white rounded-full shadow-lg px-6 py-3 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Done! How do you like it?</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onAIEditResult(null)
                    onModeChange("ai-edit")
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-full text-sm font-medium hover:bg-muted transition-colors"
                >
                  Retry <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onAIEditApply(aiEditResult.afterUrl)}
                  className="px-6 py-2 bg-[#E30613] hover:bg-[#c70510] text-white rounded-full text-sm font-medium transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Normal view or crop mode */}
        {(editorMode === "view" || editorMode === "crop" || editorMode === "ai-edit") && (
          <div className="relative w-full max-w-6xl flex flex-col items-center">
            {/* Size label – always aligned to the right like the reference */}
            <div className="w-full flex justify-end mb-3 text-xs text-muted-foreground">
              {editorMode === "crop"
                ? `${displayedDims.width} x ${displayedDims.height} px`
                : `${imageState.width} x ${imageState.height} px`}
            </div>

            {/* Image card */}
            <div className="relative w-full max-w-5xl mx-auto rounded-lg overflow-hidden shadow-lg bg-muted/40">
              <img
                ref={imageRef}
                src={imageState.currentUrl || "/placeholder.svg"}
                alt="Editor canvas"
                className={`w-full h-auto max-h-[50vh] sm:max-h-[55vh] md:max-h-[60vh] lg:max-h-[65vh] object-contain mx-auto ${
                  imageState.isBlurred ? "blur-md" : ""
                }`}
                crossOrigin="anonymous"
              />

              {/* Crop overlay */}
              {editorMode === "crop" && imageRef.current && (
                <>
                  {/* Dimmed area outside crop – bevel-style overlay like the reference */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-black/40" />
                    <div
                      className="absolute bg-transparent"
                      style={{
                        left: cropDims.x,
                        top: cropDims.y,
                        width: cropDims.width,
                        height: cropDims.height,
                        boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
                        borderRadius: "0.75rem",
                      }}
                    />
                  </div>

                  {/* Crop rectangle with rounded corners & subtle handles */}
                  <div
                    className="absolute border border-white/90 rounded-xl cursor-move"
                    style={{
                      left: cropDims.x,
                      top: cropDims.y,
                      width: cropDims.width,
                      height: cropDims.height,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, "move")}
                  >
                    {/* Corner handles */}
                    <div
                      className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white rounded-sm shadow cursor-nwse-resize"
                      onMouseDown={(e) => handleMouseDown(e, "nw")}
                    />
                    <div
                      className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white rounded-sm shadow cursor-nesw-resize"
                      onMouseDown={(e) => handleMouseDown(e, "ne")}
                    />
                    <div
                      className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white rounded-sm shadow cursor-nesw-resize"
                      onMouseDown={(e) => handleMouseDown(e, "sw")}
                    />
                    <div
                      className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white rounded-sm shadow cursor-nwse-resize"
                      onMouseDown={(e) => handleMouseDown(e, "se")}
                    />
                    {/* Edge handles */}
                    <div
                      className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-white rounded-full shadow cursor-ns-resize"
                      onMouseDown={(e) => handleMouseDown(e, "n")}
                    />
                    <div
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-white rounded-full shadow cursor-ns-resize"
                      onMouseDown={(e) => handleMouseDown(e, "s")}
                    />
                    <div
                      className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-1.5 h-8 bg-white rounded-full shadow cursor-ew-resize"
                      onMouseDown={(e) => handleMouseDown(e, "w")}
                    />
                    <div
                      className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-1.5 h-8 bg-white rounded-full shadow cursor-ew-resize"
                      onMouseDown={(e) => handleMouseDown(e, "e")}
                    />
                  </div>
                </>
              )}
            </div>

            {/* AI Edit input panel - positioned at bottom of image */}
            {editorMode === "ai-edit" && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white rounded-xl shadow-2xl p-4 max-w-xl mx-auto">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Describe what you would like to change..."
                    className="w-full p-3 border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleAIGenerate()}
                    disabled={isGenerating}
                  />

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="flex flex-wrap gap-2">
                      {["Remove background", "Add object", "Change background"].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => handlePresetClick(preset)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                            aiPrompt === preset
                              ? "bg-foreground text-background border-foreground"
                              : "border-border hover:border-foreground"
                          }`}
                          disabled={isGenerating}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleAIGenerate}
                      disabled={!aiPrompt.trim() || isGenerating}
                      className="px-6 py-2 bg-[#E30613] hover:bg-[#c70510] text-white rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isGenerating ? "Generating..." : "Generate"}
                    </button>
                  </div>

                  {aiError && <div className="mt-3 p-2 bg-red-50 text-red-600 text-sm rounded-lg">{aiError}</div>}
                </div>
              </div>
            )}

            {/* Crop format tray – floating card anchored to image like the reference design */}
            {editorMode === "crop" && (
              <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-full max-w-3xl px-2">
                <div className="mx-auto rounded-2xl border border-border bg-background shadow-xl px-4 py-4 sm:px-6">
                  {/* Format title */}
                  <div className="text-xs sm:text-sm font-medium mb-3">
                    {selectedPlatform} format:{" "}
                    <span className="text-[#7C3AED]">
                      {selectedRatio.description || selectedRatio.platform} ({selectedRatio.displayRatio})
                    </span>
                  </div>

                  {/* Ratio boxes – horizontally scrollable, fluid sizing */}
                  <div className="flex items-end gap-2 mb-4 overflow-x-auto pb-2">
                    {ASPECT_RATIOS.map((ratio) => {
                      const isSelected = selectedRatio.name === ratio.name && !isCustom
                      const boxWidth = Math.round((ratio.boxHeight || 48) * ratio.ratio)

                      return (
                        <button
                          key={ratio.name}
                          onClick={() => handleRatioSelect(ratio)}
                          className={`flex-shrink-0 flex items-center justify-center border-2 rounded-lg transition-all ${
                            isSelected
                              ? "border-[#7C3AED] text-[#7C3AED] bg-[#F3E8FF]"
                              : "border-gray-300 text-gray-500 hover:border-gray-400 bg-white"
                          }`}
                          style={{
                            width: `${Math.max(36, boxWidth)}px`,
                            height: `${ratio.boxHeight || 48}px`,
                            minWidth: "36px",
                          }}
                        >
                          <span className="text-xs font-medium">{ratio.displayRatio}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Platform labels */}
                  <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                    {PLATFORM_LABELS.map((platform) => {
                      const isSelected = selectedPlatform === platform
                      return (
                        <button
                          key={platform}
                          onClick={() => handlePlatformSelect(platform)}
                          className={`px-3 py-1.5 rounded-full font-medium transition-all ${
                            isSelected
                              ? "bg-gray-900 text-white shadow-sm"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {platform}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
