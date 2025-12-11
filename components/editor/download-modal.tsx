"use client"

import { useState, useEffect } from "react"
import { X, DownloadIcon, ChevronRight, ChevronLeft, Info, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ImageState } from "@/types/editor"

interface DownloadModalProps {
  isOpen: boolean
  imageState: ImageState
  onClose: () => void
  skipToDownload?: boolean
}

interface SourceInfo {
  business: string
  productCampaign: string
  assetType: string
}

interface MetadataResult {
  title: string
  description: string
  tags: string[]
}

type ModalStep = "download" | "metadata-step1" | "metadata-step2"

const BUSINESS_OPTIONS = [
  "Corporate",
  "Electrification",
  "Process Automation",
  "Motion",
  "Robotics & Discrete Automation",
  "Global",
]
const ASSET_TYPE_OPTIONS = ["Photos", "Illustrations", "Marketing & Promotion Material"]

export default function DownloadModal({ isOpen, imageState, onClose, skipToDownload = false }: DownloadModalProps) {
  const [step, setStep] = useState<ModalStep>("download")
  const [format, setFormat] = useState<"PNG" | "JPG">("JPG")
  const [transparentBg, setTransparentBg] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Metadata state
  const [sourceInfo, setSourceInfo] = useState<SourceInfo>({
    business: "",
    productCampaign: "",
    assetType: "",
  })
  const [metadata, setMetadata] = useState<MetadataResult>({
    title: "",
    description: "",
    tags: [],
  })
  const [newTag, setNewTag] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [metadataApplied, setMetadataApplied] = useState(false)

  // Reset state when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setStep("download")
      setMetadataApplied(false)
    } else if (!skipToDownload) {
      // If not skipping, start at metadata step 1
      setStep("metadata-step1")
    }
  }, [isOpen, skipToDownload])

  if (!isOpen) return null

  const imageSize = `${imageState.width} x ${imageState.height} px`
  const canGenerateMetadata = sourceInfo.business && sourceInfo.productCampaign && sourceInfo.assetType

  // Generate metadata with OpenAI
  const generateMetadata = async () => {
    if (!canGenerateMetadata) return

    setIsGenerating(true)
    try {
      const response = await fetch("/api/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: imageState.currentUrl,
          sourceInformation: sourceInfo,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate metadata")

      const result = await response.json()

      // Generate structured title
      const structuredTitle = `${sourceInfo.business.toLowerCase()}_${sourceInfo.assetType.toLowerCase()}_${sourceInfo.productCampaign.toLowerCase().replace(/\s+/g, "-")}`

      setMetadata({
        title: structuredTitle,
        description: result.description || "",
        tags: result.tags || [],
      })

      setStep("metadata-step2")
    } catch (error) {
      console.error("Metadata generation error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !metadata.tags.includes(newTag.trim())) {
      setMetadata((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setMetadata((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const applyMetadata = () => {
    setMetadataApplied(true)
    setStep("download")
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Canvas not supported")

      const img = new Image()
      img.crossOrigin = "anonymous"

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = imageState.currentUrl
      })

      canvas.width = img.width
      canvas.height = img.height

      if (transparentBg && format === "PNG") {
        ctx.drawImage(img, 0, 0)
      } else {
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
      }

      // Get base64 data
      const mimeType = format === "PNG" ? "image/png" : "image/jpeg"
      let dataUrl = canvas.toDataURL(mimeType, 0.95)

      // If metadata is applied, we need to embed it
      // For JPEG, we can add EXIF data; for PNG, we add tEXt chunks
      if (metadataApplied && metadata.title) {
        // Convert to blob and add metadata via server
        const blob = await (await fetch(dataUrl)).blob()
        const formData = new FormData()
        formData.append("image", blob, `image.${format.toLowerCase()}`)
        formData.append("title", metadata.title)
        formData.append("description", metadata.description)
        formData.append("tags", metadata.tags.join(", "))
        formData.append("format", format)

        try {
          const response = await fetch("/api/embed-metadata", {
            method: "POST",
            body: formData,
          })

          if (response.ok) {
            const resultBlob = await response.blob()
            dataUrl = URL.createObjectURL(resultBlob)
          }
        } catch (err) {
          console.warn("Could not embed metadata, downloading without it")
        }
      }

      const filename =
        metadataApplied && metadata.title
          ? `${metadata.title}.${format.toLowerCase()}`
          : `image.${format.toLowerCase()}`

      const a = document.createElement("a")
      a.href = dataUrl
      a.download = filename
      a.click()

      // Clean up object URL if we created one
      if (dataUrl.startsWith("blob:")) {
        URL.revokeObjectURL(dataUrl)
      }

      onClose()
    } catch (error) {
      console.error("Download error:", error)
      alert("Download failed. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-2xl w-full max-w-xl max-h-[90vh] overflow-auto flex flex-col">
        {step === "download" && (
          <>
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-2xl font-bold">DOWNLOAD</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Format selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Choose file type</label>
                <div className="flex gap-3">
                  {(["PNG", "JPG"] as const).map((fmt) => (
                    <label key={fmt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="format"
                        checked={format === fmt}
                        onChange={() => setFormat(fmt)}
                        className="w-4 h-4 accent-[#E30613]"
                      />
                      <span className="text-sm font-medium">{fmt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Transparent background */}
              {format === "PNG" && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={transparentBg}
                    onChange={(e) => setTransparentBg(e.target.checked)}
                    className="w-4 h-4 rounded border-border accent-[#E30613]"
                  />
                  <span className="text-sm">Transparent background</span>
                </label>
              )}

              {/* Info row */}
              <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-border">
                <div>
                  <div className="text-xs text-muted-foreground">Image size</div>
                  <div className="text-sm font-medium">{imageSize}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Metadata</div>
                  <div className="text-sm font-medium">{metadataApplied ? "Added" : "Not added"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">File name preview</div>
                  <div className="text-sm font-medium truncate">
                    {metadataApplied && metadata.title
                      ? `${metadata.title}.${format.toLowerCase()}`
                      : `image.${format.toLowerCase()}`}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <div className="flex gap-3">
                  {!metadataApplied && (
                    <Button variant="outline" onClick={() => setStep("metadata-step1")}>
                      Add Metadata
                    </Button>
                  )}
                  <Button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="bg-[#E30613] hover:bg-[#c70510] text-white"
                  >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    {isDownloading ? "Downloading..." : "Download"}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {step === "metadata-step1" && (
          <>
            <div className="p-6 border-b border-border">
              <div className="text-xs text-muted-foreground mb-1">STEP 1/2</div>
              <h2 className="text-xl font-bold">Metadata suggestions</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Start by selecting the source information. The metadata will be generated automatically based on your
                input.
              </p>
            </div>

            <div className="p-6 flex flex-col sm:flex-row gap-6">
              {/* Image preview */}
              <div className="w-full sm:w-40 flex-shrink-0">
                <img
                  src={imageState.currentUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-auto rounded-lg border border-border"
                />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {imageState.isAIGenerated ? "Likely" : "Not likely"} to be AI-generated
                  </span>
                  <span className="px-2 py-0.5 bg-muted rounded text-muted-foreground">
                    {imageState.isAIGenerated ? "75%" : "3%"}
                  </span>
                </div>
              </div>

              {/* Form fields */}
              <div className="flex-1 space-y-4">
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium mb-2">
                    Business*
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </label>
                  <select
                    value={sourceInfo.business}
                    onChange={(e) => setSourceInfo((prev) => ({ ...prev, business: e.target.value }))}
                    className="w-full p-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#E30613]"
                  >
                    <option value="">Select</option>
                    {BUSINESS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-1 text-sm font-medium mb-2">
                    Product /Campaign name*
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </label>
                  <input
                    type="text"
                    value={sourceInfo.productCampaign}
                    onChange={(e) => setSourceInfo((prev) => ({ ...prev, productCampaign: e.target.value }))}
                    placeholder="Type here..."
                    className="w-full p-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#E30613]"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1 text-sm font-medium mb-2">
                    Asset type*
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </label>
                  <select
                    value={sourceInfo.assetType}
                    onChange={(e) => setSourceInfo((prev) => ({ ...prev, assetType: e.target.value }))}
                    className="w-full p-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#E30613]"
                  >
                    <option value="">Select</option>
                    {ASSET_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-between">
              <Button variant="outline" onClick={() => setStep("download")}>
                Cancel
              </Button>
              <Button
                onClick={generateMetadata}
                disabled={!canGenerateMetadata || isGenerating}
                className="bg-[#E30613] hover:bg-[#c70510] text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {step === "metadata-step2" && (
          <>
            <div className="p-6 border-b border-border">
              <div className="text-xs text-muted-foreground mb-1">STEP 2/2</div>
              <h2 className="text-xl font-bold">Metadata suggestions</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Review and edit the AI-generated metadata before applying.
              </p>
            </div>

            <div className="p-6 flex flex-col sm:flex-row gap-6">
              {/* Image preview */}
              <div className="w-full sm:w-40 flex-shrink-0">
                <img
                  src={imageState.currentUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-auto rounded-lg border border-border"
                />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {imageState.isAIGenerated ? "Likely" : "Not likely"} to be AI-generated
                  </span>
                  <span className="px-2 py-0.5 bg-muted rounded text-muted-foreground">
                    {imageState.isAIGenerated ? "75%" : "3%"}
                  </span>
                </div>
              </div>

              {/* Metadata fields */}
              <div className="flex-1 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <input
                    type="text"
                    value={metadata.title}
                    onChange={(e) => setMetadata((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#E30613]"
                    maxLength={600}
                  />
                  <div className="text-xs text-muted-foreground mt-1 text-right">{metadata.title.length}/600</div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <textarea
                    value={metadata.description}
                    onChange={(e) => setMetadata((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full p-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#E30613] resize-none"
                    maxLength={400}
                  />
                  <div className="text-xs text-muted-foreground mt-1 text-right">{metadata.description.length}/400</div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">AI suggested tags</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {metadata.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Add your tags</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTag()}
                      placeholder="Type here..."
                      className="flex-1 p-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#E30613]"
                    />
                    <Button variant="outline" onClick={addTag}>
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-between">
              <Button variant="ghost" onClick={() => setStep("metadata-step1")} className="flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              <Button onClick={applyMetadata} className="bg-[#E30613] hover:bg-[#c70510] text-white">
                Apply Metadata
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
