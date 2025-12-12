"use client"

import { useState, useEffect, useMemo } from "react"
import { X, DownloadIcon, ChevronRight, ChevronLeft, Info, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ImageState } from "@/types/editor"

interface DownloadModalProps {
  isOpen: boolean
  imageState: ImageState
  onClose: () => void
  skipToDownload?: boolean
}

interface SourceInfo {
  business: string
  campaign: string
  campaignEnabled: boolean
  product: string
  productEnabled: boolean
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
]
const ASSET_TYPE_OPTIONS = ["Key Visual", "Rollup", "Banner", "Poster", "Illustration", "Photo"]

// Helper function to check if filename is Adobe Stock
function isAdobeStock(filename?: string): boolean {
  if (!filename) return false
  // Adobe Stock files typically have format like: Adobe Stock_123456789.jpg
  return /^Adobe\s+Stock[_\s]\d+/i.test(filename)
}

// Helper function to extract Adobe Stock ID
function extractAdobeStockId(filename?: string): string | null {
  if (!filename) return null
  const match = filename.match(/Adobe\s+Stock[_\s](\d+)/i)
  return match ? match[1] : null
}

// Generate filename based on new naming convention
function generateFileName(sourceInfo: SourceInfo, originalFileName?: string): string {
  // If Adobe Stock, keep original format: Adobe Stock_ID number
  if (isAdobeStock(originalFileName)) {
    const stockId = extractAdobeStockId(originalFileName)
    if (stockId) {
      return `Adobe Stock_${stockId}`
    }
  }

  // If nothing is filled in, keep original filename (without extension)
  if (!sourceInfo.business && !sourceInfo.campaign && !sourceInfo.product && !sourceInfo.assetType) {
    if (originalFileName) {
      // Remove extension
      return originalFileName.replace(/\.[^/.]+$/, "")
    }
    return "image"
  }

  const parts: string[] = []

  // 1. Division/Business name (if not Corporate)
  if (sourceInfo.business && sourceInfo.business !== "Corporate") {
    parts.push(sourceInfo.business.replace(/\s+/g, ""))
  }

  // 2. Campaign - if applicable
  if (sourceInfo.campaignEnabled && sourceInfo.campaign.trim()) {
    parts.push(sourceInfo.campaign.trim().replace(/\s+/g, "_"))
  }

  // 3. Product - if applicable
  if (sourceInfo.productEnabled && sourceInfo.product.trim()) {
    parts.push(sourceInfo.product.trim().replace(/\s+/g, "_"))
  }

  // 4. Asset type (if not Photo)
  if (sourceInfo.assetType && sourceInfo.assetType !== "Photo") {
    parts.push(sourceInfo.assetType.replace(/\s+/g, ""))
  }

  // Remove date, ratio, and format from parts (they might have been added)
  // This is handled by not including them in the first place

  return parts.length > 0 ? parts.join("_") : originalFileName?.replace(/\.[^/.]+$/, "") || "image"
}

export default function DownloadModal({ isOpen, imageState, onClose, skipToDownload = false }: DownloadModalProps) {
  const [step, setStep] = useState<ModalStep>("download")
  const [format, setFormat] = useState<"PNG" | "JPG">("JPG")
  const [transparentBg, setTransparentBg] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Metadata state
  const [sourceInfo, setSourceInfo] = useState<SourceInfo>({
    business: "",
    campaign: "",
    campaignEnabled: false,
    product: "",
    productEnabled: false,
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
  const [isApplyingMetadata, setIsApplyingMetadata] = useState(false)

  // Reset state when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setStep("download")
      setMetadataApplied(false)
      setSourceInfo({
        business: "",
        campaign: "",
        campaignEnabled: false,
        product: "",
        productEnabled: false,
        assetType: "",
      })
      setMetadata({
        title: "",
        description: "",
        tags: [],
      })
    } else if (!skipToDownload) {
      // If not skipping, start at metadata step 1
      setStep("metadata-step1")
    }
  }, [isOpen, skipToDownload])

  // Generate preview filename - all hooks must be called unconditionally before any early returns
  const previewFileName = useMemo(() => {
    return generateFileName(sourceInfo, imageState.originalFileName)
  }, [sourceInfo, imageState.originalFileName])

  const imageSize = `${imageState.width} x ${imageState.height} px`
  const canGenerateMetadata = sourceInfo.business && sourceInfo.assetType

  // Generate metadata with OpenAI
  const generateMetadata = async () => {
    if (!canGenerateMetadata) return

    setIsGenerating(true)
    try {
      // Build context string for API
      const contextParts: string[] = []
      if (sourceInfo.business) contextParts.push(sourceInfo.business)
      if (sourceInfo.campaignEnabled && sourceInfo.campaign) contextParts.push(`campaign: ${sourceInfo.campaign}`)
      if (sourceInfo.productEnabled && sourceInfo.product) contextParts.push(`product: ${sourceInfo.product}`)
      if (sourceInfo.assetType) contextParts.push(`asset type: ${sourceInfo.assetType}`)

      const response = await fetch("/api/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: imageState.currentUrl,
          sourceInformation: {
            business: sourceInfo.business,
            productCampaign: [sourceInfo.campaign, sourceInfo.product].filter(Boolean).join(", ") || "",
            assetType: sourceInfo.assetType,
          },
        }),
      })

      if (!response.ok) throw new Error("Failed to generate metadata")

      const result = await response.json()

      setMetadata({
        title: result.title || result.description?.split(".")[0] || "Image",
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

  const applyMetadata = async () => {
    setIsApplyingMetadata(true)
    // Simulate applying metadata (you can add actual API call here if needed)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setMetadataApplied(true)
    setIsApplyingMetadata(false)
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

      // Use generated filename or fallback
      const filename = metadataApplied
        ? `${previewFileName}.${format.toLowerCase()}`
        : imageState.originalFileName?.replace(/\.[^/.]+$/, "") || `image.${format.toLowerCase()}`

      const finalFilename = filename.endsWith(`.${format.toLowerCase()}`) ? filename : `${filename}.${format.toLowerCase()}`

      const a = document.createElement("a")
      a.href = dataUrl
      a.download = finalFilename
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

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto flex flex-col">
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
                    {metadataApplied ? `${previewFileName}.${format.toLowerCase()}` : `image.${format.toLowerCase()}`}
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
              <h2 className="text-2xl font-bold">Metadata suggestions</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Start by selecting the source information. The metadata will be generated automatically based on your
                input.
              </p>
            </div>

            <div className="p-6 flex flex-col lg:flex-row gap-6">
              {/* Image preview */}
              <div className="w-full lg:w-80 flex-shrink-0 space-y-3">
                <img
                  src={imageState.currentUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-auto rounded-lg border border-border"
                />
                <div className="flex items-center justify-between text-xs px-2 py-1.5 bg-muted/50 rounded">
                  <span className="text-muted-foreground">
                    {imageState.isAIGenerated ? "Likely" : "Not likely"} to be AI-generated
                  </span>
                  <span className="px-2 py-0.5 bg-muted rounded text-muted-foreground">
                    {imageState.isAIGenerated ? "75%" : "3%"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  <div className="font-medium mb-1">File name preview:</div>
                  <div className="text-foreground">{previewFileName}.jpg</div>
                </div>
              </div>

              {/* Form fields */}
              <div className="flex-1 space-y-5">
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium mb-2">
                    Division/Business name*
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                  </label>
                  <Select
                    value={sourceInfo.business}
                    onValueChange={(value) => setSourceInfo((prev) => ({ ...prev, business: value }))}
                  >
                    <SelectTrigger className="w-full h-10">
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

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Campaign name</label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={sourceInfo.campaignEnabled}
                        onCheckedChange={(checked) =>
                          setSourceInfo((prev) => ({ ...prev, campaignEnabled: checked, campaign: checked ? prev.campaign : "" }))
                        }
                        className="data-[state=checked]:bg-purple-600"
                      />
                    </div>
                  </div>
                  {sourceInfo.campaignEnabled && (
                    <input
                      type="text"
                      value={sourceInfo.campaign}
                      onChange={(e) => setSourceInfo((prev) => ({ ...prev, campaign: e.target.value }))}
                      placeholder="Type here..."
                      className="w-full p-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#E30613]"
                    />
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Product name</label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={sourceInfo.productEnabled}
                        onCheckedChange={(checked) =>
                          setSourceInfo((prev) => ({ ...prev, productEnabled: checked, product: checked ? prev.product : "" }))
                        }
                        className="data-[state=checked]:bg-purple-600"
                      />
                    </div>
                  </div>
                  {sourceInfo.productEnabled && (
                    <input
                      type="text"
                      value={sourceInfo.product}
                      onChange={(e) => setSourceInfo((prev) => ({ ...prev, product: e.target.value }))}
                      placeholder="Type here..."
                      className="w-full p-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#E30613]"
                    />
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-1 text-sm font-medium mb-2">
                    Asset type*
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                  </label>
                  <Select
                    value={sourceInfo.assetType}
                    onValueChange={(value) => setSourceInfo((prev) => ({ ...prev, assetType: value }))}
                  >
                    <SelectTrigger className="w-full h-10">
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

            <div className="p-6 border-t border-border flex justify-between">
              <Button variant="outline" onClick={onClose}>
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
              <h2 className="text-2xl font-bold">Metadata suggestions</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Start by selecting the source information. The metadata will be generated automatically based on your
                input.
              </p>
            </div>

            <div className="p-6 flex flex-col lg:flex-row gap-6">
              {/* Image preview */}
              <div className="w-full lg:w-80 flex-shrink-0 space-y-3">
                <img
                  src={imageState.currentUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-auto rounded-lg border border-border"
                />
                <div className="flex items-center justify-between text-xs px-2 py-1.5 bg-muted/50 rounded">
                  <span className="text-muted-foreground">
                    {imageState.isAIGenerated ? "Likely" : "Not likely"} to be AI-generated
                  </span>
                  <span className="px-2 py-0.5 bg-muted rounded text-muted-foreground">
                    {imageState.isAIGenerated ? "75%" : "3%"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  <div className="font-medium mb-1">File name preview:</div>
                  <div className="text-foreground">{previewFileName}.jpg</div>
                </div>
              </div>

              {/* Metadata fields */}
              <div className="flex-1 space-y-5">
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <input
                    type="text"
                    value={metadata.title}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, 200)
                      setMetadata((prev) => ({ ...prev, title: value }))
                    }}
                    className="w-full p-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#E30613]"
                    maxLength={200}
                  />
                  <div className="text-xs text-muted-foreground mt-1 text-right">
                    {metadata.title.length}/200
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <textarea
                    value={metadata.description}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, 400)
                      setMetadata((prev) => ({ ...prev, description: value }))
                    }}
                    rows={4}
                    className="w-full p-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#E30613] resize-none"
                    maxLength={400}
                  />
                  <div className="text-xs text-muted-foreground mt-1 text-right">
                    {metadata.description.length}/400
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">AI suggested tags</label>
                  <div className="flex flex-wrap gap-2">
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
              <Button
                onClick={applyMetadata}
                disabled={isApplyingMetadata}
                className="bg-[#E30613] hover:bg-[#c70510] text-white"
              >
                {isApplyingMetadata ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Applying metadata...
                  </>
                ) : (
                  "Apply Metadata"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
