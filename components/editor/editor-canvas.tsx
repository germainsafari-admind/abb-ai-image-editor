"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ChevronLeft, Check, RotateCcw } from "lucide-react"
import type { ImageState, EditorMode, CropDimensions } from "@/types/editor"
import CropPresetTray from "@/components/editor/crop-preset-tray"
import { CROP_CATEGORIES, type CategoryPreset } from "@/lib/crop-presets"

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
  const [selectedCategory, setSelectedCategory] = useState<string>("facebook")
  const [selectedPreset, setSelectedPreset] = useState<CategoryPreset | null>(null)
  const [isCustom, setIsCustom] = useState(false)
  const [customRatioWidth, setCustomRatioWidth] = useState<string>("")
  const [customRatioHeight, setCustomRatioHeight] = useState<string>("")
  const [cropDims, setCropDims] = useState<CropDimensions>({ x: 0, y: 0, width: 100, height: 100 })
  const [isDragging, setIsDragging] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0 })
  const [displayedDims, setDisplayedDims] = useState({ width: 0, height: 0 })

  // AI Edit state
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  // Get current category
  const currentCategory = CROP_CATEGORIES.find((cat) => cat.name === selectedCategory) || CROP_CATEGORIES[0]

  const getActiveAspectRatio = () => {
    if (!isCustom && selectedPreset?.ratio) {
      return selectedPreset.ratio
    }

    const w = parseFloat(customRatioWidth)
    const h = parseFloat(customRatioHeight)
    if (isCustom && !Number.isNaN(w) && !Number.isNaN(h) && w > 0 && h > 0) {
      return w / h
    }

    // Fallback to image ratio or sensible default
    if (imageState.width && imageState.height) {
      return imageState.width / imageState.height
    }
    return 16 / 9
  }

  const recenterCropForRatio = (ratio: number) => {
    if (!imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()

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

  // Initialize crop dimensions when entering crop mode
  useEffect(() => {
    if (editorMode === "crop" && imageRef.current) {
      const ratio = getActiveAspectRatio()
      recenterCropForRatio(ratio)

      // Set initial preset if none selected
      if (!selectedPreset && currentCategory.presets.length > 0) {
        setSelectedPreset(currentCategory.presets[0])
      }
    }
  }, [editorMode, selectedPreset, imageState, isCustom, currentCategory, customRatioWidth, customRatioHeight])

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

  const handlePresetSelect = (preset: CategoryPreset) => {
    setSelectedPreset(preset)
    setIsCustom(false)

    recenterCropForRatio(preset.ratio)
  }

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName)
    if (categoryName === "custom") {
      setIsCustom(true)
      setSelectedPreset(null)
      // Keep existing crop freeform until a custom ratio is defined
    } else {
      setIsCustom(false)
      setCustomRatioWidth("")
      setCustomRatioHeight("")
      const category = CROP_CATEGORIES.find((cat) => cat.name === categoryName)
      if (category && category.presets.length > 0) {
        handlePresetSelect(category.presets[0])
      }
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
      const activeRatio = getActiveAspectRatio()
      const currentRatio = !isCustom ? selectedPreset?.ratio : (() => {
        const w = parseFloat(customRatioWidth)
        const h = parseFloat(customRatioHeight)
        if (!Number.isNaN(w) && !Number.isNaN(h) && w > 0 && h > 0) {
          return w / h
        }
        return undefined
      })()

      if (isDragging === "move") {
        newDims.x = Math.max(0, Math.min(rect.width - dragStart.cropW, dragStart.cropX + deltaX))
        newDims.y = Math.max(0, Math.min(rect.height - dragStart.cropH, dragStart.cropY + deltaY))
      } else if (isDragging === "nw") {
        if (currentRatio && (!isCustom || (isCustom && customRatioWidth && customRatioHeight))) {
          const newW = Math.max(minSize, dragStart.cropW - deltaX)
          const newH = newW / currentRatio
          newDims.x = dragStart.cropX + (dragStart.cropW - newW)
          newDims.y = dragStart.cropY + (dragStart.cropH - newH)
          newDims.width = newW
          newDims.height = newH
        } else {
          const newW = Math.max(minSize, dragStart.cropW - deltaX)
          const newH = Math.max(minSize, dragStart.cropH - deltaY)
          newDims.x = dragStart.cropX + (dragStart.cropW - newW)
          newDims.y = dragStart.cropY + (dragStart.cropH - newH)
          newDims.width = newW
          newDims.height = newH
        }
      } else if (isDragging === "ne") {
        if (currentRatio && (!isCustom || (isCustom && customRatioWidth && customRatioHeight))) {
          newDims.width = Math.max(minSize, dragStart.cropW + deltaX)
          const newH = newDims.width / currentRatio
          newDims.y = dragStart.cropY + (dragStart.cropH - newH)
          newDims.height = newH
        } else {
          newDims.width = Math.max(minSize, dragStart.cropW + deltaX)
          const newH = Math.max(minSize, dragStart.cropH - deltaY)
          newDims.y = dragStart.cropY + (dragStart.cropH - newH)
          newDims.height = newH
        }
      } else if (isDragging === "sw") {
        if (currentRatio && (!isCustom || (isCustom && customRatioWidth && customRatioHeight))) {
          const newW = Math.max(minSize, dragStart.cropW - deltaX)
          newDims.x = dragStart.cropX + (dragStart.cropW - newW)
          newDims.height = newW / currentRatio
        } else {
          const newW = Math.max(minSize, dragStart.cropW - deltaX)
          newDims.x = dragStart.cropX + (dragStart.cropW - newW)
          newDims.width = newW
          newDims.height = Math.max(minSize, dragStart.cropH + deltaY)
        }
      } else if (isDragging === "se") {
        if (currentRatio && (!isCustom || (isCustom && customRatioWidth && customRatioHeight))) {
          newDims.width = Math.max(minSize, dragStart.cropW + deltaX)
          newDims.height = newDims.width / currentRatio
        } else {
          newDims.width = Math.max(minSize, dragStart.cropW + deltaX)
          newDims.height = Math.max(minSize, dragStart.cropH + deltaY)
        }
      } else if (isDragging === "n") {
        if (currentRatio && (!isCustom || (isCustom && customRatioWidth && customRatioHeight))) {
          const newH = Math.max(minSize, dragStart.cropH - deltaY)
          const newW = newH * currentRatio
          newDims.x = dragStart.cropX + (dragStart.cropW - newW)
          newDims.y = dragStart.cropY + (dragStart.cropH - newH)
          newDims.width = newW
          newDims.height = newH
        } else {
          const newH = Math.max(minSize, dragStart.cropH - deltaY)
          newDims.y = dragStart.cropY + (dragStart.cropH - newH)
          newDims.height = newH
        }
      } else if (isDragging === "s") {
        if (currentRatio && (!isCustom || (isCustom && customRatioWidth && customRatioHeight))) {
          const newH = Math.max(minSize, dragStart.cropH + deltaY)
          const newW = newH * currentRatio
          newDims.x = dragStart.cropX + (dragStart.cropW - newW)
          newDims.width = newW
          newDims.height = newH
        } else {
          newDims.height = Math.max(minSize, dragStart.cropH + deltaY)
        }
      } else if (isDragging === "e") {
        if (currentRatio && (!isCustom || (isCustom && customRatioWidth && customRatioHeight))) {
          newDims.width = Math.max(minSize, dragStart.cropW + deltaX)
          newDims.height = newDims.width / currentRatio
        } else {
          newDims.width = Math.max(minSize, dragStart.cropW + deltaX)
        }
      } else if (isDragging === "w") {
        if (currentRatio && (!isCustom || (isCustom && customRatioWidth && customRatioHeight))) {
          const newW = Math.max(minSize, dragStart.cropW - deltaX)
          const newH = newW / currentRatio
          newDims.x = dragStart.cropX + (dragStart.cropW - newW)
          newDims.y = dragStart.cropY + (dragStart.cropH - newH)
          newDims.width = newW
          newDims.height = newH
        } else {
          const newW = Math.max(minSize, dragStart.cropW - deltaX)
          newDims.x = dragStart.cropX + (dragStart.cropW - newW)
          newDims.width = newW
        }
      }

      // Constrain to image bounds
      newDims.x = Math.max(0, newDims.x)
      newDims.y = Math.max(0, newDims.y)
      newDims.width = Math.min(newDims.width, rect.width - newDims.x)
      newDims.height = Math.min(newDims.height, rect.height - newDims.y)

      setCropDims(newDims)
    },
    [isDragging, dragStart, cropDims, selectedPreset, isCustom, customRatioWidth, customRatioHeight],
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
              <span className="font-medium">
                {currentCategory.label} format:
                {selectedPreset && (
                  <span className="text-[#7C3AED] font-medium ml-1">
                    {selectedPreset.label} ({selectedPreset.displayRatio})
                  </span>
                )}
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

            {/* Crop format tray – floating card anchored above bottom controls */}
            {editorMode === "crop" && (
              <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-full max-w-3xl px-2 pointer-events-none">
                <CropPresetTray
                  categories={CROP_CATEGORIES}
                  selectedCategory={selectedCategory}
                  selectedPreset={selectedPreset}
                  customRatioWidth={customRatioWidth}
                  customRatioHeight={customRatioHeight}
                  onSelectCategory={handleCategorySelect}
                  onSelectPreset={handlePresetSelect}
                  onChangeCustomWidth={setCustomRatioWidth}
                  onChangeCustomHeight={setCustomRatioHeight}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
