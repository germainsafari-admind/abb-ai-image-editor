"use client"

import { useState, useCallback, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Header from "@/components/header"
import EditorCanvas from "@/components/editor/editor-canvas"
import ControlsRow from "@/components/editor/controls-row"
import type { ImageState, EditHistoryItem, EditorMode } from "@/types/editor"

export default function EditorPage() {
  const searchParams = useSearchParams()
  const imageParam = searchParams.get("image")
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(null)

  const [imageState, setImageState] = useState<ImageState | null>(null)
  const [editHistory, setEditHistory] = useState<EditHistoryItem[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showBlurNotification, setShowBlurNotification] = useState(false)

  const [editorMode, setEditorMode] = useState<EditorMode>("view")
  const [aiEditResult, setAiEditResult] = useState<{ beforeUrl: string; afterUrl: string } | null>(null)
  const [hasCropPresetSelected, setHasCropPresetSelected] = useState(false)

  // Resolve image URL either from query param or from localStorage (used by the upload flow)
  useEffect(() => {
    const fromParam = imageParam
    if (fromParam) {
      setResolvedImageUrl(fromParam)
      return
    }

    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("lastUploadedImage")
      if (stored) {
        setResolvedImageUrl(stored)
      }
    }
  }, [imageParam])

  // Load image once we have a resolved URL
  useEffect(() => {
    if (!resolvedImageUrl) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      // Get original filename from localStorage if available
      const originalFileName =
        typeof window !== "undefined" ? window.localStorage.getItem("lastUploadedFileName") || undefined : undefined

      const newState: ImageState = {
        originalUrl: resolvedImageUrl,
        currentUrl: resolvedImageUrl,
        width: img.width,
        height: img.height,
        isBlurred: false,
        isAIGenerated: false,
        originalFileName,
      }
      setImageState(newState)
      setEditHistory([{ ...newState, timestamp: Date.now() }])
      setHistoryIndex(0)
    }
    img.onerror = () => {
      console.error("Failed to load image")
    }
    img.src = resolvedImageUrl
  }, [resolvedImageUrl])

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setImageState(editHistory[newIndex])
    }
  }, [historyIndex, editHistory])

  const handleRedo = useCallback(() => {
    if (historyIndex < editHistory.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setImageState(editHistory[newIndex])
    }
  }, [historyIndex, editHistory])

  const addToHistory = useCallback(
    (newState: ImageState) => {
      const newHistory = editHistory.slice(0, historyIndex + 1)
      newHistory.push({ ...newState, timestamp: Date.now() })
      setEditHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
      setImageState(newState)
    },
    [editHistory, historyIndex],
  )

  const handleBlur = useCallback(() => {
    if (!imageState) return
    const newState = { ...imageState, isBlurred: !imageState.isBlurred }
    addToHistory(newState)
    if (!imageState.isBlurred) {
      setShowBlurNotification(true)
      setTimeout(() => setShowBlurNotification(false), 4000)
    }
  }, [imageState, addToHistory])

  const handleCropApply = useCallback(
    (croppedImageUrl: string, newWidth: number, newHeight: number) => {
      if (!imageState) return

      const newState: ImageState = {
        ...imageState,
        currentUrl: croppedImageUrl,
        width: newWidth,
        height: newHeight,
      }
      addToHistory(newState)
      setEditorMode("view")
    },
    [imageState, addToHistory],
  )

  const handleAIEditApply = useCallback(
    (editedImageUrl: string) => {
      if (!imageState) return

      const newState: ImageState = {
        ...imageState,
        currentUrl: editedImageUrl,
        isAIGenerated: true,
      }
      addToHistory(newState)
      setEditorMode("view")
      setAiEditResult(null)
    },
    [imageState, addToHistory],
  )

  const handleModeChange = useCallback((mode: EditorMode) => {
    setEditorMode(mode)
    if (mode !== "ai-result") {
      setAiEditResult(null)
    }
  }, [])

  if (!imageState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading image...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {showBlurNotification && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="max-w-5xl mx-auto flex items-center gap-2 text-sm text-blue-800">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Note: Your image has been automatically blurred.
            <button
              onClick={() => setShowBlurNotification(false)}
              className="ml-auto text-blue-600 hover:text-blue-800"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col overflow-hidden">
        <EditorCanvas
          imageState={imageState}
          editorMode={editorMode}
          aiEditResult={aiEditResult}
          onCropApply={handleCropApply}
          onAIEditApply={handleAIEditApply}
          onAIEditResult={setAiEditResult}
          onModeChange={handleModeChange}
          onCropPresetChange={setHasCropPresetSelected}
        />

        {/* Controls Row */}
        <ControlsRow
          canUndo={historyIndex > 0}
          canRedo={historyIndex < editHistory.length - 1}
          isBlurred={imageState.isBlurred}
          editorMode={editorMode}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onBlur={handleBlur}
          onModeChange={handleModeChange}
          onCropApply={handleCropApply}
          onAIEditApply={handleAIEditApply}
          imageState={imageState}
          hasCropPresetSelected={hasCropPresetSelected}
        />
      </main>
    </div>
  )
}
